'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/context';
import { t } from '@/lib/i18n';
import { AudioRecorder } from '@/lib/recorder';
import { BrowserSpeechRecognizer, isSpeechRecognitionSupported } from '@/lib/speech';
import Waveform from './Waveform';
import type { ExtractedTask } from '@/lib/types';

interface RecordButtonProps {
  language: 'en' | 'ar';
  onTasksExtracted: (tasks: ExtractedTask[], transcript: string) => void;
}

type RecordState = 'idle' | 'recording' | 'transcribing' | 'extracting';

export default function RecordButton({ language, onTasksExtracted }: RecordButtonProps) {
  const { lang } = useApp();
  const [state, setState] = useState<RecordState>('idle');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const recorderRef = useRef<AudioRecorder | null>(null);
  const speechRef = useRef<BrowserSpeechRecognizer | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const useBrowserSpeech = isSpeechRecognitionSupported();

  const startRecording = useCallback(async () => {
    setError('');
    setLiveTranscript('');

    try {
      // Start audio recorder (for waveform + fallback)
      const recorder = new AudioRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setAnalyser(recorder.getAnalyser());

      // Start browser speech recognition if available
      if (useBrowserSpeech) {
        const speech = new BrowserSpeechRecognizer(language, (result) => {
          setLiveTranscript(result.transcript);
        });
        speech.start();
        speechRef.current = speech;
      }

      setState('recording');
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch {
      setError(t(lang, 'record.noMic'));
    }
  }, [lang, language, useBrowserSpeech]);

  const stopRecording = useCallback(async () => {
    if (!recorderRef.current) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      // Stop audio recorder
      const audioBlob = await recorderRef.current.stop();
      setAnalyser(null);

      let transcript = '';

      // Try browser speech recognition first (free, instant)
      if (speechRef.current) {
        setState('transcribing');
        transcript = await speechRef.current.stop();
        speechRef.current = null;
      }

      // Fallback to Whisper API if no transcript and OpenAI configured
      if (!transcript || transcript.trim().length === 0) {
        setState('transcribing');
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('language', language);

        try {
          const transcribeRes = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          if (transcribeRes.ok) {
            const data = await transcribeRes.json();
            transcript = data.text || '';
          }
        } catch {}
      }

      if (!transcript || transcript.trim().length === 0) {
        throw new Error('No speech detected. Please try again.');
      }

      // Extract tasks with AI (gracefully fall back to single task)
      setState('extracting');
      let tasks;
      try {
        const extractRes = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript, language }),
        });

        if (extractRes.ok) {
          const data = await extractRes.json();
          tasks = data.tasks;
        }
      } catch {}

      // Fallback: single task from transcript
      if (!tasks || tasks.length === 0) {
        tasks = [{ title: transcript.substring(0, 200), description: transcript.length > 200 ? transcript : undefined }];
      }

      onTasksExtracted(tasks, transcript);
      setState('idle');
      setLiveTranscript('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t(lang, 'record.error'));
      setState('idle');
    }
  }, [language, lang, onTasksExtracted]);

  const handleClick = () => {
    if (state === 'idle') {
      startRecording();
    } else if (state === 'recording') {
      stopRecording();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isProcessing = state === 'transcribing' || state === 'extracting';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Waveform */}
      <Waveform analyser={analyser} isRecording={state === 'recording'} />

      {/* Live transcript preview */}
      {state === 'recording' && liveTranscript && (
        <div className="max-w-md w-full px-4 py-3 rounded-xl bg-jarvis-50 border border-jarvis-200 text-sm">
          <p className="text-[var(--foreground)]">{liveTranscript}</p>
        </div>
      )}

      {/* Record Button */}
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={`
          relative w-24 h-24 rounded-full flex items-center justify-center
          transition-all duration-300 shadow-lg
          ${state === 'recording'
            ? 'bg-record animate-pulse-record shadow-record/40'
            : isProcessing
              ? 'bg-jarvis-400 cursor-wait'
              : 'bg-jarvis-500 hover:bg-jarvis-600 active:scale-95 shadow-jarvis-500/30'
          }
        `}
      >
        {state === 'recording' && (
          <span className="absolute inset-0 rounded-full border-4 border-record/30 animate-ping" />
        )}

        {isProcessing ? (
          <Loader2 size={36} className="text-white animate-spin" />
        ) : state === 'recording' ? (
          <Square size={28} className="text-white" fill="white" />
        ) : (
          <Mic size={36} className="text-white" />
        )}
      </button>

      {/* Status text */}
      <div className="text-center min-h-[3rem]">
        {state === 'idle' && !error && (
          <p className="text-[var(--muted)] text-sm">{t(lang, 'record.tap')}</p>
        )}
        {state === 'recording' && (
          <div>
            <p className="text-record font-semibold">{t(lang, 'record.recording')}</p>
            <p className="text-[var(--muted)] text-sm font-mono mt-1">{formatTime(duration)}</p>
          </div>
        )}
        {state === 'transcribing' && (
          <p className="text-jarvis-500 font-medium">{t(lang, 'record.transcribing')}</p>
        )}
        {state === 'extracting' && (
          <p className="text-jarvis-500 font-medium">{t(lang, 'record.extracting')}</p>
        )}
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
