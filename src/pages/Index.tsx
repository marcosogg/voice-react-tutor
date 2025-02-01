import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { initializeGemini, generateResponse } from "@/utils/gemini";
import { toast } from "sonner";

interface Message {
  text: string;
  isUser: boolean;
}

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [isKeySet, setIsKeySet] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const modelRef = useRef<any>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (isKeySet) {
      try {
        modelRef.current = initializeGemini(apiKey);
      } catch (error) {
        console.error('Error initializing Gemini:', error);
        toast.error('Failed to initialize Gemini API');
        setIsKeySet(false);
      }
    }
  }, [isKeySet, apiKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = async (event: SpeechRecognitionEvent) => {
          const text = event.results[0][0].transcript;
          handleNewMessage(text, true);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          toast.error('Speech recognition error. Please try again.');
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, []);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setIsKeySet(true);
    }
  };

  const handleNewMessage = async (text: string, isUser: boolean) => {
    setMessages(prev => [...prev, { text, isUser }]);
    
    if (isUser && modelRef.current) {
      try {
        const response = await generateResponse(modelRef.current, text);
        setMessages(prev => [...prev, { text: response, isUser: false }]);
        
        // Convert response to speech
        const speech = new SpeechSynthesisUtterance(response);
        window.speechSynthesis.speak(speech);
      } catch (error) {
        toast.error('Failed to generate response');
      }
    }
  };

  const toggleRecording = () => {
    if (!isKeySet) return;
    
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsRecording(!isRecording);
  };

  if (!isKeySet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-6">
          <h2 className="mb-4 text-xl font-semibold">Enter Gemini API Key</h2>
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
            <Button type="submit" className="w-full">
              Set API Key
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="h-16 flex items-center justify-center border-b shadow-sm bg-white">
        <h1 className="text-xl font-semibold text-[#1F2937]">Voice Chat Assistant</h1>
      </header>

      <main className="flex-1 p-4 bg-gray-50">
        <Card className="h-full">
          <ScrollArea className="h-[calc(100vh-11rem)] px-4">
            <div className="py-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.isUser
                      ? 'ml-auto bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center text-gray-500 text-sm">
                  Start a conversation by clicking the microphone button below
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <Button
          onClick={toggleRecording}
          className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all ${
            isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-[#2563EB] hover:bg-[#2563EB]/90'
          }`}
        >
          <Mic className={`h-6 w-6 ${isRecording ? 'text-white animate-pulse' : 'text-white'}`} />
        </Button>
      </div>
    </div>
  );
};

export default Index;