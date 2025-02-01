import { toast } from "sonner";

export type ChatMessage = {
  text: string;
  isUser: boolean;
};

export const initializeOpenAI = (apiKey: string) => {
  console.log("Initializing OpenAI with API key");
  return apiKey;
};

export const generateResponse = async (apiKey: string, text: string) => {
  console.log("Generating response for:", text);
  
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
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    let responseText = '';

    if (!reader) {
      throw new Error('No response reader available');
    }

    console.log("Starting to read stream");

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log("Stream complete. Final response:", responseText);
        break;
      }

      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          if (line === 'data: [DONE]') continue;
          
          try {
            const jsonData = JSON.parse(line.slice(6));
            const content = jsonData.choices[0]?.delta?.content;
            if (content) {
              responseText += content;
              console.log("Received content chunk:", content);
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }
    }

    if (!responseText.trim()) {
      throw new Error('Empty response from API');
    }

    return responseText;
  } catch (error) {
    console.error('Error generating response:', error);
    toast.error('Failed to generate response: ' + (error as Error).message);
    throw error;
  }
};