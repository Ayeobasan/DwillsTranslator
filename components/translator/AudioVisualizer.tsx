'use client';

import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
  state: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  analyser,
  isActive,
  state,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (analyser && isActive) {
        analyser.getByteFrequencyData(dataArray);
      }

      const barWidth = (width / 32) - 2;
      let x = 0;

      for (let i = 0; i < 32; i++) {
        let barHeight = 4;

        if (isActive) {
          if (analyser) {
            const val = dataArray[i * 2] || 0;
            barHeight = Math.max(4, (val / 255) * height);
          } else {
            const time = Date.now() / 150;
            barHeight = Math.max(4, Math.sin(time + i * 0.4) * (height / 2) + (height / 2));
          }
        }

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        if (state === 'playing' || state === 'translating') {
          gradient.addColorStop(0, '#ea580c'); // Deep Orange
          gradient.addColorStop(1, '#f97316'); // Bright Orange
        } else {
          gradient.addColorStop(0, '#10b981'); // Emerald
          gradient.addColorStop(1, '#34d399'); // Mint
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, (height - barHeight) / 2, barWidth, barHeight, 4);
        ctx.fill();

        x += barWidth + 2;
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [analyser, isActive, state]);

  return (
    <div className="w-full flex items-center justify-center my-2">
      <canvas
        ref={canvasRef}
        width={320}
        height={36}
        className="w-full max-w-xs h-9 rounded-xl bg-zinc-950/80 border border-zinc-800 px-2"
      />
    </div>
  );
};
