require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

const prompt = `You are a crop disease expert. Analyze this plant image and respond ONLY with raw JSON (no markdown fences). Output exactly this structure:
{"disease":"string","confidence":85,"severity":"Low","symptoms":"string","recommended_actions":"string","prevention":"string"}`;

(async () => {
  try {
    // Create a tiny 1x1 green PNG for testing (base64 encoded)
    // This is a valid 1x1 green pixel PNG
    const greenPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const parts = [
      { text: prompt },
      { inlineData: { mimeType: 'image/png', data: greenPixelBase64 } }
    ];
    const result = await model.generateContent(parts);
    const text = result.response.text();
    console.log('SUCCESS! Raw response:');
    console.log(text.slice(0, 600));
  } catch (err) {
    console.error('ERROR:', err.message);
  }
})();
