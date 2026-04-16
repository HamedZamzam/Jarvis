// Audio recorder that works on both iOS Safari and Chrome/Edge
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private audioContext: AudioContext | null = null;
  private startTime = 0;

  async start(): Promise<void> {
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Set up analyser for waveform visualization
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    // Detect best supported audio format
    const mimeType = this.getSupportedMimeType();
    const options: MediaRecorderOptions = mimeType ? { mimeType } : {};

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.mediaRecorder.start(1000); // collect chunks every second
    this.startTime = Date.now();
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.chunks, { type: mimeType });
        this.cleanup();
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getDuration(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  private cleanup() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.audioContext?.close();
    this.stream = null;
    this.audioContext = null;
    this.analyser = null;
    this.mediaRecorder = null;
  }

  private getSupportedMimeType(): string | undefined {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return undefined; // let browser pick default
  }
}

// Singleton instance
let recorderInstance: AudioRecorder | null = null;

export function getRecorder(): AudioRecorder {
  if (!recorderInstance) recorderInstance = new AudioRecorder();
  return recorderInstance;
}
