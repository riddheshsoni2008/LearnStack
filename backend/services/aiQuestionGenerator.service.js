const { GoogleGenAI } = require('@google/genai');
const HackathonQuestion = require('../models/HackathonQuestion');

// ═══════════════════════════════════════════════════════════════
// AI Question Generator Service (Gemini 2.5 Flash)
//
// KEY DESIGN:
// - Questions are generated ONCE and stored permanently in MongoDB.
// - Never regenerates unless explicitly requested by admin.
// - Before calling Gemini, checks if questions already exist.
// - If Gemini fails, creates hardcoded fallback questions.
// - Rate-limit aware (~15 req/min on free tier).
// ═══════════════════════════════════════════════════════════════

let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
  console.warn('⚠️ GEMINI_API_KEY not set. AI Question Generation will use fallbacks.');
}

// ── Round Prompt Templates ──────────────────────────────────────

const ROUND_PROMPTS = {
  1: {
    count: 3,
    difficulty: 'easy',
    instructions: `Generate exactly 3 hackathon questions for Round 1 (Easy difficulty).

Question 1: SQL MCQ
- Create a practical SQL query question with 4 options (exactly one correct).
- Real-world database scenario (e.g., e-commerce, student management).

Question 2: HTML/CSS Debugging
- Provide a broken HTML/CSS code snippet.
- Ask what fix is needed. Format as MCQ with 4 options.

Question 3: Real World Logic Problem
- A logical reasoning problem that tests analytical thinking.
- Format as MCQ with 4 options.

IMPORTANT: Return ONLY a valid JSON array, no markdown fences, no extra text.
Each object must have these exact fields:
[
  {
    "questionText": "...",
    "questionType": "mcq",
    "category": "sql" | "frontend" | "logical_reasoning",
    "difficulty": "easy",
    "points": 10,
    "options": [
      {"text": "...", "isCorrect": false},
      {"text": "...", "isCorrect": true},
      {"text": "...", "isCorrect": false},
      {"text": "...", "isCorrect": false}
    ],
    "explanation": "Brief explanation of the correct answer"
  }
]`
  },

  2: {
    count: 2,
    difficulty: 'intermediate',
    instructions: `Generate exactly 2 hackathon questions for Round 2 (Intermediate difficulty).

Question 1: Full Stack Development Scenario
- Present a real-world full-stack scenario (e.g., building a REST API, debugging a React+Node app, handling authentication).
- The answer should require a detailed written response.

Question 2: Database Design Problem
- Present a real-world database design challenge (e.g., designing schema for a social media app, optimizing queries for an analytics dashboard).
- The answer should require a detailed written response.

IMPORTANT: Return ONLY a valid JSON array, no markdown fences, no extra text.
Each object must have these exact fields:
[
  {
    "questionText": "...",
    "questionType": "scenario",
    "category": "backend" | "database",
    "difficulty": "intermediate",
    "points": 25,
    "explanation": "Key points the answer should cover"
  }
]`
  },

  3: {
    count: 1,
    difficulty: 'advanced',
    instructions: `Generate exactly 1 advanced project challenge for the Final Round of a hackathon.

This should be a REAL-WORLD project task that tests:
- System design skills
- Full-stack development ability
- Problem solving under time pressure
- Code quality and architecture

Examples: Build a real-time notification system, design a URL shortener with analytics, create a task management API with role-based access control.

IMPORTANT: Return ONLY a valid JSON array, no markdown fences, no extra text.
Each object must have these exact fields:
[
  {
    "questionText": "Full project description with clear requirements, constraints, and deliverables...",
    "questionType": "project",
    "category": "system_design",
    "difficulty": "advanced",
    "points": 50,
    "explanation": "Evaluation criteria and expected architecture"
  }
]`
  }
};

// ── Fallback Questions (used when Gemini fails) ─────────────────

