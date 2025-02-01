import { toast } from "sonner";

export type ChatMessage = {
  text: string;
  isUser: boolean;
};

export const initializeOpenAI = (apiKey: string) => {
  return apiKey;
};

export const generateResponse = async (apiKey: string, text: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: text }],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate response');
    }

    const reader = response.body?.getReader();
    let responseText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            const jsonData = JSON.parse(line.slice(6));
            const content = jsonData.choices[0]?.delta?.content;
            if (content) {
              responseText += content;
            }
          }
        }
      }
    }

    return responseText;
  } catch (error) {
    console.error('Error generating response:', error);
    toast.error('Failed to generate response');
    throw error;
  }
};