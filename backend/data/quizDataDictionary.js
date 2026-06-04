const manualData = {
  "html": {
    "What is HTML?": [
      ["What does HTML stand for?", ["Hyper Text Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language", "Hyper Tool Markup Language"], 0, "HTML is the standard markup language for documents designed to be displayed in a web browser."],
      ["Which organization defines the web standards for HTML?", ["World Wide Web Consortium", "Microsoft", "Mozilla", "Google"], 0, "The W3C is the main international standards organization for the World Wide Web."],
      ["Is HTML considered a programming language?", ["No, it's a markup language", "Yes", "Only HTML5", "It depends on the browser"], 0, "HTML is a markup language used to structure content, not a programming language with logic."],
      ["What is the fundamental building block of an HTML document?", ["Tags", "Variables", "Functions", "Classes"], 0, "HTML uses tags to define elements."],
      ["Which line correctly declares an HTML5 document?", ["<!DOCTYPE html>", "<html>", "<doctype html>", "<!DOCTYPE HTML5>"], 0, "<!DOCTYPE html> is the standard declaration for HTML5."]
    ],
    "HTML Tags & Elements": [
      ["What is the difference between an HTML tag and an HTML element?", ["An element includes the tags and the content between them", "They are exactly the same", "A tag contains attributes, an element does not", "Elements are only used in CSS"], 0, "An HTML element consists of a start tag, the content, and an end tag."],
      ["Which HTML tag is used to define a paragraph?", ["<p>", "<paragraph>", "<pg>", "<para>"], 0, "The <p> tag defines a paragraph."],
      ["Which of these tags is a self-closing (empty) element?", ["<br>", "<div>", "<span>", "<title>"], 0, "The <br> tag inserts a line break and does not require a closing tag."],
      ["How do you create a level 1 heading in HTML?", ["<h1>", "<heading1>", "<h1-tag>", "<header1>"], 0, "<h1> represents the most important level 1 heading."],
      ["Identify the correct syntax for an HTML tag with an attribute.", ["<tag attribute='value'>content</tag>", "<tag>content attribute='value'</tag>", "<tag='value'>content</tag>", "<attribute tag='value'>content</attribute>"], 0, "Attributes are placed inside the opening tag as name-value pairs."]
    ],
    "Structuring a Document": [
      ["Which tag contains the visible page content?", ["<body>", "<head>", "<html>", "<main>"], 0, "The <body> element contains all the contents of an HTML document that are visible to users."],
      ["What is the purpose of the <head> element?", ["To store metadata and links to scripts/stylesheets", "To display a header at the top of the page", "To define the main navigation", "To hold the largest text on the page"], 0, "The <head> contains meta-information about the HTML document."],
      ["Which tag is used to set the title of the document shown in the browser tab?", ["<title>", "<meta>", "<head>", "<header>"], 0, "The <title> tag defines the title of the document."],
      ["Where should the <head> and <body> tags be placed?", ["Inside the <html> element", "Outside the <html> element", "Inside the <main> element", "They are optional"], 0, "Both <head> and <body> are direct children of the root <html> element."],
      ["Write the correct skeletal structure of an HTML document.", ["<html><head></head><body></body></html>", "<head><html><body></body></html></head>", "<body><head></head><html></html></body>", "<html><body><head></head></body></html>"], 0, "The standard structure puts <head> and <body> sequentially inside <html>."]
    ],
    "Working with Links and Images": [
      ["Which tag is used to create a hyperlink?", ["<a>", "<link>", "<href>", "<hyper>"], 0, "The <a> (anchor) tag is used to create hyperlinks."],
      ["Which attribute specifies the destination URL of a link?", ["href", "src", "link", "url"], 0, "The href attribute specifies the URL of the page the link goes to."],
      ["Which tag is used to embed an image?", ["<img>", "<image>", "<pic>", "<src>"], 0, "The <img> tag is used to embed an image in an HTML page."],
      ["What is the purpose of the 'alt' attribute on an image?", ["To provide alternative text for screen readers or if the image fails to load", "To specify a tooltip on hover", "To align the image", "To link the image to another page"], 0, "The alt attribute provides alternative text for accessibility and error handling."],
      ["How do you make an image act as a link?", ["Nest the <img> tag inside an <a> tag", "Use the href attribute directly on the <img> tag", "Nest the <a> tag inside the <img> tag", "Use a <link> tag instead of <img>"], 0, "Wrapping an <img> element inside an <a> element makes the image clickable."]
    ],
    "Lists and Tables": [
      ["Which tag creates an unordered list?", ["<ul>", "<ol>", "<li>", "<list>"], 0, "The <ul> tag defines an unordered (bulleted) list."],
      ["Which tag represents a list item?", ["<li>", "<item>", "<list-item>", "<ul>"], 0, "The <li> tag is used to define each item within a list."],
      ["Which tag is used to define a table row?", ["<tr>", "<td>", "<th>", "<table>"], 0, "The <tr> tag defines a row in an HTML table."],
      ["What is the difference between <th> and <td>?", ["<th> is for header cells, <td> is for standard data cells", "<th> is for text, <td> is for numbers", "<th> creates a new row, <td> creates a new column", "There is no difference"], 0, "<th> defines a header cell which is usually bold and centered by default."],
      ["How do you define an ordered list with numbers?", ["<ol>", "<ul>", "<list type='ordered'>", "<dl>"], 0, "The <ol> tag defines an ordered (numbered) list."]
    ],
    "Forms and Inputs": [
      ["Which tag is used to create an interactive form?", ["<form>", "<input>", "<fieldset>", "<button>"], 0, "The <form> element wraps all input fields and buttons."],
      ["What is the most common form input element?", ["<input>", "<textarea>", "<select>", "<label>"], 0, "The <input> element can be displayed in many ways depending on the type attribute."],
      ["Which input type is used for passwords?", ["<input type='password'>", "<input type='hidden'>", "<input type='secure'>", "<password>"], 0, "The 'password' type masks the characters entered by the user."],
      ["What is the purpose of the <label> element?", ["To bind text to an input field for accessibility and better clicking area", "To style the input text", "To create a heading for the form", "To validate the input"], 0, "The <label> tag defines a label for several form elements, improving usability."],
      ["Which tag creates a multi-line text input?", ["<textarea>", "<input type='text'>", "<input type='multiline'>", "<text>"], 0, "The <textarea> tag defines a multi-line text input control."]
    ],
    "Semantic HTML": [
      ["What is semantic HTML?", ["HTML elements that clearly describe their meaning to both the browser and the developer", "HTML written purely for styling", "HTML that only uses <div> and <span> tags", "A new programming language"], 0, "Semantic elements like <article> and <header> describe their purpose clearly."],
      ["Which semantic tag should wrap the primary navigation links?", ["<nav>", "<menu>", "<header>", "<ul>"], 0, "The <nav> element defines a set of navigation links."],
      ["Why is semantic HTML important?", ["It improves SEO and accessibility for screen readers", "It makes the website load faster", "It prevents styling conflicts", "It automatically adds CSS styling"], 0, "Search engines and screen readers use semantic tags to understand the page structure."],
      ["Which tag is best suited for an independent, self-contained piece of content?", ["<article>", "<section>", "<div>", "<aside>"], 0, "An <article> should make sense on its own and be distributable independently."],
      ["Which tag represents content loosely related to the main content (like a sidebar)?", ["<aside>", "<sidebar>", "<section>", "<div>"], 0, "The <aside> element defines content aside from the content it is placed in."]
    ]
  },
  "css": {
    "Introduction to CSS": [
      ["What does CSS stand for?", ["Cascading Style Sheets", "Computer Style Sheets", "Creative Style System", "Colorful Style Sheets"], 0, "CSS stands for Cascading Style Sheets."],
      ["What is the purpose of CSS?", ["To describe the presentation and styling of a document written in HTML", "To structure the web page", "To add interactive logic to the browser", "To interact with databases"], 0, "CSS handles the visual layout, colors, and fonts of a webpage."],
      ["Where can CSS be written?", ["Inline, internal (<style>), or external (.css file)", "Only in external files", "Only in the <head> tag", "Only inline within HTML elements"], 0, "CSS can be applied in three ways: inline, internal, and external."],
      ["What is the correct syntax for an external CSS link?", ["<link rel='stylesheet' href='style.css'>", "<style src='style.css'>", "<css file='style.css'>", "<link href='style.css'>"], 0, "The <link> tag with rel='stylesheet' imports external CSS."],
      ["Which CSS property is used to change the background color?", ["background-color", "color", "bg-color", "background"], 0, "The background-color property sets the background color of an element."]
    ],
    "CSS Selectors": [
      ["How do you select an element with id 'header' in CSS?", ["#header", ".header", "header", "*header"], 0, "The hash (#) symbol targets an ID."],
      ["How do you select elements with class name 'btn'?", [".btn", "#btn", "btn", "*btn"], 0, "The period (.) symbol targets a class name."],
      ["What does the '*' selector do?", ["Selects all elements on the page", "Selects the body element", "Selects all wildcards", "Selects bold text"], 0, "The universal selector (*) matches elements of any type."],
      ["How do you select all <p> elements inside a <div> element?", ["div p", "div + p", "div > p", "div.p"], 0, "A space between selectors acts as a descendant combinator."],
      ["Which selector has the highest specificity?", ["Inline styles", "ID selector (#id)", "Class selector (.class)", "Element selector (div)"], 0, "Inline styles override IDs, which override classes, which override elements."]
    ],
    "Colors and Typography": [
      ["Which property is used to change text color?", ["color", "text-color", "font-color", "fgcolor"], 0, "The color property changes the text color."],
      ["How can you specify a color in CSS?", ["All of these", "Hex codes (e.g. #ff0000)", "RGB values (e.g. rgb(255,0,0))", "Color names (e.g. red)"], 0, "CSS supports various color formats including hex, RGB, HSL, and named colors."],
      ["Which property changes the font family?", ["font-family", "font-style", "font-weight", "text-font"], 0, "The font-family property specifies the font for an element."],
      ["How do you make text bold in CSS?", ["font-weight: bold;", "text-style: bold;", "font: bold;", "text-weight: bold;"], 0, "The font-weight property controls the thickness of the text."],
      ["Which property controls the space between lines of text?", ["line-height", "letter-spacing", "text-spacing", "word-spacing"], 0, "The line-height property specifies the height of a line."]
    ],
    "The Box Model": [
      ["What are the components of the CSS box model from inside out?", ["Content, Padding, Border, Margin", "Content, Margin, Border, Padding", "Margin, Border, Padding, Content", "Padding, Content, Margin, Border"], 0, "The box model consists of content surrounded by padding, then a border, then margins outside."],
      ["Which property generates space inside an element's border?", ["padding", "margin", "spacing", "border-spacing"], 0, "Padding clears an area around the content, inside the border."],
      ["Which property generates space outside an element's border?", ["margin", "padding", "spacing", "outline"], 0, "Margin clears an area outside the border."],
      ["What does 'box-sizing: border-box' do?", ["Includes padding and border in the element's total width and height", "Removes borders from boxes", "Makes the box model behave like an inline element", "Adds a border around all boxes"], 0, "With border-box, the specified width and height include content, padding, and borders."],
      ["If width is 100px, padding is 10px, and border is 5px, what is the total visible width (default content-box)?", ["130px", "100px", "115px", "120px"], 0, "Total width = 100 + 10(left-pad) + 10(right-pad) + 5(left-border) + 5(right-border) = 130px."]
    ],
    "Flexbox Basics": [
      ["Which property turns an element into a flex container?", ["display: flex;", "flex-direction: row;", "align-items: flex;", "display: block;"], 0, "Setting display to flex or inline-flex establishes a flex container."],
      ["Which property aligns flex items along the main axis?", ["justify-content", "align-items", "flex-align", "align-content"], 0, "justify-content aligns items horizontally (by default row)."],
      ["Which property aligns flex items along the cross axis?", ["align-items", "justify-content", "flex-direction", "align-content"], 0, "align-items handles vertical alignment (by default row)."],
      ["What is the default value of flex-direction?", ["row", "column", "row-reverse", "column-reverse"], 0, "By default, flex items are laid out in a row."],
      ["How do you make a flex item grow to fill available space?", ["flex-grow: 1;", "flex-size: auto;", "width: 100%;", "flex: fill;"], 0, "The flex-grow property specifies how much the item will grow relative to others."]
    ],
    "CSS Grid Layout": [
      ["Which property defines a grid container?", ["display: grid;", "grid-layout: true;", "display: flex;", "grid-container: active;"], 0, "display: grid; creates a block-level grid container."],
      ["How do you define 3 equal-width columns in Grid?", ["grid-template-columns: 1fr 1fr 1fr;", "grid-columns: 3;", "columns: 33% 33% 33%;", "grid-template-rows: 1fr 1fr 1fr;"], 0, "The 'fr' unit represents a fraction of the available space."],
      ["Which property creates space between grid cells?", ["gap", "margin", "padding", "grid-space"], 0, "The gap (formerly grid-gap) property sets the gutters between rows and columns."],
      ["What does the 'repeat()' function do in Grid?", ["Repeats a track sizing pattern", "Repeats an element across the grid", "Creates infinite rows", "Repeats animations"], 0, "repeat(3, 1fr) is shorthand for 1fr 1fr 1fr."],
      ["How do you make an item span 2 columns?", ["grid-column: span 2;", "colspan: 2;", "grid-span: 2;", "width: 2fr;"], 0, "The grid-column property can use the 'span' keyword."]
    ],
    "Responsive Design & Media Queries": [
      ["What is the purpose of a media query in CSS?", ["To apply different styles for different viewport sizes or devices", "To load external media like images", "To query a database", "To play audio or video"], 0, "Media queries adapt the layout to different screen sizes."],
      ["Which syntax is used to create a media query for screens smaller than 768px?", ["@media (max-width: 768px)", "@media (min-width: 768px)", "@screen (max-width: 768px)", "@query (width < 768px)"], 0, "max-width applies rules to screens up to that width."],
      ["What is 'mobile-first' design?", ["Styling for mobile devices first, then using min-width media queries for larger screens", "Only designing for mobile devices", "Using max-width media queries exclusively", "Using a mobile app builder"], 0, "Mobile-first builds the base styles for small screens and scales up."],
      ["Which unit is relative to the viewport width?", ["vw", "vh", "rem", "%"], 0, "1vw is equal to 1% of the viewport width."],
      ["What viewport meta tag is essential for responsive design?", ["<meta name='viewport' content='width=device-width, initial-scale=1.0'>", "<meta responsive='true'>", "<meta name='scale' content='1'>", "<meta design='mobile'>"], 0, "This tag instructs the browser to match the device's width and scale correctly."]
    ]
  },
  "js": {
    "Introduction to JavaScript": [
      ["Where is JavaScript code typically executed for frontend web development?", ["In the user's web browser", "On the web server", "In a database", "In the operating system kernel"], 0, "JavaScript is primarily a client-side language executed by the browser engine."],
      ["Which HTML tag is used to insert JavaScript?", ["<script>", "<js>", "<javascript>", "<code>"], 0, "The <script> tag embeds or references JavaScript code."],
      ["How do you write a comment in JavaScript?", ["// comment or /* comment */", "<!-- comment -->", "# comment", "/* comment"], 0, "JS uses double slashes for single lines and /* */ for blocks."],
      ["What is console.log() used for?", ["To print messages to the browser's developer console", "To show an alert box to the user", "To log in to a server", "To modify HTML elements"], 0, "console.log() is a debugging tool that prints output to the console."],
      ["Is JavaScript case-sensitive?", ["Yes", "No", "Only for variable names", "Only for function names"], 0, "JavaScript is strictly case-sensitive ('Var' is different from 'var')."]
    ],
    "Variables (let, const, var)": [
      ["Which keyword creates a block-scoped variable that cannot be reassigned?", ["const", "let", "var", "static"], 0, "The 'const' keyword creates a read-only reference to a value."],
      ["Which keyword creates a block-scoped variable that can be reassigned?", ["let", "const", "var", "dynamic"], 0, "The 'let' keyword allows variable reassignment and respects block scope."],
      ["Why is 'var' generally avoided in modern JavaScript?", ["It is function-scoped and can lead to unexpected hoisting behavior", "It is slower than let", "It cannot hold strings", "It is deprecated and removed from JS"], 0, "var does not respect block scope, causing bugs in complex logic."],
      ["What happens if you try to reassign a const variable?", ["It throws a TypeError", "It works normally", "It changes the variable type to let", "It returns undefined"], 0, "Reassigning a primitive const variable triggers a runtime TypeError."],
      ["What is the value of an uninitialized let variable?", ["undefined", "null", "NaN", "0"], 0, "Variables declared without a value are automatically assigned 'undefined'."]
    ],
    "Data Types": [
      ["Which of the following is a primitive data type in JavaScript?", ["Boolean", "Array", "Object", "Function"], 0, "Primitives include String, Number, Boolean, Undefined, Null, Symbol, and BigInt."],
      ["What data type is the value 42.5?", ["Number", "Float", "Decimal", "Double"], 0, "JavaScript only has one number type (Number) for both integers and floats."],
      ["What does the typeof operator return for null?", ["'object'", "'null'", "'undefined'", "'boolean'"], 0, "Due to a historical bug in JavaScript, typeof null returns 'object'."],
      ["How do you write a string that allows embedded expressions?", ["Using backticks (` `)", "Using single quotes (' ')", "Using double quotes (\" \")", "Using brackets ([ ])"], 0, "Template literals use backticks to allow ${expression} syntax."],
      ["What is the difference between null and undefined?", ["null is an assigned empty value, undefined means a variable is declared but has no value", "They are exactly the same", "undefined is an object, null is a primitive", "null throws an error, undefined does not"], 0, "undefined is the default uninitialized state; null is an explicit empty assignment."]
    ],
    "Functions and Arrow Functions": [
      ["How do you declare a traditional function in JavaScript?", ["function myFunc() {}", "def myFunc() {}", "fn myFunc() {}", "create myFunc() {}"], 0, "The 'function' keyword is used for traditional function declarations."],
      ["What is the syntax for an arrow function?", ["() => {}", "() -> {}", "function => {}", "=> () {}"], 0, "Arrow functions use the '=>' syntax."],
      ["What is a major difference between traditional functions and arrow functions?", ["Arrow functions do not bind their own 'this' context", "Arrow functions cannot take arguments", "Traditional functions cannot return values", "Arrow functions must be written on a single line"], 0, "Arrow functions inherit 'this' from their enclosing lexical scope."],
      ["How do you return a value from a function?", ["Use the 'return' keyword", "Use the 'output' keyword", "Assign a value to the function name", "Use 'break'"], 0, "The return statement ends execution and specifies the value to be returned."],
      ["What happens if a function doesn't have a return statement?", ["It returns undefined", "It returns null", "It throws an error", "It returns 0"], 0, "By default, functions lacking a return statement yield undefined."]
    ]
  }
};

