import { GoogleGenerativeAI } from "@google/generative-ai";

export const initializeGemini = (apiKey: string) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-pro" });
};

export const generateResponse = async (model: any, message: string) => {
  try {
    const result = await model.generateContent(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
};