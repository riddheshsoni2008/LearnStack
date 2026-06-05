const { GoogleGenAI } = require('@google/genai');

// Initialize the Google Gen AI client
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
} else {
  console.warn("⚠️ GEMINI_API_KEY is not set. AI Teacher will not work.");
}

/**
 * @desc    Ask the AI Teacher a question
 * @route   POST /api/ai/ask
 * @access  Private
 */
exports.askTeacher = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of messages'
      });
    }

    if (!ai) {
      return res.status(503).json({
        success: false,
        message: 'AI Teacher is currently unavailable. Please configure the API key.'
      });
    }

    // Convert OpenAI-style message format to Gemini-style format if needed, 
    // or just pass a system instruction and the recent chat history.

    // Filter out error messages
    const validMessages = messages.filter(msg => !msg.content.startsWith('❌'));

    let formattedContents = [];
    let expectedRole = 'user';

    // Build history backwards to ensure strict alternation and ending with user
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

    // Gemini strictly requires history to start with a user message
    if (formattedContents.length > 0 && formattedContents[0].role === 'model') {
      formattedContents.shift();
    }

    if (formattedContents.length === 0) {
      throw new Error('No valid user messages found.');
    }

    // Generate content using gemini-2.5-flash
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: "You are the LearnStack AI Teacher. You are an expert programming instructor. Your goal is to help the user learn coding concepts, debug their code, and provide accurate, up-to-date answers. IMPORTANT: KEEP YOUR ANSWERS CONCISE AND SHORT. Do not write long essays or overly long explanations unless explicitly asked. Be encouraging, supportive, and provide clear code examples where applicable. Use markdown to format your code blocks.",
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      }
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }

    res.end();
  } catch (err) {
    console.error('AI Error:', err);
    if (!res.headersSent) {
      let friendlyMessage = err.message || 'Failed to generate a response. Please try again later.';
      if (friendlyMessage.includes('429') || friendlyMessage.includes('Quota exceeded') || friendlyMessage.includes('RESOURCE_EXHAUSTED')) {
        friendlyMessage = 'Rate limit exceeded! The free Gemini API allows 15 requests per minute. Please wait 60 seconds and try again.';
      }
      res.status(500).json({
        success: false,
        message: friendlyMessage
      });
    } else {
      res.end();
    }
  }
};
