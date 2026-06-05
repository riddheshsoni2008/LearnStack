const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function test() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: 'Tell me a short joke.',
    });
    
    let count = 0;
    for await (const chunk of responseStream) {
      console.log(`--- CHUNK ${count++} ---`);
      console.log(chunk.text);
    }
  } catch (err) {
    console.error(err);
  }
}

test();