const defaultFallback = [
  ["What is the primary purpose of this topic?", ["To implement core functionality", "To add CSS styling", "To style HTML tags", "To perform database queries"], 0, "Understanding the core purpose is vital for web development."],
  ["Which concept is heavily associated with this lesson?", ["The tools and methods discussed in the video", "Only basic HTML", "Strictly CSS colors", "Just server hardware"], 0, "Every topic relies on specific methods unique to its domain."],
  ["Why is this important for modern applications?", ["It solves specific architectural or logic problems efficiently", "It makes the code look prettier", "It is required by law", "It replaces all other programming languages"], 0, "Modern apps use these specific patterns to remain maintainable."],
  ["How would a developer implement this concept?", ["By following the syntax and patterns demonstrated in the tutorial", "By copying CSS from StackOverflow", "By rewriting the operating system", "By avoiding variables"], 0, "Implementation relies on exact syntax rules."],
  ["What is a common error related to this topic?", ["Syntax mistakes or incorrect logical implementation", "Using the wrong font color", "Hardware failure", "Too much RAM usage"], 0, "Logic and syntax errors are the most common pitfalls."]
];

function generateQuestionsForLesson(lessonTitle, topic) {
  if (manualData[topic] && manualData[topic][lessonTitle]) {
    return manualData[topic][lessonTitle].map(q => ({
      question: q[0],
      options: q[1],
      correctAnswer: q[2],
      explanation: q[3]
    }));
  }

  // Smart fallback template generation if exact match not found
  const topicUpper = topic ? topic.toUpperCase() : 'WEB';
  const templates = [
    {
      question: `Which of the following best describes the core concept of ${lessonTitle}?`,
      options: [`A key feature of ${topicUpper} development`, `A database management tool`, `An operating system`, `A CSS styling trick`],
      correctAnswer: 0,
      explanation: `${lessonTitle} is a critical component of mastering ${topicUpper}.`
    },
    {
      question: `In the context of ${topicUpper}, what is the primary use case for ${lessonTitle}?`,
      options: [`Solving specific architectural or logic challenges`, `Designing images`, `Creating hardware drivers`, `Managing network routers`],
      correctAnswer: 0,
      explanation: `Developers use ${lessonTitle} to implement complex logic effectively.`
    },
    {
      question: `Why is understanding ${lessonTitle} important for a full-stack developer?`,
      options: [`It enables robust and scalable application features`, `It teaches you how to install Windows`, `It replaces the need for HTML`, `It is only useful for data scientists`],
      correctAnswer: 0,
      explanation: `${lessonTitle} provides foundational logic for modern web apps.`
    },
    {
      question: `Which syntax or pattern is most associated with ${lessonTitle}?`,
      options: [`The ${topicUpper} patterns shown in the code examples`, `SQL queries only`, `HTML semantic tags`, `CSS grid layouts`],
      correctAnswer: 0,
      explanation: `Each topic has a distinct syntax associated with ${lessonTitle}.`
    },
    {
      question: `What happens if you incorrectly implement ${lessonTitle}?`,
      options: [`The application may throw errors or behave unexpectedly`, `The website background turns red`, `The browser uninstalls itself`, `Nothing, it self-corrects`],
      correctAnswer: 0,
      explanation: `Proper implementation of ${lessonTitle} is required to avoid runtime errors.`
    }
  ];

  return templates;
}

module.exports = { generateQuestionsForLesson };
