import { useEffect, useRef } from 'react';
import type { ThemeId } from '../types/music';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  theme: ThemeId;
  height?: number;
  compact?: boolean;
}

/**
 * Theme-reactive live Web Audio API visualizer.
 * Adapts bar/wave geometry and stroke/fill rendering to each of the 10 themes.
 */
export function AudioVisualizer({
  analyser,
  isPlaying,
  theme,
  height = 36,
  compact = false,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const freqBuffer = new Uint8Array(analyser ? analyser.frequencyBinCount : 64);
    const timeBuffer = new Uint8Array(analyser ? analyser.fftSize : 128);
    let phase = 0;

    const readCssVar = (name: string, fallback: string) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return value || fallback;
    };

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.max(120, Math.floor(rect.width * dpr));
      const targetH = Math.max(24, Math.floor(height * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const accent = readCssVar('--accent-primary', '#1db954');
      const secondary = readCssVar('--accent-secondary', accent);
      const borderStrong = readCssVar('--border-strong', '#ffffff');

      let hasLiveSignal = false;
      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(freqBuffer);
        analyser.getByteTimeDomainData(timeBuffer);
        for (let i = 0; i < 24; i += 1) {
          if (freqBuffer[i] > 2) {
            hasLiveSignal = true;
            break;
          }
        }
      }

      phase += isPlaying ? 0.085 : 0.02;

      const getBarLevel = (idx: number, count: number) => {
        if (hasLiveSignal) {
          const bin = Math.min(freqBuffer.length - 1, Math.floor((idx / count) * 38));
          return Math.max(0.08, freqBuffer[bin] / 255);
        }
        if (!isPlaying) {
          return 0.1 + 0.06 * Math.sin(idx * 0.65 + phase);
        }
        // Fallback harmonic motion if headless audio sink returns zeroed frequency bins
        return (
          0.22 +
          0.45 * Math.abs(Math.sin(phase * 1.4 + idx * 0.45)) * Math.cos(idx * 0.25 + phase * 0.5) ** 2
        );
      };

      const barCount = compact ? 22 : 34;

      if (theme === 'terminal' || theme === 'blueprint') {
        // Oscilloscope / technical CAD waveform line
        ctx.save();
        ctx.strokeStyle = theme === 'terminal' ? '#00ff41' : '#ffffff';
        ctx.lineWidth = 2 * dpr;
        if (theme === 'terminal') {
          ctx.shadowColor = '#00ff41';
          ctx.shadowBlur = 8 * dpr;
        }
        ctx.beginPath();
        const points = 64;
        for (let i = 0; i < points; i += 1) {
          const x = (i / (points - 1)) * w;
          let amp = 0;
          if (hasLiveSignal) {
            const idx = Math.floor((i / points) * timeBuffer.length);
            amp = (timeBuffer[idx] - 128) / 128;
          } else {
            const env = isPlaying ? 0.65 : 0.15;
            amp = env * Math.sin(i * 0.35 + phase * 1.8) * Math.cos(i * 0.12 - phase);
          }
          const y = h / 2 + amp * (h * 0.38);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        if (theme === 'blueprint') {
          ctx.fillStyle = secondary;
          for (let i = 0; i < points; i += 8) {
            const x = (i / (points - 1)) * w;
            const y =
              h / 2 +
              (isPlaying ? 0.55 : 0.12) * Math.sin(i * 0.35 + phase * 1.8) * (h * 0.35);
            ctx.fillRect(x - 2 * dpr, y - 2 * dpr, 4 * dpr, 4 * dpr);
          }
        }
        ctx.restore();
      } else if (theme === 'pixel-retro') {
        // Blocky stepped 8-bit LED columns
        const gap = 3 * dpr;
        const stepW = (w - gap * (barCount - 1)) / barCount;
        const blocks = 6;
        const blockGap = 2 * dpr;
        const blockH = (h - blockGap * (blocks - 1)) / blocks;

        for (let i = 0; i < barCount; i += 1) {
          const level = getBarLevel(i, barCount);
          const lit = Math.max(1, Math.round(level * blocks));
          const x = i * (stepW + gap);
          for (let b = 0; b < lit; b += 1) {
            const y = h - (b + 1) * blockH - b * blockGap;
            ctx.fillStyle = b === blocks - 1 ? '#ff4ecd' : b >= blocks - 2 ? secondary : accent;
            ctx.fillRect(Math.round(x), Math.round(y), Math.max(2, Math.floor(stepW)), Math.max(2, Math.floor(blockH)));
          }
        }
      } else if (theme === 'comic-book') {
        // Bold black-outlined pop-art wave bars
        const gap = 4 * dpr;
        const barW = (w - gap * (barCount - 1)) / barCount;
        const colors = ['#f43f5e', '#22d3ee', '#ffd43b'];
        for (let i = 0; i < barCount; i += 1) {
          const level = getBarLevel(i, barCount);
          const barH = Math.max(6 * dpr, level * (h - 6 * dpr));
          const x = i * (barW + gap);
          const y = h - barH - 2 * dpr;
          ctx.fillStyle = colors[i % colors.length];
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          ctx.roundRect(x, y, Math.max(4, barW), barH, 3 * dpr);
          ctx.fill();
          ctx.stroke();
        }
      } else if (theme === 'cozy-paper') {
        // Hand-drawn ink vertical tick marks
        const gap = 4 * dpr;
        const step = (w - gap * (barCount - 1)) / barCount;
        ctx.strokeStyle = accent;
        ctx.lineWidth = 2 * dpr;
        ctx.lineCap = 'round';
        for (let i = 0; i < barCount; i += 1) {
          const level = getBarLevel(i, barCount);
          const barH = Math.max(4 * dpr, level * (h - 6 * dpr));
          const x = i * (step + gap) + step / 2;
          ctx.beginPath();
          ctx.moveTo(x, h - 2 * dpr);
          ctx.lineTo(x + Math.sin(i) * 1.2 * dpr, h - barH);
          ctx.stroke();
        }
      } else {
        // Classic Dark, Cyberpunk Neon, Frutiger Aero, Vaporwave, Claymorphism
        const gap = 3 * dpr;
        const barW = (w - gap * (barCount - 1)) / barCount;
        ctx.save();
        if (theme === 'cyberpunk-neon') {
          ctx.shadowColor = accent;
          ctx.shadowBlur = 10 * dpr;
        }
        for (let i = 0; i < barCount; i += 1) {
          const level = getBarLevel(i, barCount);
          const barH = Math.max(4 * dpr, level * (h - 4 * dpr));
          const x = i * (barW + gap);
          const y = h - barH;

          const grad = ctx.createLinearGradient(0, y, 0, h);
          grad.addColorStop(0, secondary);
          grad.addColorStop(1, accent);
          ctx.fillStyle = grad;

          const radius =
            theme === 'claymorphism' || theme === 'frutiger-aero'
              ? Math.min(barW / 2, 6 * dpr)
              : theme === 'vaporwave'
                ? 0
                : 3 * dpr;

          ctx.beginPath();
          ctx.roundRect(x, y, Math.max(2, barW), barH, radius);
          ctx.fill();

          if (theme === 'frutiger-aero') {
            ctx.strokeStyle = borderStrong;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(rafId);
  }, [analyser, compact, height, isPlaying, theme]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="audio-visualizer"
      aria-label="Live theme-reactive audio frequency visualizer"
      className="w-full block"
      style={{ height: `${height}px` }}
    />
  );
}
