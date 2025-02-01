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
  temperature: 0.9,
  candidateCount: 1,
};

export const initializeGemini = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ 
    model: "gemini-pro",
    generationConfig: DEFAULT_CONFIG
  });
};

export const generateResponse = async (model: GenerativeModel, message: string) => {
  try {
    return await model.generateContentStream(message);
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};