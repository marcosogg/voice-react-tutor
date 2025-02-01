import { toast } from "sonner";

export type ChatMessage = {
  text: string;
  isUser: boolean;
};

export const generateResponse = async (apiKey: string, text: string): Promise<string> => {
  console.log("Starting OpenAI request for:", text);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful voice assistant. Keep your responses concise and natural, as if speaking in conversation.' 
          },
          { 
            role: 'user', 
            content: text 
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('Error generating response:', error);
    toast.error('Failed to generate response: ' + (error as Error).message);
    throw error;
  }
};