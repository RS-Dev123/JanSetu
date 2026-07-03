import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const isGeminiActive = !!apiKey;

let genAI: GoogleGenerativeAI | null = null;

if (isGeminiActive) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('✨ AI CONFIG: Google Generative AI client initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to initialize Google Generative AI:', error);
  }
} else {
  console.log('🤖 AI CONFIG: Running in Local Fallback mode (No Gemini API Key supplied).');
}

export { genAI, isGeminiActive };
