const messages = [
  { role: "assistant", content: "Hi! I am the LearnStack AI Teacher..." },
  { role: "user", content: "hii" },
  { role: "assistant", content: "❌ Rate limit exceeded! ..." },
  { role: "user", content: "hiii" }
];

const validMessages = messages.filter(msg => !msg.content.startsWith('❌'));

let formattedContents = [];
let expectedRole = 'user';

for (let i = validMessages.length - 1; i >= 0; i--) {
  const msg = validMessages[i];
  const role = msg.role === 'assistant' ? 'model' : 'user';
  if (role === expectedRole) {
    formattedContents.unshift({
      role: role,
      parts: [{ text: msg.content }]
    });
    expectedRole = expectedRole === 'user' ? 'model' : 'user';
  }
}

if (formattedContents.length > 0 && formattedContents[0].role === 'model') {
  formattedContents.shift();
}

console.log(JSON.stringify(formattedContents, null, 2));
