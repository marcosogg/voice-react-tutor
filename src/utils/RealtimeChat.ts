import { AudioRecorder } from './AudioRecorder';
import { toast } from 'sonner';
import { generateResponse } from './openai';

export class RealtimeChat {
  private audioRecorder: AudioRecorder | null = null;
  private apiKey: string;
  private onStateChange: (isConnected: boolean) => void;
  private onMessageReceived: (message: string) => void;
  private isProcessing: boolean = false;

  constructor(
    apiKey: string,
    onStateChange: (isConnected: boolean) => void,
    onMessageReceived: (message: string) => void
  ) {
    this.apiKey = apiKey;
    this.onStateChange = onStateChange;
    this.onMessageReceived = onMessageReceived;
  }

  async init(): Promise<void> {
    try {
      this.audioRecorder = new AudioRecorder(async (audioText: string) => {
        if (!this.isProcessing && audioText.trim()) {
          this.isProcessing = true;
          try {
            const response = await generateResponse(this.apiKey, audioText);
            this.onMessageReceived(response);
          } catch (error) {
            console.error('Error generating response:', error);
            toast.error('Failed to generate response');
          } finally {
            this.isProcessing = false;
          }
        }
      });

      await this.audioRecorder.init();
      this.onStateChange(true);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to initialize chat');
      throw error;
    }
  }

  disconnect(): void {
    this.audioRecorder?.stop();
    this.onStateChange(false);
  }
}