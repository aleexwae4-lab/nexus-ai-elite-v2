import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function sendMessage(message: string, history: any[] = []) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction: "Eres el núcleo de Nexus AI. Un asistente multimodal experto en creación de contenido, legal, técnico y estratégico. Tu objetivo es ayudar al usuario a dominar su mercado.",
      },
    });

    // Add history if needed
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("ChatService Error:", error);
    throw error;
  }
}
