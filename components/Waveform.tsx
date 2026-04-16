'use client';

import { useEffect, useRef } from 'react';

interface WaveformProps {
  analyser: AnalyserNode | null;
  isRecording: boolean;
}

export default function Waveform({ analyser, isRecording }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!isRecording || !analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barCount = 40;
      const barWidth = canvas.width / barCount - 2;
      const centerY = canvas.height / 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex] / 255;
        const barHeight = Math.max(4, value * centerY * 0.9);

        const hue = 220 + value * 20; // Blue range
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.6 + value * 0.4})`;

        const x = i * (barWidth + 2);
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, 2);
        ctx.fill();
      }
    };

    draw();

    return () => cancelAnimationFrame(animationRef.current);
  }, [analyser, isRecording]);

  if (!isRecording) return null;

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={80}
      className="w-full max-w-xs h-20 mx-auto"
    />
  );
}
