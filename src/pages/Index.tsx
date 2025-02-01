import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [isKeySet, setIsKeySet] = useState(false);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setIsKeySet(true);
    }
  };

  const toggleRecording = () => {
    if (!isKeySet) return;
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
      {/* Header */}
      <header className="h-16 flex items-center justify-center border-b shadow-sm bg-white">
        <h1 className="text-xl font-semibold text-[#1F2937]">Voice Chat Assistant</h1>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 p-4 bg-gray-50">
        <Card className="h-full">
          <ScrollArea className="h-[calc(100vh-11rem)] px-4">
            <div className="py-4 space-y-4">
              {/* Chat messages will go here */}
              <div className="text-center text-gray-500 text-sm">
                Start a conversation by clicking the microphone button below
              </div>
            </div>
          </ScrollArea>
        </Card>
      </main>

      {/* Microphone Button */}
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