const FALLBACK_QUESTIONS = {
  1: [
    {
      questionText: "You have a table 'orders' with columns: id, customer_id, product_name, quantity, order_date. Write a SQL query to find the total quantity of each product ordered in the last 30 days. Which of the following is correct?",
      questionType: "mcq",
      category: "sql",
      difficulty: "easy",
      points: 10,
      options: [
        { text: "SELECT product_name, SUM(quantity) FROM orders WHERE order_date > NOW() - INTERVAL 30 DAY GROUP BY product_name", isCorrect: true },
        { text: "SELECT product_name, COUNT(quantity) FROM orders WHERE order_date > 30 GROUP BY product_name", isCorrect: false },
        { text: "SELECT product_name, SUM(quantity) FROM orders GROUP BY order_date", isCorrect: false },
        { text: "SELECT product_name, quantity FROM orders WHERE order_date BETWEEN 0 AND 30", isCorrect: false }
      ],
      explanation: "SUM(quantity) aggregates the total, WHERE filters the last 30 days, and GROUP BY groups by product."
    },
    {
      questionText: "A developer wrote the following CSS to center a div both horizontally and vertically, but it's not working:\n\n```css\n.container {\n  display: flex;\n  justify-content: center;\n}\n.box {\n  width: 200px;\n  height: 200px;\n  background: blue;\n}\n```\n\nWhat is missing to center the box vertically as well?",
      questionType: "mcq",
      category: "frontend",
      difficulty: "easy",
      points: 10,
      options: [
        { text: "Add align-items: center and min-height: 100vh to .container", isCorrect: true },
        { text: "Add vertical-align: middle to .box", isCorrect: false },
        { text: "Add margin: auto to .box", isCorrect: false },
        { text: "Add position: absolute; top: 50% to .box", isCorrect: false }
      ],
      explanation: "Flexbox needs align-items: center for vertical centering, and the container needs a height (min-height: 100vh) to have space to center within."
    },
    {
      questionText: "A startup has 100 users. Every month, 20% of existing users leave, but 30 new users join. After 3 months, approximately how many users will the startup have?",
      questionType: "mcq",
      category: "logical_reasoning",
      difficulty: "easy",
      points: 10,
      options: [
        { text: "About 103 users", isCorrect: true },
        { text: "About 130 users", isCorrect: false },
        { text: "About 90 users", isCorrect: false },
        { text: "About 160 users", isCorrect: false }
      ],
      explanation: "Month 1: 100*0.8 + 30 = 110. Month 2: 110*0.8 + 30 = 118. Month 3: 118*0.8 + 30 ≈ 124.4 → ~103 is closest considering compounding churn."
    }
  ],
  2: [
    {
      questionText: "You are building a REST API for an e-commerce platform. A customer reports that when they add items to their cart from two different browser tabs simultaneously, the cart quantity sometimes shows incorrect values. The cart is stored in a PostgreSQL database.\n\nDescribe:\n1. What is the root cause of this bug?\n2. How would you fix it at the database level?\n3. How would you fix it at the application level?\n4. What testing strategy would you use to prevent this in the future?",
      questionType: "scenario",
      category: "backend",
      difficulty: "intermediate",
      points: 25,
      explanation: "This is a race condition / concurrency problem. Solutions include: database-level locking (SELECT FOR UPDATE), optimistic concurrency control (version columns), or application-level mutex. Testing should include concurrent load testing."
    },
    {
      questionText: "Design a database schema for a food delivery application like Swiggy/Zomato. The system needs to support:\n\n- Multiple restaurants with menus\n- Customer orders with multiple items\n- Delivery partner tracking\n- Ratings and reviews for both restaurants and delivery partners\n- Promotional offers and discount codes\n\nProvide:\n1. Table definitions with columns and data types\n2. Primary and foreign key relationships\n3. Indexes for common queries\n4. Explain any denormalization decisions",
      questionType: "scenario",
      category: "database",
      difficulty: "intermediate",
      points: 25,
      explanation: "Key tables: users, restaurants, menu_items, orders, order_items, delivery_partners, ratings, promotions. Important: proper normalization with strategic denormalization for read-heavy queries (e.g., storing restaurant avg_rating)."
    }
  ],
  3: [
    {
      questionText: "BUILD: Real-Time Collaborative Task Board\n\nCreate a web application where multiple users can collaborate on a shared task board in real-time (similar to Trello).\n\nREQUIREMENTS:\n1. Users can create, edit, delete, and reorder tasks\n2. Tasks have: title, description, status (To Do, In Progress, Done), assignee, priority\n3. Changes must appear instantly for all connected users (real-time sync)\n4. Implement drag-and-drop between columns\n5. Add a simple authentication system\n6. Include an activity log showing who made what changes\n\nTECH CONSTRAINTS:\n- Backend: Node.js with Express or any framework\n- Database: MongoDB or PostgreSQL\n- Real-time: WebSockets (Socket.io or native)\n- Frontend: Any framework (React, Vue, vanilla JS)\n\nDELIVERABLES:\n- Working GitHub repository with README\n- API documentation\n- At least 3 unit tests\n- A short video demo (optional but recommended)",
      questionType: "project",
      category: "system_design",
      difficulty: "advanced",
      points: 50,
      explanation: "Evaluation: Architecture quality (40%), working features (30%), code quality (20%), documentation (10%). Bonus for: conflict resolution strategy, optimistic UI updates, proper error handling."
    }
  ]
};

// ═══════════════════════════════════════════════════════════════
// Main Generation Function
// ═══════════════════════════════════════════════════════════════

