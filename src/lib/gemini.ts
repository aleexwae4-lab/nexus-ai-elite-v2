import { GoogleGenAI } from '@google/genai';

// Initialize the GenAI SDK
// We use a function so we can re-initialize if the key changes, though in this environment it's injected.
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
};
