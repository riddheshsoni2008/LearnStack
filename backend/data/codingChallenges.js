const codingChallenges = {
  html: [
    { title: "Create a Heading", description: "Create an h1 tag that says 'Hello World'", starterCode: "<!-- Write your HTML below -->\n", expectedOutput: "<h1>Hello World</h1>", hint: "Use the <h1> tag" },
    { title: "Build a Link", description: "Create an anchor tag linking to https://google.com with text 'Visit Google'", starterCode: "<!-- Create your link below -->\n", expectedOutput: '<a href="https://google.com">Visit Google</a>', hint: "Use the <a> tag with href attribute" },
    { title: "Image Tag", description: "Create an img tag with src='logo.png' and alt='Logo'", starterCode: "<!-- Add your image tag -->\n", expectedOutput: '<img src="logo.png" alt="Logo">', hint: "Use <img> with src and alt attributes" },
  ],
  css: [
    { title: "Center a Div", description: "Write CSS to center a div using flexbox. Target the .container class.", starterCode: ".container {\n  /* Add flexbox centering */\n\n}", expectedOutput: "display: flex;\njustify-content: center;\nalign-items: center;", hint: "Use display: flex with justify-content and align-items" },
    { title: "Change Background", description: "Set the body background to #1a1a2e and text color to white.", starterCode: "body {\n  /* Add styles */\n\n}", expectedOutput: "background: #1a1a2e;\ncolor: white;", hint: "Use background and color properties" },
    { title: "Responsive Font", description: "Write a media query that sets font-size to 14px on screens below 768px.", starterCode: "/* Write your media query */\n", expectedOutput: "@media (max-width: 768px) {\n  body { font-size: 14px; }\n}", hint: "Use @media with max-width" },
  ],
  js: [
    { title: "Reverse a String", description: "Write a function that reverses a string. Example: 'hello' → 'olleh'", starterCode: "function reverseString(str) {\n  // Your code here\n\n}\n\nconsole.log(reverseString('hello'));", expectedOutput: "olleh", hint: "Use split(''), reverse(), and join('')" },
    { title: "Find the Max", description: "Write a function that returns the largest number in an array.", starterCode: "function findMax(arr) {\n  // Your code here\n\n}\n\nconsole.log(findMax([3, 7, 2, 9, 1]));", expectedOutput: "9", hint: "Use Math.max() with spread operator" },
    { title: "FizzBuzz", description: "Print numbers 1-15. For multiples of 3 print 'Fizz', multiples of 5 print 'Buzz', both print 'FizzBuzz'.", starterCode: "function fizzBuzz() {\n  // Your code here\n\n}\n\nfizzBuzz();", expectedOutput: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", hint: "Use a for loop with modulo (%) operator" },
    { title: "Count Vowels", description: "Write a function that counts vowels in a string.", starterCode: "function countVowels(str) {\n  // Your code here\n\n}\n\nconsole.log(countVowels('javascript'));", expectedOutput: "3", hint: "Use a regex match or loop through 'aeiou'" },
    { title: "Palindrome Check", description: "Write a function that checks if a string is a palindrome.", starterCode: "function isPalindrome(str) {\n  // Your code here\n\n}\n\nconsole.log(isPalindrome('racecar'));", expectedOutput: "true", hint: "Compare original string with its reverse" },
  ],
  react: [
    { title: "Create a Component", description: "Write a functional React component called Greeting that displays 'Hello, React!'", starterCode: "// Write your React component\nfunction Greeting() {\n  // Return JSX here\n\n}", expectedOutput: "function Greeting() {\n  return <h1>Hello, React!</h1>;\n}", hint: "Return JSX with an h1 tag" },
    { title: "useState Counter", description: "Create a counter component using the useState hook.", starterCode: "import { useState } from 'react';\n\nfunction Counter() {\n  // Add state and return JSX\n\n}", expectedOutput: "const [count, setCount] = useState(0);", hint: "Destructure useState into [count, setCount]" },
    { title: "Props Usage", description: "Create a UserCard component that accepts name and age props.", starterCode: "function UserCard({ /* destructure props */ }) {\n  // Return a card with name and age\n\n}", expectedOutput: "function UserCard({ name, age }) {\n  return <div>{name} - {age}</div>;\n}", hint: "Destructure props in the function parameters" },
  ],
  nextjs: [
    { title: "Create a Page", description: "Create a Next.js page component that exports default and shows 'About Us'.", starterCode: "// app/about/page.js\n\nexport default function AboutPage() {\n  // Return JSX\n\n}", expectedOutput: "export default function AboutPage() {\n  return <h1>About Us</h1>;\n}", hint: "Export a default function returning JSX" },
    { title: "Dynamic Route", description: "Create a dynamic route page that reads the [id] parameter.", starterCode: "// app/post/[id]/page.js\n\nexport default function PostPage({ params }) {\n  // Access the id from params\n\n}", expectedOutput: "const { id } = params;\nreturn <h1>Post {id}</h1>;", hint: "Destructure id from params prop" },
    { title: "Use Client Directive", description: "Mark a component as a Client Component and add an onClick handler.", starterCode: "// Add the correct directive\n\nexport default function Button() {\n  return <button>Click Me</button>;\n}", expectedOutput: "'use client';", hint: "Add 'use client' at the top of the file" },
  ],
  nodejs: [
    { title: "Create Express Server", description: "Write a basic Express server that listens on port 3000.", starterCode: "const express = require('express');\nconst app = express();\n\n// Add a GET route for '/'\n\n// Start the server\n", expectedOutput: "app.get('/', (req, res) => res.send('Hello'));\napp.listen(3000);", hint: "Use app.get() and app.listen()" },
    { title: "Middleware Function", description: "Create a logging middleware that prints the request method and URL.", starterCode: "function logger(req, res, next) {\n  // Log method and URL, then call next()\n\n}", expectedOutput: "console.log(req.method, req.url);\nnext();", hint: "Access req.method and req.url, then call next()" },
    { title: "Route Parameter", description: "Create a GET route that reads a user ID from the URL parameter.", starterCode: "// GET /api/users/:id\napp.get('/api/users/:id', (req, res) => {\n  // Get the id and send it back\n\n});", expectedOutput: "const { id } = req.params;\nres.json({ userId: id });", hint: "Use req.params to access URL parameters" },
  ],
  mongodb: [
    { title: "Define a Schema", description: "Create a Mongoose schema for a 'Product' with name (String, required) and price (Number).", starterCode: "const mongoose = require('mongoose');\n\nconst ProductSchema = new mongoose.Schema({\n  // Define fields here\n\n});", expectedOutput: "name: { type: String, required: true },\nprice: { type: Number }", hint: "Use type: String and type: Number with required" },
    { title: "Find Query", description: "Write a Mongoose query to find all users with age greater than 18.", starterCode: "// Write the query\nconst result = await User.find({\n  // Add condition\n\n});", expectedOutput: "age: { $gt: 18 }", hint: "Use the $gt (greater than) operator" },
    { title: "Update Document", description: "Write a query to update a user's email by their ID.", starterCode: "// Update user email\nconst updated = await User.findByIdAndUpdate(\n  userId,\n  // Add update object\n\n);", expectedOutput: "{ email: newEmail }, { new: true }", hint: "Pass the update object and { new: true } option" },
  ],
  fullstack: [
    { title: "Fetch API Call", description: "Write a fetch request to GET data from '/api/posts' with credentials included.", starterCode: "async function getPosts() {\n  // Write fetch call\n\n}", expectedOutput: "const res = await fetch('/api/posts', { credentials: 'include' });\nconst data = await res.json();", hint: "Use fetch() with credentials: 'include'" },
    { title: "JWT Middleware", description: "Write middleware to extract and verify a JWT token from cookies.", starterCode: "function authMiddleware(req, res, next) {\n  // Get token from cookies\n  // Verify it\n\n}", expectedOutput: "const token = req.cookies.token;\nconst decoded = jwt.verify(token, process.env.JWT_SECRET);", hint: "Use req.cookies and jwt.verify()" },
    { title: "Error Handler", description: "Create an Express error handling middleware with proper status codes.", starterCode: "function errorHandler(err, req, res, next) {\n  // Handle the error\n\n}", expectedOutput: "res.status(err.status || 500).json({ message: err.message });", hint: "Use err.status for code and err.message for the response" },
  ]
};

const getChallenge = (topic) => {
  const challenges = codingChallenges[topic] || codingChallenges.js;
  return challenges[Math.floor(Math.random() * challenges.length)];
};

module.exports = { codingChallenges, getChallenge };
