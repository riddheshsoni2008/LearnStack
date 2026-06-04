const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');
const stringSimilarity = require('string-similarity');
const path = require('path');

// Models
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');

dotenv.config({ path: path.join(__dirname, '../.env') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const args = process.argv.slice(2);
const FORCE_REGENERATE = args.includes('--force');
const BATCH_SIZE = 10;
const SIMILARITY_THRESHOLD = 0.70;

// System Instructions for Gemini
const SYSTEM_PROMPT = `
You are an expert full-stack curriculum developer.
Generate exactly 5 highly unique, specific quiz questions for a lesson.
Rules:
1. Output ONLY valid JSON array containing exactly 5 objects. No markdown formatting, no code blocks around the JSON.
2. Structure: [{"question": "text", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "1-2 sentences."}]
3. Distribution: 2 Beginner, 2 Conceptual, 1 Practical/Code.
4. Explanations must be concise.
5. Questions must test the specific lesson content provided in the JSON summary, avoid generic web dev questions.
`;

// Helper: Local Content Extraction (Token Saver)
const extractSummary = (lesson) => {
  let text = lesson.content || '';
  
  // Extract keywords (e.g., strong or bold text)
  const boldMatches = text.match(/\*\*(.*?)\*\*/g) || [];
  const keywords = boldMatches.map(m => m.replace(/\*\*/g, '')).slice(0, 5);

  // Extract bullet points for concepts
  const bulletMatches = text.match(/^[-*]\s+(.*)$/gm) || [];
  const concepts = bulletMatches.map(m => m.replace(/^[-*]\s+/, '')).slice(0, 3);

  // Extract code snippets (max 2)
  const codeMatches = text.match(/```[\s\S]*?```/g) || [];
  const codes = codeMatches.slice(0, 2).map(c => c.replace(/```/g, '').trim());

  if (lesson.codeSnippet) {
    codes.push(lesson.codeSnippet);
  }

  return {
    title: lesson.title,
    topic: lesson.topic,
    description: lesson.description,
    keywords,
    concepts,
    codeSnippets: codes.slice(0, 2)
  };
};

async function getExistingQuestions() {
  const quizzes = await Quiz.find({}, 'questions.question').lean();
  return quizzes.flatMap(q => q.questions.map(qt => qt.question));
}

async function generateWithGemini(promptText) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: promptText,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.7
    }
  });
  
  try {
    return JSON.parse(response.text);
  } catch (err) {
    console.error("Failed to parse Gemini response:", response.text);
    return null;
  }
}

async function generateSingleQuestion(lessonSummary, existingQuestions, retryType = "Beginner") {
  const prompt = `
Lesson Summary: ${JSON.stringify(lessonSummary)}
Generate exactly ONE unique ${retryType} question that does not overlap with existing common questions.
Output ONLY a single JSON object (not an array):
{"question": "text", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "1-2 sentences."}
`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: "Output ONLY a single JSON object. No markdown.",
      responseMimeType: "application/json",
      temperature: 0.9 // Higher temp to ensure uniqueness on retry
    }
  });

  try {
    const q = JSON.parse(response.text);
    return q;
  } catch (err) {
    return null;
  }
}

async function processLesson(lesson, existingQuestionsPool) {
  const summary = extractSummary(lesson);
  const promptText = `Generate 5 questions for this lesson:\n${JSON.stringify(summary)}`;
  
  let questions = await generateWithGemini(promptText);
  if (!questions || !Array.isArray(questions) || questions.length !== 5) {
    console.log(`⚠️ Invalid initial generation for lesson: ${lesson.title}`);
    return null;
  }

  // Duplicate Check & Fine-grained Retry
  for (let i = 0; i < questions.length; i++) {
    let currentQ = questions[i];
    let isDuplicate = false;
    let retries = 0;

    do {
      isDuplicate = false;
      if (existingQuestionsPool.length > 0) {
        const matches = stringSimilarity.findBestMatch(currentQ.question, existingQuestionsPool);
        if (matches.bestMatch.rating >= SIMILARITY_THRESHOLD) {
          isDuplicate = true;
          console.log(`🔁 Duplicate detected (${(matches.bestMatch.rating*100).toFixed(1)}%): "${currentQ.question.substring(0,30)}..."`);
          
          if (retries < 2) {
            retries++;
            const type = i < 2 ? "Beginner" : i < 4 ? "Conceptual" : "Practical";
            const newQ = await generateSingleQuestion(summary, existingQuestionsPool, type);
            if (newQ) currentQ = newQ;
          } else {
            console.log(`❌ Max retries reached for question. Keeping it anyway.`);
            break;
          }
        }
      }
    } while (isDuplicate && retries < 2);
    
    questions[i] = currentQ;
    // Add new question to pool to prevent self-duplicates
    existingQuestionsPool.push(currentQ.question);
  }

  return questions;
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in .env");
    }

    const allLessons = await Lesson.find().sort({ trackId: 1, order: 1 });
    console.log(`Found ${allLessons.length} lessons in DB.`);

    let existingQuestionsPool = await getExistingQuestions();
    console.log(`Loaded ${existingQuestionsPool.length} existing questions into memory for duplicate detection.`);

    let processedCount = 0;
    
    for (let i = 0; i < allLessons.length; i += BATCH_SIZE) {
      const batch = allLessons.slice(i, i + BATCH_SIZE);
      console.log(`\n📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(allLessons.length/BATCH_SIZE)}...`);

      const promises = batch.map(async (lesson) => {
        // Skip if quiz exists and not forcing
        const existingQuiz = await Quiz.findOne({ lessonId: lesson._id });
        if (existingQuiz && !FORCE_REGENERATE) {
          return { status: 'skipped', title: lesson.title };
        }

        try {
          const generatedQuestions = await processLesson(lesson, existingQuestionsPool);
          if (!generatedQuestions) return { status: 'failed', title: lesson.title };

          if (existingQuiz) {
            existingQuiz.questions = generatedQuestions;
            await existingQuiz.save();
          } else {
            await Quiz.create({
              lessonId: lesson._id,
              questions: generatedQuestions
            });
          }
          return { status: 'success', title: lesson.title };
        } catch (err) {
          console.error(`Error processing ${lesson.title}:`, err.message);
          return { status: 'failed', title: lesson.title };
        }
      });

      const results = await Promise.allSettled(promises);
      
      const successes = results.filter(r => r.value?.status === 'success').length;
      const skipped = results.filter(r => r.value?.status === 'skipped').length;
      processedCount += successes;
      
      console.log(`Batch complete. Success: ${successes}, Skipped: ${skipped}`);
      
      // Artificial delay to prevent API rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n🎉 Quiz Generation Complete! Successfully generated/updated ${processedCount} quizzes.`);
    process.exit(0);
  } catch (err) {
    console.error("Fatal Error:", err);
    process.exit(1);
  }
}

main();
