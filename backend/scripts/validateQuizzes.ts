import mongoose from 'mongoose';
import dotenv from 'dotenv';

import stringSimilarity from 'string-similarity';
import path from 'path';

// Models
import Lesson from '../models/Lesson';
import Quiz from '../models/Quiz';

dotenv.config({ path: path.join(__dirname, '../.env') });

let ai: any;
const SIMILARITY_THRESHOLD = 0.70;

async function generateSingleQuestion(lessonSummary: any, existingQuestionsPool:any) {
  const prompt = `
Lesson Summary: ${JSON.stringify(lessonSummary)}
Generate exactly ONE unique quiz question that does not overlap with existing questions.
Output ONLY a single JSON object:
{"question": "text", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "1-2 sentences."}
`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: prompt,
    config: {
      systemInstruction: "Output ONLY a single JSON object. No markdown.",
      responseMimeType: "application/json",
      temperature: 0.9 
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (err) {
    return null;
  }
}

async function main() {
  try {
    const { GoogleGenAI } = await (eval("import('@google/genai')") as Promise<any>);
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    await mongoose.connect(process.env.MONGO_URI as any);
    console.log('✅ Connected to MongoDB');

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in .env");
    }

    const allQuizzes = await Quiz.find().populate('lessonId');
    console.log(`Found ${allQuizzes.length} quizzes to validate.\n`);

    let globalQuestions = [];
    let duplicateCount = 0;
    let totalQuestions = 0;

    for (const quiz of allQuizzes) {
      if (!quiz.lessonId) continue;
      
      let modified = false;

      for (let i = 0; i < quiz.questions.length; i++) {
        let currentQ = quiz.questions[i];
        totalQuestions++;

        if (globalQuestions.length > 0) {
          const matches = stringSimilarity.findBestMatch(currentQ.question, globalQuestions);
          if (matches.bestMatch.rating >= SIMILARITY_THRESHOLD) {
            duplicateCount++;
            console.log(`⚠️ Duplicate detected in "${(quiz.lessonId as any).title}":`);
            console.log(`   Question: ${currentQ.question}`);
            console.log(`   Matches: ${matches.bestMatch.target} (${(matches.bestMatch.rating * 100).toFixed(1)}%)`);
            
            console.log(`   🔄 Regenerating question...`);
            
            // Re-extract summary for prompt
            const lesson: any = quiz.lessonId;
            const summary = {
              title: lesson.title,
              description: lesson.description,
              topic: lesson.topic
            };
            
            const newQ = await generateSingleQuestion(summary, globalQuestions);
            if (newQ) {
              quiz.questions[i] = newQ;
              modified = true;
              console.log(`   ✅ Replaced with: ${newQ.question}\n`);
            } else {
              console.log(`   ❌ Failed to regenerate.\n`);
            }
          }
        }
        
        globalQuestions.push(quiz.questions[i].question);
      }

      if (modified) {
        await quiz.save();
      }
    }

    const dupPercentage = totalQuestions > 0 ? ((duplicateCount / totalQuestions) * 100).toFixed(2) : 0;
    console.log(`\n📊 Validation Report:`);
    console.log(`   Total Questions Scanned: ${totalQuestions}`);
    console.log(`   Duplicates Detected & Fixed: ${duplicateCount} (${dupPercentage}%)`);

    process.exit(0);
  } catch (err) {
    console.error("Fatal Error:", err);
    process.exit(1);
  }
}

main();
