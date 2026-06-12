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
    instructions: `Generate exactly 3 hackathon questions for Round 1. The UI label shows "Easy" but the questions should be GENUINELY CHALLENGING — test real thinking ability, not textbook basics.

Question 1: SQL Problem Solving (MCQ)
- Create a complex SQL question involving multi-table JOINs, subqueries, window functions, or GROUP BY with HAVING.
- Use a realistic scenario (e-commerce analytics, HR payroll, inventory management).
- All 4 options should look plausible. The wrong options should contain subtle but real mistakes.

Question 2: HTML/CSS/Frontend Debugging (MCQ)
- Present a non-trivial HTML/CSS bug: CSS specificity conflicts, z-index stacking context issues, flexbox/grid edge cases, or unexpected inheritance.
- Show a realistic code snippet and ask what the fix is.
- All 4 options should be reasonable-looking fixes, but only one is correct.

Question 3: Logic & Algorithmic Thinking (MCQ)
- A real algorithmic or logical reasoning problem — not basic math.
- Could involve: time complexity analysis, recursion tracing, state machine transitions, or optimization puzzles.
- All 4 options should require careful thought to evaluate.

CRITICAL: Randomize the position of the correct answer across questions!
- Question 1: Place correct answer as option B (index 1)
- Question 2: Place correct answer as option D (index 3)
- Question 3: Place correct answer as option A (index 0)

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
      questionText: "Given tables `employees(id, name, department_id, salary)` and `departments(id, name)`, you need to find employees whose salary is above the average salary of their own department. Which query correctly solves this?\n\nNote: The query must work correctly even if a department has only one employee.",
      questionType: "mcq",
      category: "sql",
      difficulty: "easy",
      points: 10,
      options: [
        { text: "SELECT e.name FROM employees e JOIN departments d ON e.department_id = d.id WHERE e.salary > AVG(e.salary) GROUP BY e.department_id", isCorrect: false },
        { text: "SELECT e.name FROM employees e WHERE e.salary > (SELECT AVG(salary) FROM employees GROUP BY department_id)", isCorrect: false },
        { text: "SELECT e.name FROM employees e WHERE e.salary > (SELECT AVG(e2.salary) FROM employees e2 WHERE e2.department_id = e.department_id)", isCorrect: true },
        { text: "SELECT e.name FROM employees e HAVING e.salary > AVG(e.salary) OVER (PARTITION BY e.department_id)", isCorrect: false }
      ],
      explanation: "A correlated subquery is needed here. Option C correctly correlates the subquery to the outer query's department_id, computing the average per-department. Option A fails because you can't use WHERE with aggregate functions directly. Option B's subquery returns multiple rows without correlation. Option D incorrectly uses HAVING with a window function."
    },
    {
      questionText: "A developer has the following CSS and HTML. The `.modal` should appear above the `.sidebar`, but it renders behind it. Why?\n\n```html\n<div class=\"sidebar-container\">\n  <div class=\"sidebar\">Sidebar</div>\n</div>\n<div class=\"modal-container\">\n  <div class=\"modal\">Modal</div>\n</div>\n```\n\n```css\n.sidebar-container { position: relative; z-index: 10; }\n.sidebar { position: absolute; z-index: 1; }\n.modal-container { position: relative; z-index: 5; }\n.modal { position: fixed; z-index: 9999; }\n```",
      questionType: "mcq",
      category: "frontend",
      difficulty: "easy",
      points: 10,
      options: [
        { text: "The .modal's z-index (9999) is scoped to .modal-container's stacking context (z-index: 5), which is lower than .sidebar-container's stacking context (z-index: 10). The fix is to set .modal-container's z-index higher than 10, or remove it to avoid creating a stacking context.", isCorrect: true },
        { text: "The .modal needs `position: absolute` instead of `position: fixed` to break out of the stacking context.", isCorrect: false },
        { text: "The z-index on .modal is being overridden by the CSS cascade. Adding `!important` to .modal's z-index will fix this.", isCorrect: false },
        { text: "The .sidebar has `position: absolute` which always takes priority over `position: fixed` in the rendering order.", isCorrect: false }
      ],
      explanation: "This is a CSS stacking context problem. When a parent creates a stacking context (via position + z-index), all children's z-index values are scoped within that context. The .modal-container has z-index: 5, so no matter how high .modal's z-index is (9999), it can't exceed the parent's stacking context level of 5 compared to .sidebar-container's 10."
    },
    {
      questionText: "Consider the following recursive function:\n\n```javascript\nfunction mystery(n) {\n  if (n <= 1) return n;\n  return mystery(n - 1) + mystery(n - 2);\n}\n```\n\nHow many total function calls (including the initial call) are made when executing `mystery(6)`?",
      questionType: "mcq",
      category: "logical_reasoning",
      difficulty: "easy",
      points: 10,
      options: [
        { text: "13", isCorrect: false },
        { text: "15", isCorrect: false },
        { text: "21", isCorrect: false },
        { text: "25", isCorrect: true }
      ],
      explanation: "This is the Fibonacci function. The total call count follows the pattern: calls(n) = calls(n-1) + calls(n-2) + 1. calls(0)=1, calls(1)=1, calls(2)=3, calls(3)=5, calls(4)=9, calls(5)=15, calls(6)=25. Each call branches into two recursive calls until reaching the base cases, creating an exponential call tree."
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

    } catch (err) {
      parsedQuestions = null; // Fall through to fallback
    }
  }

  // ── Fallback if Gemini unavailable or failed ──
  if (!parsedQuestions) {
    parsedQuestions = FALLBACK_QUESTIONS[roundNumber] || FALLBACK_QUESTIONS[1];
  }

  // ── Save to MongoDB ──
  const savedQuestions = [];
  for (const q of parsedQuestions) {
    try {
      const doc = await HackathonQuestion.create({
        questionText: q.questionText,
        questionType: q.questionType || 'mcq',
        category: ['web_dev', 'frontend', 'backend', 'database', 'sql', 'ai_ml', 'cybersecurity', 'cloud_computing', 'problem_solving', 'logical_reasoning', 'system_design'].includes(q.category) ? q.category : 'problem_solving',
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

  return results;
};

module.exports = {
  generateQuestionsForRound,
  generateAllRoundQuestions
};
