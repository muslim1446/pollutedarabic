import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { AcousticConfig } from '../types';

interface WaveformVisualizerProps {
  config: AcousticConfig;
  isPlaying: boolean;
  isClean: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  config,
  isPlaying,
  isClean
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = audioEngine.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    let animId: number;

    const draw = () => {
      const w = rect.width;
      const h = rect.height;

      // Clean canvas clear
      ctx.clearRect(0, 0, w, h);

      // Clean continuous line waveform - calm, smooth, zero dots
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (isPlaying) {
        audioEngine.getTimeDomainData(timeData);
        ctx.strokeStyle = isClean ? '#34c759' : '#007aff';
        ctx.beginPath();

        const sliceWidth = w / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          // Normalize value from byte 0..255 to canvas height
          const v = (timeData[i] - 128) / 128.0;
          const y = (h / 2) + v * (h * 0.42);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
      } else {
        // Calm resting baseline - clean single straight line, zero dots
        ctx.strokeStyle = '#e5e5ea';
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isClean, config]);

  return (
    <div className="w-full bg-white border border-black/[0.06] rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-2.5">
      {/* Visualizer Header */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#1d1d1f]">
            {isClean ? 'Clear Audio' : config.name}
          </span>
          <span className="text-[#8e8e93] text-[11px] hidden sm:inline">
            ({isClean ? 'Original sound without noise' : 'Sound with background noise'})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {isPlaying ? (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                isClean
                  ? 'bg-[#34c759]/10 text-[#34c759] border border-[#34c759]/20'
                  : 'bg-[#007aff]/10 text-[#007aff] border border-[#007aff]/20'
              }`}
            >
              Playing
            </span>
          ) : (
            <span className="text-[#8e8e93] text-[11px]">Tap play to listen</span>
          )}
        </div>
      </div>

      {/* Audio Waveform Canvas */}
      <div className="relative w-full h-16 bg-[#f5f5f7] rounded-xl overflow-hidden flex items-center px-3 border border-black/[0.03]">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};
