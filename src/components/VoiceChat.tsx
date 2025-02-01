import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic } from 'lucide-react';
import { RealtimeChat } from '@/utils/RealtimeChat';
import { toast } from 'sonner';

interface Message {
  text: string;
  isUser: boolean;
}

export const VoiceChat = ({ apiKey }: { apiKey: string }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatRef = useRef<RealtimeChat | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleConnect = async () => {
    try {
      chatRef.current = new RealtimeChat(
        apiKey,
        setIsConnected,
        (text) => {
          setMessages(prev => [...prev, { text, isUser: false }]);
        }
      );
      await chatRef.current.init();
      toast.success('Connected to voice chat');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect to voice chat');
    }
  };

  const handleDisconnect = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
  };

  const toggleConnection = () => {
    if (isConnected) {
      handleDisconnect();
    } else {
      handleConnect();
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex h-16 items-center justify-center border-b bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">OpenAI Voice Chat</h1>
      </header>

      <main className="flex-1 p-4 bg-gray-50">
        <Card className="h-full">
          <ScrollArea className="h-[calc(100vh-11rem)] px-4" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-gray-200 text-gray-900'
                        : 'bg-blue-100 text-gray-900'
                    }`}
                  >
                    {message.text}
                  </div>
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
          onClick={toggleConnection}
          className={`h-12 w-12 rounded-full shadow-lg transition-all ${
            isConnected 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          <Mic className={`h-6 w-6 ${isConnected ? 'text-white' : 'text-gray-700'}`} />
        </Button>
      </div>
    </div>
  );
};