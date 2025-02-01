import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

interface ChatConfig {
  temperature: number;
  candidateCount: number;
}

export interface ChatMessage {
  text: string;
  isUser: boolean;
}

const DEFAULT_CONFIG: ChatConfig = {
  temperature: 0.7, // Adjusted to recommended range for Gemini 2.0 Flash
  candidateCount: 1,
};

export const initializeGemini = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: DEFAULT_CONFIG
  });
};

export const generateResponse = async (model: GenerativeModel, message: string) => {
  try {
    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};