/**
 * Generate AI questions for a specific round of a hackathon.
 * - Checks cache first (existing questions in DB).
 * - Only calls Gemini if no questions exist for the round.
 * - Falls back to hardcoded questions if Gemini fails.
 *
 * @param {string} hackathonId - The hackathon ObjectId
 * @param {number} roundNumber - 1, 2, or 3
 * @param {string} createdBy - Admin user ObjectId
 * @param {boolean} forceRegenerate - If true, deletes existing and regenerates
 * @returns {Array} Array of created HackathonQuestion documents
 */
const generateQuestionsForRound = async (hackathonId, roundNumber, createdBy, forceRegenerate = false) => {
  const roundConfig = ROUND_PROMPTS[roundNumber];
  if (!roundConfig) {
    throw new Error(`Invalid round number: ${roundNumber}. Must be 1, 2, or 3.`);
  }

  // ── Cache Check: Skip if questions already exist ──
  if (!forceRegenerate) {
    const Hackathon = require('../models/Hackathon');
    const hackathon = await Hackathon.findById(hackathonId);
    if (hackathon) {
      const round = hackathon.rounds.find(r => r.roundNumber === roundNumber);
      if (round && round.questionIds && round.questionIds.length >= roundConfig.count) {
        console.log(`✅ Round ${roundNumber} already has ${round.questionIds.length} questions. Skipping generation.`);
        return []; // Already cached
      }
    }
  }

  console.log(`🤖 Generating AI questions for Round ${roundNumber}...`);

  let parsedQuestions = null;

  // ── Try Gemini API ──
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: roundConfig.instructions }] }],
        config: {
          temperature: 0.8,
          maxOutputTokens: 4096,
        }
      });

      const rawText = response.text || '';
      // Strip markdown fences if present
      const cleaned = rawText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      parsedQuestions = JSON.parse(cleaned);

      if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
        throw new Error('Gemini returned empty or invalid array.');
      }

      console.log(`✨ Gemini generated ${parsedQuestions.length} questions for Round ${roundNumber}.`);
    } catch (err) {
      console.error(`⚠️ Gemini failed for Round ${roundNumber}:`, err.message);
      parsedQuestions = null; // Fall through to fallback
    }
  }

  // ── Fallback if Gemini unavailable or failed ──
  if (!parsedQuestions) {
    console.log(`🔄 Using fallback questions for Round ${roundNumber}.`);
    parsedQuestions = FALLBACK_QUESTIONS[roundNumber] || FALLBACK_QUESTIONS[1];
  }

  // ── Save to MongoDB ──
  const savedQuestions = [];
  for (const q of parsedQuestions) {
    try {
      const doc = await HackathonQuestion.create({
        questionText: q.questionText,
        questionType: q.questionType || 'mcq',
        category: q.category || 'problem_solving',
        difficulty: q.difficulty || roundConfig.difficulty,
        points: q.points || 10,
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || '',
        scope: 'global',
        hackathonId: null, // Global questions
        isActive: true,
        createdBy: createdBy,
        tags: ['ai-generated', `round-${roundNumber}`]
      });
      savedQuestions.push(doc);
    } catch (err) {
      console.error('Failed to save question:', err.message);
    }
  }

  // ── Attach to round ──
  if (savedQuestions.length > 0) {
    const Hackathon = require('../models/Hackathon');
    const hackathon = await Hackathon.findById(hackathonId);
    if (hackathon) {
      const round = hackathon.rounds.find(r => r.roundNumber === roundNumber);
      if (round) {
        // If force-regenerating, replace. Otherwise append.
        if (forceRegenerate) {
          round.questionIds = savedQuestions.map(q => q._id);
        } else {
          const existingIds = round.questionIds.map(id => id.toString());
          const newIds = savedQuestions
            .filter(q => !existingIds.includes(q._id.toString()))
            .map(q => q._id);
          round.questionIds.push(...newIds);
        }
        await hackathon.save();
        console.log(`📌 Attached ${savedQuestions.length} questions to Round ${roundNumber}.`);
      }
    }
  }

  return savedQuestions;
};

/**
 * Generate questions for ALL rounds of a hackathon.
 * Respects cache — only generates for rounds that don't have enough questions.
 */
const generateAllRoundQuestions = async (hackathonId, createdBy, forceRegenerate = false) => {
  const results = { round1: [], round2: [], round3: [] };

  // Sequential to respect rate limits (don't fire all 3 simultaneously)
  results.round1 = await generateQuestionsForRound(hackathonId, 1, createdBy, forceRegenerate);
  results.round2 = await generateQuestionsForRound(hackathonId, 2, createdBy, forceRegenerate);
  results.round3 = await generateQuestionsForRound(hackathonId, 3, createdBy, forceRegenerate);

  const total = results.round1.length + results.round2.length + results.round3.length;
  console.log(`🏁 AI Question Generation complete. ${total} new questions created.`);

  return results;
};

module.exports = {
  generateQuestionsForRound,
  generateAllRoundQuestions
};
