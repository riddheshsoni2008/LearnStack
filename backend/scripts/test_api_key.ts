import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

(async () => {
  try {
    console.log('Using API key starting with:', process.env.GEMINI_API_KEY?.substring(0, 10));
    
    // Dynamically import @google/genai as it's an ESM module
    const { GoogleGenAI } = await (eval("import('@google/genai')") as Promise<any>);
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    console.log('Sending test request to gemini-1.5-flash...');
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: 'Hello',
    });
    
    console.log('✅ Success! Response:', response.text);
  } catch (err: any) {
    console.error('❌ API Key Test Failed!');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Full Error Object:', JSON.stringify(err, null, 2));
  }
})();
