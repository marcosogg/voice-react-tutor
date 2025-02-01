import { AudioRecorder } from './AudioRecorder';
import { toast } from 'sonner';

export class RealtimeChat {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private audioRecorder: AudioRecorder | null = null;
  private apiKey: string;
  private onStateChange: (isConnected: boolean) => void;
  private onMessageReceived: (message: string) => void;

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
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      this.dataChannel = this.peerConnection.createDataChannel('audio');
      this.dataChannel.onmessage = this.handleMessage.bind(this);

      this.audioRecorder = new AudioRecorder(this.sendAudio.bind(this));
      await this.audioRecorder.init();

      this.peerConnection.oniceconnectionstatechange = () => {
        const connected = this.peerConnection?.iceConnectionState === 'connected';
        this.onStateChange(connected);
      };

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-0125-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful voice assistant. Keep responses concise and natural.',
            },
          ],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to OpenAI');
      }

      const answer = await response.json();
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

    } catch (error) {
      console.error('Error initializing chat:', error);
      toast.error('Failed to initialize chat');
      throw error;
    }
  }

  private sendAudio(audioData: Float32Array): void {
    if (this.dataChannel?.readyState === 'open') {
      const buffer = this.encodeAudioData(audioData);
      this.dataChannel.send(JSON.stringify({
        type: 'audio',
        data: buffer,
      }));
    }
  }

  private encodeAudioData(audioData: Float32Array): number[] {
    return Array.from(audioData);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'transcription') {
        this.onMessageReceived(message.text);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  disconnect(): void {
    this.audioRecorder?.stop();
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.onStateChange(false);
  }
}