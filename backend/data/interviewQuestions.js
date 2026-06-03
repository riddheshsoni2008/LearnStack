const interviewQuestions = {
  html: [
    {
      question: "Basic: What is the purpose of the `alt` attribute on an `<img>` tag?",
      options: [
        "To provide an alternative text for screen readers and when the image fails to load",
        "To define the alignment of the image",
        "To provide a tooltip when hovering over the image",
        "To specify an alternative image source"
      ],
      correctAnswer: 0,
      explanation: "The `alt` attribute provides semantic meaning for accessibility tools like screen readers and displays text if the image link is broken."
    },
    {
      question: "Intermediate: What is the difference between `<section>` and `<div>` in HTML5?",
      options: [
        "They are functionally identical and can be used interchangeably",
        "`<section>` is a semantic tag grouping related content, while `<div>` is a non-semantic generic container",
        "`<section>` automatically adds padding, `<div>` does not",
        "`<div>` is deprecated in HTML5 in favor of `<section>`"
      ],
      correctAnswer: 1,
      explanation: "Semantic tags like `<section>` describe their meaning to both the browser and the developer, whereas `<div>` has no semantic meaning."
    },
    {
      question: "Advanced: How does the browser handle the `defer` attribute on a `<script>` tag?",
      options: [
        "It stops HTML parsing, downloads the script, and executes it immediately",
        "It downloads the script asynchronously and executes it only after the HTML parsing is completely finished",
        "It executes the script as soon as it's downloaded, pausing HTML parsing if necessary",
        "It prevents the script from executing until a user interaction occurs"
      ],
      correctAnswer: 1,
      explanation: "The `defer` attribute tells the browser to download the script in the background without blocking DOM parsing, but guarantees execution only after parsing completes, maintaining script order."
    }
  ],
  css: [
    {
      question: "Basic: What does the `box-sizing: border-box;` CSS property do?",
      options: [
        "Adds a border around the box element",
        "Includes padding and border in the element's total width and height",
        "Removes all margins from the element",
        "Forces the element to behave like an inline-box"
      ],
      correctAnswer: 1,
      explanation: "With `border-box`, padding and borders are included in the element's specified width and height, preventing unexpected layout breaking."
    },
    {
      question: "Intermediate: In CSS Specificity, which selector carries the highest weight?",
      options: [
        "Class selectors (.classname)",
        "ID selectors (#idname)",
        "Inline styles (style=\"...\")",
        "Pseudo-classes (:hover)"
      ],
      correctAnswer: 2,
      explanation: "Inline styles have the highest specificity (1000), followed by IDs (100), Classes/Attributes/Pseudo-classes (10), and finally Elements/Pseudo-elements (1)."
    },
    {
      question: "Advanced: What is the difference between `display: none` and `visibility: hidden`?",
      options: [
        "There is no difference, both hide the element",
        "`display: none` removes the element from the document flow; `visibility: hidden` hides it but leaves the space allocated",
        "`visibility: hidden` removes the element from the document flow; `display: none` hides it but leaves the space",
        "`display: none` cannot be animated, while `visibility: hidden` can"
      ],
      correctAnswer: 1,
      explanation: "When an element has `display: none`, it takes up zero space and triggers a reflow. `visibility: hidden` makes it invisible but it still occupies physical layout space."
    }
  ],
  js: [
    {
      question: "Basic: What is the difference between `==` and `===` in JavaScript?",
      options: [
        "`==` compares values and types, `===` only compares values",
        "`==` compares only values (performing type coercion), while `===` strictly compares both value and type",
        "They are exactly the same",
        "`===` is used for object comparison, `==` for primitives"
      ],
      correctAnswer: 1,
      explanation: "The strict equality operator (`===`) checks both value and type without coercion, preventing unexpected truthy/falsy bugs common with `==`."
    },
    {
      question: "Intermediate: What is a Closure in JavaScript?",
      options: [
        "A function bundled together with references to its surrounding lexical environment",
        "A way to close a database connection automatically",
        "A method to prevent memory leaks by clearing variables",
        "The process of encapsulating a class in an IIFE"
      ],
      correctAnswer: 0,
      explanation: "A closure gives you access to an outer function's scope from an inner function, even after the outer function has returned."
    },
    {
      question: "Advanced: Explain the JavaScript Event Loop mechanism.",
      options: [
        "It executes asynchronous code immediately, pausing synchronous code",
        "It continuously checks the Call Stack and moves tasks from the Callback Queue to the Stack when it is empty",
        "It creates multiple threads to run Promises in parallel",
        "It is a built-in Array method for looping through events"
      ],
      correctAnswer: 1,
      explanation: "The Event Loop monitors the Call Stack and the Callback (Macrotask/Microtask) Queues. If the stack is empty, it pushes the first event from the queue to the stack."
    }
  ],
  react: [
    {
      question: "Basic: Why should you not mutate React state directly (e.g., `this.state.count = 1` or `state.count = 1`)?",
      options: [
        "It will throw a Syntax Error",
        "React relies on state immutability to detect changes and trigger re-renders; mutating directly bypasses this",
        "It deletes the previous state completely",
        "It causes an infinite loop"
      ],
      correctAnswer: 1,
      explanation: "React uses shallow comparison to detect state changes. Mutating the object directly means the reference stays the same, so React won't know it needs to re-render."
    },
    {
      question: "Intermediate: What is the purpose of the `useEffect` hook's dependency array?",
      options: [
        "To inject dependencies like Redux or Context into the component",
        "To tell React which state/props changes should trigger the effect to re-run",
        "To strictly type the variables used inside the effect",
        "To fetch API data automatically"
      ],
      correctAnswer: 1,
      explanation: "If you omit the array, the effect runs on every render. An empty array `[]` runs it once on mount. Providing variables `[data]` runs the effect only when `data` changes."
    },
    {
      question: "Advanced: How does React's Virtual DOM improve performance?",
      options: [
        "It bypasses the browser's rendering engine completely",
        "It creates a lightweight in-memory representation of the real DOM, calculates differences (diffing), and batches updates to minimize costly real DOM operations",
        "It converts React code directly into WebAssembly",
        "It prevents all re-renders by caching HTML output"
      ],
      correctAnswer: 1,
      explanation: "Manipulating the real DOM is slow. The Virtual DOM allows React to compute minimal required changes (reconciliation) and apply them in one optimized batch update."
    }
  ],
  nextjs: [
    {
      question: "Basic: What is the primary difference between Next.js and standard React?",
      options: [
        "Next.js uses Python instead of JavaScript",
        "Next.js provides built-in Server-Side Rendering (SSR) and routing, whereas standard React is strictly Client-Side",
        "Standard React is faster for SEO",
        "Next.js does not support Hooks"
      ],
      correctAnswer: 1,
      explanation: "Next.js is a framework built on top of React that handles server-side rendering, static site generation, and file-based routing out of the box."
    },
    {
      question: "Intermediate: In the Next.js App Router, how do you define a Server Component vs a Client Component?",
      options: [
        "All components are Server Components by default; you must use `'use client'` at the top of a file to make it a Client Component",
        "All components are Client Components by default; you must use `'use server'` to make them Server Components",
        "Components in the `components/` folder are client, components in `app/` are server",
        "It is determined automatically based on whether you use state"
      ],
      correctAnswer: 0,
      explanation: "In Next.js 13+ App Router, components default to Server Components for better performance and SEO. The `'use client'` directive explicitly opts into client-side interactivity."
    },
    {
      question: "Advanced: What is Incremental Static Regeneration (ISR) in Next.js?",
      options: [
        "A technique to automatically rebuild the entire site every minute",
        "A feature that allows you to update static pages in the background after deployment, without needing to rebuild the entire site",
        "A way to stream video content incrementally",
        "A client-side caching mechanism for React state"
      ],
      correctAnswer: 1,
      explanation: "ISR allows you to retain the speed of Static Site Generation (SSG) while keeping data fresh. When a user requests an ISR page, they get a cached version, but Next.js triggers a background regeneration for subsequent requests."
    }
  ],
  nodejs: [
    {
      question: "Basic: What is `npm`?",
      options: [
        "Node Programming Module",
        "The default package manager for Node.js, used to install and manage third-party libraries",
        "A built-in database for Node.js",
        "A framework for building APIs"
      ],
      correctAnswer: 1,
      explanation: "NPM stands for Node Package Manager, which hosts the world's largest software registry and handles dependency management via `package.json`."
    },
    {
      question: "Intermediate: How does Node.js handle concurrency despite being single-threaded?",
      options: [
        "By spawning a new process for every request",
        "By utilizing the asynchronous, non-blocking Event Loop architecture to delegate I/O operations to the OS",
        "By automatically using Web Workers",
        "Node.js cannot handle concurrency"
      ],
      correctAnswer: 1,
      explanation: "Node executes JavaScript on a single thread but delegates heavy I/O tasks (like database queries or file reading) to the underlying system (libuv), continuing to process other requests in the meantime."
    },
    {
      question: "Advanced: What is the purpose of the `cluster` module in Node.js?",
      options: [
        "To group related files together in memory",
        "To fork multiple child processes (workers) that run simultaneously and share the same server port, utilizing multi-core systems",
        "To connect to multiple databases simultaneously",
        "To manage Kubernetes clusters"
      ],
      correctAnswer: 1,
      explanation: "Since Node.js is single-threaded, it only uses one CPU core by default. The `cluster` module allows you to create child processes to handle load across all available CPU cores."
    }
  ],
  mongodb: [
    {
      question: "Basic: How does MongoDB store data compared to a traditional SQL database?",
      options: [
        "It stores data in strict relational tables with rows and columns",
        "It stores data as flexible, JSON-like documents (BSON) inside collections",
        "It only stores data in memory",
        "It stores data as plain text files"
      ],
      correctAnswer: 1,
      explanation: "MongoDB is a NoSQL document database. Instead of tables and rows, it uses Collections and Documents, which allows for flexible, hierarchical schemas."
    },
    {
      question: "Intermediate: What is the purpose of an Index in MongoDB?",
      options: [
        "To automatically generate unique IDs",
        "To drastically improve query performance by storing a specific subset of data in an easy-to-traverse structure",
        "To join two collections together",
        "To compress the database size"
      ],
      correctAnswer: 1,
      explanation: "Indexes prevent MongoDB from having to scan every document in a collection (Collection Scan). They allow the database to quickly narrow down the results."
    },
    {
      question: "Advanced: What is the MongoDB Aggregation Pipeline?",
      options: [
        "A framework for data modeling and schema validation",
        "A tool to back up the database",
        "A multi-stage framework for data processing where documents pass through a sequence of operations (like $match, $group, $sort) to return computed results",
        "A method to synchronize data between nodes"
      ],
      correctAnswer: 2,
      explanation: "The aggregation pipeline is incredibly powerful for transforming and analyzing data, similar to complex SQL JOINs and GROUP BY operations but modeled as a stream of stages."
    }
  ],
  fullstack: [
    {
      question: "Basic: What does CORS stand for and why is it important?",
      options: [
        "Cross-Origin Resource Sharing; it is a security feature that restricts web pages from making requests to a different domain than the one that served the page",
        "Code Optimization and Routing System; it speeds up API requests",
        "Cross-Origin Rendering System; it handles SSR",
        "Client Object Relational Storage; it manages databases"
      ],
      correctAnswer: 0,
      explanation: "Browsers enforce the Same-Origin Policy. CORS headers allow a server to explicitly permit requests from other origins (e.g., frontend on port 3000 calling backend on port 5000)."
    },
    {
      question: "Intermediate: What is the difference between Authentication and Authorization?",
      options: [
        "They are two words for the exact same concept",
        "Authentication is verifying WHO you are (e.g., logging in); Authorization is verifying WHAT you have access to (e.g., admin permissions)",
        "Authentication uses JWTs, Authorization uses sessions",
        "Authorization verifies identity, Authentication verifies permissions"
      ],
      correctAnswer: 1,
      explanation: "Authentication proves identity (401 Unauthorized), while Authorization dictates permissions/roles (403 Forbidden)."
    },
    {
      question: "Advanced: How do JSON Web Tokens (JWT) maintain security without being stored in a database?",
      options: [
        "They use an encrypted connection to the database",
        "The payload is digitally signed by the server using a secret key (HMAC) or public/private key pair; if the token is tampered with, the signature becomes invalid",
        "They are completely unhackable by design",
        "They store a password directly in the token"
      ],
      correctAnswer: 1,
      explanation: "JWTs are stateless. The server trusts the token because it verifies the cryptographic signature attached to the token using its secret `JWT_SECRET`."
    }
  ]
};

// Helper function to get a fallback if topic not found
const getFallbackQuestions = (topicTitle) => [
  {
    question: `Basic: What is a core principle of ${topicTitle}?`,
    options: [
      "Writing clean, maintainable code",
      "Duplicating code as much as possible",
      "Ignoring error handling",
      "Hardcoding secrets in plain text"
    ],
    correctAnswer: 0,
    explanation: "Maintainability is a core principle of professional software development."
  },
  {
    question: `Advanced: How would you optimize a large-scale ${topicTitle} application?`,
    options: [
      "Remove all comments to save space",
      "Implement proper caching, lazy loading, and algorithm optimization",
      "Increase the server timeout limits indefinitely",
      "Rewrite the entire application every 6 months"
    ],
    correctAnswer: 1,
    explanation: "Caching, efficient algorithms, and deferred loading (lazy loading) are standard professional optimization strategies."
  }
];

module.exports = { interviewQuestions, getFallbackQuestions };
