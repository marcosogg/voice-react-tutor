import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { toast } from "sonner";

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

const MAX_RETRIES = 3;
const BASE_DELAY = 2000; // 2 seconds

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const initializeGemini = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: DEFAULT_CONFIG
  });
};

export const generateResponse = async (model: GenerativeModel, message: string) => {
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      const result = await model.generateContent(message);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      attempt++;
      
      // Log the error for debugging
      console.error('Error generating response:', error);
      
      if (error.status === 503) {
        // Model overloaded - implement exponential backoff
        const delay = Math.min(Math.pow(2, attempt) * BASE_DELAY + Math.random() * 1000, 64000);
        toast.error("Model is busy. Retrying...");
        await sleep(delay);
        continue;
      }
      
      // If we've exhausted our retries or hit a different error, throw
      if (attempt === MAX_RETRIES) {
        toast.error("Failed to generate response after multiple attempts");
      }
      throw error;
    }
  }
  
  throw new Error("Max retries exceeded");
};