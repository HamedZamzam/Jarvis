// Browser-based speech recognition using Web Speech API
// Free, works in Chrome, Edge, Safari (limited). No API calls needed.

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: { transcript: string };
    };
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SpeechRecognition: any =
  typeof window !== 'undefined'
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export function isSpeechRecognitionSupported(): boolean {
  return !!SpeechRecognition;
}

export class BrowserSpeechRecognizer {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any;
  private finalTranscript = '';
  private interimTranscript = '';
  private onUpdate: (result: SpeechRecognitionResult) => void;
  private onEndCallback?: () => void;
  private isListening = false;

  constructor(language: 'en' | 'ar', onUpdate: (result: SpeechRecognitionResult) => void) {
    this.onUpdate = onUpdate;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          this.finalTranscript += text + ' ';
        } else {
          interim += text;
        }
      }
      this.interimTranscript = interim;
      this.onUpdate({
        transcript: (this.finalTranscript + interim).trim(),
        isFinal: false,
      });
    };

    this.recognition.onerror = (event: { error: string }) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onUpdate({
        transcript: this.finalTranscript.trim(),
        isFinal: true,
      });
      if (this.onEndCallback) this.onEndCallback();
    };
  }

  start(): void {
    if (this.isListening) return;
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.isListening = true;
    try {
      this.recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      this.isListening = false;
    }
  }

  stop(): Promise<string> {
    return new Promise((resolve) => {
      if (!this.isListening) {
        resolve(this.finalTranscript.trim());
        return;
      }
      this.onEndCallback = () => resolve(this.finalTranscript.trim());
      this.recognition.stop();
    });
  }

  getTranscript(): string {
    return (this.finalTranscript + this.interimTranscript).trim();
  }
}
