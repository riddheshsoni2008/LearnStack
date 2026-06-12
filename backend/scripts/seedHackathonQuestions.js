const mongoose = require('mongoose');
const dotenv = require('dotenv');
const HackathonQuestion = require('../models/HackathonQuestion');
const User = require('../models/User'); // We need an admin user to attach to 'createdBy'

dotenv.config();

const QUESTIONS = [
  // ── SQL & Database ──
  {
    questionText: 'Which SQL statement is used to extract data from a database?',
    questionType: 'mcq', category: 'sql', difficulty: 'easy',
    options: [{ text: 'EXTRACT', isCorrect: false }, { text: 'SELECT', isCorrect: true }, { text: 'GET', isCorrect: false }, { text: 'OPEN', isCorrect: false }]
  },
  {
    questionText: 'What does ACID stand for in the context of databases?',
    questionType: 'mcq', category: 'database', difficulty: 'intermediate',
    options: [{ text: 'Atomicity, Consistency, Isolation, Durability', isCorrect: true }, { text: 'Accuracy, Completeness, Isolation, Data', isCorrect: false }, { text: 'Atomicity, Concurrency, Isolation, Durability', isCorrect: false }, { text: 'Automation, Consistency, Integrity, Durability', isCorrect: false }]
  },
  {
    questionText: 'Which type of database is MongoDB?',
    questionType: 'mcq', category: 'database', difficulty: 'easy',
    options: [{ text: 'Relational Database', isCorrect: false }, { text: 'Graph Database', isCorrect: false }, { text: 'Document-oriented NoSQL', isCorrect: true }, { text: 'Key-Value Store', isCorrect: false }]
  },

  // ── HTML & CSS ──
  {
    questionText: 'Which HTML attribute is used to define inline styles?',
    questionType: 'mcq', category: 'frontend', difficulty: 'easy',
    options: [{ text: 'class', isCorrect: false }, { text: 'style', isCorrect: true }, { text: 'font', isCorrect: false }, { text: 'styles', isCorrect: false }]
  },
  {
    questionText: 'In CSS, how do you select an element with id "demo"?',
    questionType: 'mcq', category: 'frontend', difficulty: 'easy',
    options: [{ text: '#demo', isCorrect: true }, { text: '.demo', isCorrect: false }, { text: 'demo', isCorrect: false }, { text: '*demo', isCorrect: false }]
  },
  {
    questionText: 'What is the default flex-direction of a flex container?',
    questionType: 'mcq', category: 'frontend', difficulty: 'intermediate',
    options: [{ text: 'column', isCorrect: false }, { text: 'row', isCorrect: true }, { text: 'row-reverse', isCorrect: false }, { text: 'column-reverse', isCorrect: false }]
  },

  // ── JavaScript & React ──
  {
    questionText: 'Which of the following is not a valid JavaScript variable declaration keyword?',
    questionType: 'mcq', category: 'frontend', difficulty: 'easy',
    options: [{ text: 'var', isCorrect: false }, { text: 'let', isCorrect: false }, { text: 'const', isCorrect: false }, { text: 'def', isCorrect: true }]
  },
  {
    questionText: 'What hook is used to handle side effects in React?',
    questionType: 'mcq', category: 'frontend', difficulty: 'intermediate',
    options: [{ text: 'useState', isCorrect: false }, { text: 'useEffect', isCorrect: true }, { text: 'useMemo', isCorrect: false }, { text: 'useContext', isCorrect: false }]
  },
  {
    questionText: 'How do you pass data from a parent component to a child component in React?',
    questionType: 'mcq', category: 'frontend', difficulty: 'easy',
    options: [{ text: 'Through State', isCorrect: false }, { text: 'Through Redux', isCorrect: false }, { text: 'Through Props', isCorrect: true }, { text: 'Through Context', isCorrect: false }]
  },


  {
    questionText: 'Which module is used to create a web server in standard Node.js without frameworks?',
    questionType: 'mcq', category: 'backend', difficulty: 'intermediate',
    options: [{ text: 'http', isCorrect: true }, { text: 'url', isCorrect: false }, { text: 'fs', isCorrect: false }, { text: 'path', isCorrect: false }]
  },
  {
    questionText: 'What does REST stand for?',
    questionType: 'mcq', category: 'backend', difficulty: 'easy',
    options: [{ text: 'Representational State Transfer', isCorrect: true }, { text: 'Remote Express Server Transfer', isCorrect: false }, { text: 'Representational Server Transfer', isCorrect: false }, { text: 'Remote State Transfer', isCorrect: false }]
  },
  {
    questionText: 'Which HTTP method is idempotent?',
    questionType: 'mcq', category: 'backend', difficulty: 'intermediate',
    options: [{ text: 'POST', isCorrect: false }, { text: 'PUT', isCorrect: true }, { text: 'PATCH', isCorrect: false }, { text: 'None of the above', isCorrect: false }]
  },

  // ── System Design & Logic ──
  {
    questionText: 'What is the main purpose of a Load Balancer?',
    questionType: 'mcq', category: 'system_design', difficulty: 'intermediate',
    options: [{ text: 'To encrypt data', isCorrect: false }, { text: 'To store static files', isCorrect: false }, { text: 'To distribute network or application traffic across multiple servers', isCorrect: true }, { text: 'To block malicious requests', isCorrect: false }]
  },
  {
    questionText: 'Which caching strategy removes the least recently used items first?',
    questionType: 'mcq', category: 'system_design', difficulty: 'intermediate',
    options: [{ text: 'FIFO', isCorrect: false }, { text: 'LIFO', isCorrect: false }, { text: 'LFU', isCorrect: false }, { text: 'LRU', isCorrect: true }]
  },

  // ── Cybersecurity Basics ──
  {
    questionText: 'What does XSS stand for?',
    questionType: 'mcq', category: 'cybersecurity', difficulty: 'intermediate',
    options: [{ text: 'Cross-Site Scripting', isCorrect: true }, { text: 'Extreme Secure Sockets', isCorrect: false }, { text: 'Cross-Server Security', isCorrect: false }, { text: 'XML Standard Security', isCorrect: false }]
  },
  {
    questionText: 'Which of the following hashes is considered cryptographically insecure and shouldn\'t be used for passwords?',
    questionType: 'mcq', category: 'cybersecurity', difficulty: 'advanced',
    options: [{ text: 'Argon2', isCorrect: false }, { text: 'bcrypt', isCorrect: false }, { text: 'MD5', isCorrect: true }, { text: 'PBKDF2', isCorrect: false }]
  },

  // ── Project Tasks (Round 3) ──
  {
    questionText: 'Build a Full-Stack Todo Application. It should have user authentication, task creation, reading, updating (mark as done), and deletion. Deploy it on Vercel/Render.',
    questionType: 'project', category: 'web_dev', difficulty: 'advanced',
    options: [], points: 100
  },
  {
    questionText: 'Create a Weather Dashboard that fetches data from a public API based on user search. Display current weather and a 5-day forecast. Style it beautifully.',
    questionType: 'project', category: 'frontend', difficulty: 'advanced',
    options: [], points: 100
  },
  {
    questionText: 'Develop a Real-time Chat application using WebSockets (or Socket.io). Users should be able to join rooms and send messages.',
    questionType: 'project', category: 'backend', difficulty: 'advanced',
    options: [], points: 100
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.findOne();
    }

    if (!admin) {
      console.error('❌ No user found in the database. Please create a user first.');
      process.exit(1);
    }

    await HackathonQuestion.deleteMany({});

    for (const q of QUESTIONS) {
      await HackathonQuestion.create({
        ...q,
        scope: 'global',
        points: q.points || 10,
        createdBy: admin._id
      });
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

seedData();
