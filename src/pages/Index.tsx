import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VoiceChat } from "@/components/VoiceChat";

const Index = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isKeySet, setIsKeySet] = useState(false);

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setIsKeySet(true);
    }
  };

  if (!isKeySet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md p-6">
          <h2 className="mb-4 text-xl font-semibold">Enter OpenAI API Key</h2>
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter your OpenAI API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
            <Button type="submit" className="w-full">
              Set API Key
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return <VoiceChat apiKey={apiKey} />;
};

export default Index;