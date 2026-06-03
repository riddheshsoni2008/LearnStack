const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Track = require('./models/Track');
const Lesson = require('./models/Lesson');
const Quiz = require('./models/Quiz');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Track.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    console.log('🗑️  Cleared old data');

    // ═══════════════════════════════════════
    // TRACK 1: HTML & CSS
    // ═══════════════════════════════════════
    const htmlTrack = await Track.create({
      title: 'HTML & CSS Basics',
      description: 'Build the foundation of every website. Learn HTML structure, CSS styling, Flexbox, Grid, and responsive design.',
      thumbnail: '',
      level: 'beginner',
      totalWeeks: 3,
      totalLessons: 6,
      order: 1,
      tags: ['html', 'css', 'web', 'beginner'],
      isPublished: true
    });

    // Week 1 Lessons
    const html_l1 = await Lesson.create({
      trackId: htmlTrack._id,
      weekNumber: 1,
      title: 'What is HTML?',
      description: 'Learn what HTML is, how it works, and write your first web page.',
      videoUrl: 'qz0aGYrrlhU',
      content: `HTML (HyperText Markup Language) is the standard language for creating web pages. Every website you visit is built with HTML at its core.\n\n**Key Points:**\n- HTML uses tags like \`<h1>\`, \`<p>\`, \`<div>\` to structure content\n- Tags come in pairs: opening \`<tag>\` and closing \`</tag>\`\n- The basic structure includes \`<html>\`, \`<head>\`, and \`<body>\`\n- HTML is NOT a programming language — it's a markup language`,
      codeSnippet: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My First Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>This is my first web page.</p>\n</body>\n</html>',
      language: 'html',
      xpReward: 10,
      order: 1,
      challenge: 'Create an HTML page with your name as the title, an h1 heading, and a paragraph about yourself.',
      resources: [
        { title: 'MDN HTML Basics', url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics' },
        { title: 'W3Schools HTML Tutorial', url: 'https://www.w3schools.com/html/' }
      ],
      isPublished: true
    });

    const html_l2 = await Lesson.create({
      trackId: htmlTrack._id,
      weekNumber: 1,
      title: 'HTML Tags & Elements',
      description: 'Learn about headings, paragraphs, links, images, lists, and more HTML elements.',
      videoUrl: 'HD13eq_Pmp8',
      content: `HTML has many tags for different purposes. Here are the most important ones:\n\n**Text Tags:** \`<h1>\` to \`<h6>\`, \`<p>\`, \`<span>\`, \`<strong>\`, \`<em>\`\n**Links:** \`<a href="url">Link Text</a>\`\n**Images:** \`<img src="url" alt="description">\`\n**Lists:** \`<ul>\` (unordered), \`<ol>\` (ordered), \`<li>\` (list item)\n**Divisions:** \`<div>\` for grouping, \`<section>\` for semantic sections`,
      codeSnippet: '<h1>Main Title</h1>\n<p>A paragraph with <strong>bold</strong> and <em>italic</em> text.</p>\n\n<a href="https://google.com">Visit Google</a>\n\n<img src="photo.jpg" alt="My Photo">\n\n<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>',
      language: 'html',
      xpReward: 10,
      order: 2,
      challenge: 'Create an HTML page with a heading, a paragraph, an image, a link, and an unordered list of 5 items.',
      isPublished: true
    });

    // Week 2 Lessons
    const html_l3 = await Lesson.create({
      trackId: htmlTrack._id,
      weekNumber: 2,
      title: 'Introduction to CSS',
      description: 'Learn how CSS works — selectors, properties, colors, fonts, and styling basics.',
      videoUrl: 'yfoY53QXEnI',
      content: `CSS (Cascading Style Sheets) controls how HTML elements look on screen.\n\n**3 Ways to Add CSS:**\n1. Inline: \`<p style="color: red">\`\n2. Internal: \`<style>\` tag in \`<head>\`\n3. External: separate \`.css\` file (best practice)\n\n**CSS Syntax:** \`selector { property: value; }\`\n\n**Common Properties:** color, background-color, font-size, margin, padding, border`,
      codeSnippet: '/* External CSS file: style.css */\n\nbody {\n  font-family: Arial, sans-serif;\n  background-color: #f0f0f0;\n  margin: 0;\n  padding: 20px;\n}\n\nh1 {\n  color: #333;\n  text-align: center;\n}\n\np {\n  color: #666;\n  font-size: 16px;\n  line-height: 1.6;\n}',
      language: 'css',
      xpReward: 15,
      order: 1,
      challenge: 'Style your HTML page — change the background color, font, heading color, and add padding.',
      isPublished: true
    });

    const html_l4 = await Lesson.create({
      trackId: htmlTrack._id,
      weekNumber: 2,
      title: 'CSS Box Model & Layout',
      description: 'Understand margin, padding, border, and how elements are sized in CSS.',
      videoUrl: 'rIO5326FgPE',
      content: `Every HTML element is a rectangular box. The CSS Box Model defines:\n\n**Content** → The actual text/image\n**Padding** → Space inside the border\n**Border** → The edge of the element\n**Margin** → Space outside the border\n\nUse \`box-sizing: border-box\` to make sizing easier — padding and border are included in the width.`,
      codeSnippet: '.card {\n  width: 300px;\n  padding: 20px;\n  margin: 10px auto;\n  border: 2px solid #ddd;\n  border-radius: 8px;\n  box-sizing: border-box;\n  background: white;\n  box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n}',
      language: 'css',
      xpReward: 15,
      order: 2,
      isPublished: true
    });

    // Week 3 Lessons
    const html_l5 = await Lesson.create({
      trackId: htmlTrack._id,
      weekNumber: 3,
      title: 'CSS Flexbox',
      description: 'Master Flexbox — the modern way to create flexible, responsive layouts.',
      videoUrl: 'JJSoEo8JSnc',
      content: `Flexbox is a CSS layout model that makes it easy to align and distribute space.\n\n**Container Properties:**\n- \`display: flex\` — activates flexbox\n- \`justify-content\` — horizontal alignment\n- \`align-items\` — vertical alignment\n- \`flex-direction\` — row or column\n- \`gap\` — space between items\n\n**Item Properties:**\n- \`flex: 1\` — grow to fill space\n- \`order\` — change visual order`,
      codeSnippet: '.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 20px;\n  min-height: 100vh;\n}\n\n.card {\n  flex: 1;\n  max-width: 300px;\n  padding: 20px;\n  background: white;\n  border-radius: 12px;\n}',
      language: 'css',
      xpReward: 20,
      order: 1,
      challenge: 'Create a navigation bar with a logo on the left and menu links on the right using Flexbox.',
      isPublished: true
    });

    const html_l6 = await Lesson.create({
      trackId: htmlTrack._id,
      weekNumber: 3,
      title: 'Responsive Design',
      description: 'Make your website look great on all devices using media queries.',
      videoUrl: 'srvUrASNj0s',
      content: `Responsive design makes your website adapt to different screen sizes.\n\n**Key Techniques:**\n1. Use \`%\` or \`vw/vh\` instead of fixed \`px\`\n2. Use \`max-width\` instead of \`width\`\n3. Use CSS Media Queries for breakpoints\n4. Mobile-first approach (design for small screens first)\n\n**Common Breakpoints:**\n- Mobile: < 768px\n- Tablet: 768px - 1024px\n- Desktop: > 1024px`,
      codeSnippet: '/* Mobile First */\n.container {\n  padding: 10px;\n}\n\n.grid {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n/* Tablet */\n@media (min-width: 768px) {\n  .grid {\n    flex-direction: row;\n    flex-wrap: wrap;\n  }\n  .grid > div {\n    flex: 1 1 45%;\n  }\n}\n\n/* Desktop */\n@media (min-width: 1024px) {\n  .container {\n    max-width: 1200px;\n    margin: 0 auto;\n  }\n}',
      language: 'css',
      xpReward: 20,
      order: 2,
      isPublished: true
    });

    // ═══════════════════════════════════════
    // TRACK 2: JavaScript Fundamentals
    // ═══════════════════════════════════════
    const jsTrack = await Track.create({
      title: 'JavaScript Fundamentals',
      description: 'Make websites interactive and dynamic. Learn variables, functions, DOM manipulation, events, arrays, objects, and ES6+ features.',
      level: 'beginner',
      totalWeeks: 4,
      totalLessons: 6,
      order: 2,
      tags: ['javascript', 'js', 'web', 'beginner'],
      isPublished: true
    });

    const js_l1 = await Lesson.create({
      trackId: jsTrack._id,
      weekNumber: 1,
      title: 'JavaScript Basics — Variables & Data Types',
      description: 'Learn about let, const, var, strings, numbers, booleans, and more.',
      videoUrl: 'W6NZfCO5SIk',
      content: `JavaScript is the programming language of the web. It makes websites interactive.\n\n**Variables:**\n- \`let\` — value can change\n- \`const\` — value cannot change\n- \`var\` — old way (avoid using)\n\n**Data Types:**\n- String: \`"hello"\`\n- Number: \`42\`, \`3.14\`\n- Boolean: \`true\`, \`false\`\n- Array: \`[1, 2, 3]\`\n- Object: \`{ name: "John" }\`\n- Null & Undefined`,
      codeSnippet: '// Variables\nlet name = "Riddhesh";\nconst age = 21;\nlet isStudent = true;\n\n// Arrays\nlet skills = ["HTML", "CSS", "JavaScript"];\n\n// Objects\nlet user = {\n  name: "Riddhesh",\n  age: 21,\n  skills: ["HTML", "CSS", "JS"]\n};\n\nconsole.log(user.name);    // "Riddhesh"\nconsole.log(skills[0]);    // "HTML"\nconsole.log(typeof age);   // "number"',
      language: 'javascript',
      xpReward: 10,
      order: 1,
      challenge: 'Create variables for your name, age, and a list of your skills. Log them to the console.',
      isPublished: true
    });

    const js_l2 = await Lesson.create({
      trackId: jsTrack._id,
      weekNumber: 1,
      title: 'Functions & Conditionals',
      description: 'Learn how to write functions, if/else statements, and ternary operators.',
      videoUrl: 'xUI5Tsl2JpY',
      content: `Functions are reusable blocks of code.\n\n**Function Types:**\n1. Regular: \`function greet() {}\`\n2. Arrow: \`const greet = () => {}\`\n3. Expression: \`const greet = function() {}\`\n\n**Conditionals:**\n- \`if / else if / else\`\n- \`switch\` statement\n- Ternary: \`condition ? valueIfTrue : valueIfFalse\``,
      codeSnippet: '// Arrow function\nconst greet = (name) => {\n  return `Hello, ${name}!`;\n};\n\nconsole.log(greet("Riddhesh")); // "Hello, Riddhesh!"\n\n// Conditional\nconst age = 21;\n\nif (age >= 18) {\n  console.log("You are an adult");\n} else {\n  console.log("You are a minor");\n}\n\n// Ternary\nconst status = age >= 18 ? "Adult" : "Minor";',
      language: 'javascript',
      xpReward: 15,
      order: 2,
      isPublished: true
    });

    const js_l3 = await Lesson.create({
      trackId: jsTrack._id,
      weekNumber: 2,
      title: 'Arrays & Array Methods',
      description: 'Master map, filter, reduce, forEach, find, and other powerful array methods.',
      videoUrl: 'rRgD1yVwIvE',
      content: `Arrays store multiple values. JavaScript provides powerful methods to work with them.\n\n**Most Used Methods:**\n- \`map()\` — transform each item\n- \`filter()\` — keep items that pass a test\n- \`find()\` — find first matching item\n- \`forEach()\` — loop through items\n- \`reduce()\` — reduce to single value\n- \`push()\` / \`pop()\` — add/remove from end\n- \`includes()\` — check if item exists`,
      codeSnippet: 'const numbers = [1, 2, 3, 4, 5];\n\n// Map - double each number\nconst doubled = numbers.map(n => n * 2);\n// [2, 4, 6, 8, 10]\n\n// Filter - keep even numbers\nconst evens = numbers.filter(n => n % 2 === 0);\n// [2, 4]\n\n// Find - first number > 3\nconst found = numbers.find(n => n > 3);\n// 4\n\n// Reduce - sum all\nconst sum = numbers.reduce((acc, n) => acc + n, 0);\n// 15',
      language: 'javascript',
      xpReward: 20,
      order: 1,
      challenge: 'Create an array of 10 numbers. Use map to square them, filter to keep only numbers > 25.',
      isPublished: true
    });

    const js_l4 = await Lesson.create({
      trackId: jsTrack._id,
      weekNumber: 2,
      title: 'DOM Manipulation',
      description: 'Learn how to select, modify, and create HTML elements with JavaScript.',
      videoUrl: 'y17RuWkWdn8',
      content: `The DOM (Document Object Model) lets JavaScript interact with HTML.\n\n**Select Elements:**\n- \`document.getElementById()\`\n- \`document.querySelector()\`\n- \`document.querySelectorAll()\`\n\n**Modify Elements:**\n- \`.textContent\` — change text\n- \`.innerHTML\` — change HTML\n- \`.style\` — change CSS\n- \`.classList.add()\` — add CSS class\n\n**Create Elements:**\n- \`document.createElement()\`\n- \`parent.appendChild()\``,
      codeSnippet: '// Select element\nconst title = document.querySelector("h1");\n\n// Change text\ntitle.textContent = "Hello LearnStack!";\n\n// Change style\ntitle.style.color = "#6c5ce7";\n\n// Add event listener\nconst btn = document.querySelector("#myBtn");\nbtn.addEventListener("click", () => {\n  alert("Button clicked!");\n});\n\n// Create new element\nconst newDiv = document.createElement("div");\nnewDiv.textContent = "I was created by JS!";\ndocument.body.appendChild(newDiv);',
      language: 'javascript',
      xpReward: 20,
      order: 2,
      isPublished: true
    });

    const js_l5 = await Lesson.create({
      trackId: jsTrack._id,
      weekNumber: 3,
      title: 'Async JavaScript — Promises & Fetch',
      description: 'Learn about asynchronous code, promises, async/await, and fetching data from APIs.',
      videoUrl: 'PoRJizFvM7s',
      content: `Async code lets JavaScript do things without blocking — like fetching data from a server.\n\n**Callback → Promise → Async/Await** (evolution)\n\n**Promise:**\n- \`.then()\` — runs when resolved\n- \`.catch()\` — runs when rejected\n\n**Async/Await:** (cleaner syntax)\n- \`async function\` — makes function return a promise\n- \`await\` — waits for promise to resolve\n\n**Fetch API:** built-in way to make HTTP requests`,
      codeSnippet: '// Fetch data from API\nconst fetchUsers = async () => {\n  try {\n    const response = await fetch("https://jsonplaceholder.typicode.com/users");\n    const users = await response.json();\n    \n    users.forEach(user => {\n      console.log(user.name);\n    });\n  } catch (error) {\n    console.error("Error:", error);\n  }\n};\n\nfetchUsers();',
      language: 'javascript',
      xpReward: 25,
      order: 1,
      isPublished: true
    });

    const js_l6 = await Lesson.create({
      trackId: jsTrack._id,
      weekNumber: 3,
      title: 'ES6+ Features',
      description: 'Destructuring, spread operator, template literals, modules, and more modern JavaScript.',
      videoUrl: 'NCwa_xi0Uuc',
      content: `Modern JavaScript (ES6+) introduced many useful features:\n\n**Destructuring:** Extract values from objects/arrays\n**Spread Operator:** \`...\` to expand arrays/objects\n**Template Literals:** \`\`backtick strings with \${variables}\`\`\n**Modules:** \`import\` / \`export\` for code organization\n**Optional Chaining:** \`user?.address?.city\`\n**Nullish Coalescing:** \`value ?? defaultValue\``,
      codeSnippet: '// Destructuring\nconst { name, age } = { name: "Riddhesh", age: 21 };\nconst [first, second] = [10, 20];\n\n// Spread\nconst arr1 = [1, 2, 3];\nconst arr2 = [...arr1, 4, 5]; // [1,2,3,4,5]\n\nconst obj1 = { a: 1 };\nconst obj2 = { ...obj1, b: 2 }; // {a:1, b:2}\n\n// Template literals\nconst greeting = `Hello ${name}, you are ${age}!`;\n\n// Optional chaining\nconst city = user?.address?.city ?? "Unknown";',
      language: 'javascript',
      xpReward: 25,
      order: 2,
      isPublished: true
    });

    // ═══════════════════════════════════════
    // QUIZZES
    // ═══════════════════════════════════════
    
    // Quiz for HTML Lesson 1
    await Quiz.create({
      lessonId: html_l1._id,
      questions: [
        { question: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], correctAnswer: 0, explanation: 'HTML = HyperText Markup Language' },
        { question: 'Which tag is used for the largest heading?', options: ['<heading>', '<h6>', '<h1>', '<head>'], correctAnswer: 2, explanation: '<h1> is the largest heading tag, <h6> is the smallest' },
        { question: 'HTML is a programming language.', options: ['True', 'False'], correctAnswer: 1, explanation: 'HTML is a markup language, not a programming language' },
        { question: 'Which tag is used to create a paragraph?', options: ['<paragraph>', '<p>', '<para>', '<text>'], correctAnswer: 1, explanation: '<p> tag is used for paragraphs' },
        { question: 'Where should the <title> tag be placed?', options: ['Inside <body>', 'Inside <head>', 'After </html>', 'Inside <footer>'], correctAnswer: 1, explanation: '<title> goes inside the <head> section' }
      ],
      passingScore: 60
    });

    // Quiz for CSS Intro
    await Quiz.create({
      lessonId: html_l3._id,
      questions: [
        { question: 'What does CSS stand for?', options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'], correctAnswer: 1, explanation: 'CSS = Cascading Style Sheets' },
        { question: 'Which is the best way to add CSS?', options: ['Inline styles', 'Internal <style> tag', 'External .css file', 'All are equally good'], correctAnswer: 2, explanation: 'External CSS files are the best practice for maintainability' },
        { question: 'Which property changes text color?', options: ['font-color', 'text-color', 'color', 'foreground-color'], correctAnswer: 2, explanation: 'The "color" property is used to change text color' },
        { question: 'What does the "margin" property control?', options: ['Space inside the border', 'The border width', 'Space outside the border', 'The text size'], correctAnswer: 2, explanation: 'Margin controls the space outside the element border' },
        { question: 'Which CSS selector selects all <p> elements?', options: ['#p', '.p', 'p', '*p'], correctAnswer: 2, explanation: 'Just "p" is the element/tag selector for all paragraphs' }
      ],
      passingScore: 60
    });

    // Quiz for JS Basics
    await Quiz.create({
      lessonId: js_l1._id,
      questions: [
        { question: 'Which keyword declares a variable that cannot be reassigned?', options: ['var', 'let', 'const', 'static'], correctAnswer: 2, explanation: 'const declares a constant — its value cannot be reassigned' },
        { question: 'What is the output of: typeof "hello"?', options: ['text', 'string', 'String', 'char'], correctAnswer: 1, explanation: 'typeof "hello" returns "string" (lowercase)' },
        { question: 'Which is NOT a JavaScript data type?', options: ['Boolean', 'Integer', 'String', 'Object'], correctAnswer: 1, explanation: 'JavaScript has Number (not Integer). Numbers include both integers and decimals.' },
        { question: 'How do you access the first item of an array?', options: ['array[1]', 'array.first()', 'array[0]', 'array.get(0)'], correctAnswer: 2, explanation: 'Arrays are 0-indexed, so the first item is array[0]' },
        { question: 'Which symbol is used for template literals?', options: ['Single quotes \'\'', 'Double quotes ""', 'Backticks ``', 'Parentheses ()'], correctAnswer: 2, explanation: 'Backticks `` are used for template literals with ${} expressions' }
      ],
      passingScore: 60
    });

    // Quiz for Arrays
    await Quiz.create({
      lessonId: js_l3._id,
      questions: [
        { question: 'What does .map() return?', options: ['A boolean', 'A new array', 'A number', 'undefined'], correctAnswer: 1, explanation: '.map() creates a new array by transforming each element' },
        { question: 'What does .filter() do?', options: ['Sorts the array', 'Returns first match', 'Returns a new array of elements passing a test', 'Removes duplicates'], correctAnswer: 2, explanation: '.filter() creates a new array with elements that pass the test' },
        { question: '[1,2,3].push(4) adds 4 to which position?', options: ['Beginning', 'End', 'Middle', 'Random'], correctAnswer: 1, explanation: '.push() adds elements to the end of the array' },
        { question: 'What does .includes("a") return?', options: ['The index', 'true or false', 'The item', 'A new array'], correctAnswer: 1, explanation: '.includes() returns a boolean — true if the item exists, false if not' },
        { question: 'What does .find() return?', options: ['An array of matches', 'The first matching element', 'true or false', 'The index'], correctAnswer: 1, explanation: '.find() returns the first element that passes the test' }
      ],
      passingScore: 60
    });

    console.log('✅ Seed data created successfully!');
    console.log(`   📚 Tracks: 2`);
    console.log(`   📖 Lessons: 12`);
    console.log(`   🧪 Quizzes: 4`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedData();
