import { Check, Download, Quote, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { THEME_COVER_PALETTES, THEME_OPTIONS } from '../themes/themes';
import type { ThemeId, Track } from '../types/music';

type CardTemplate = 'album-glass' | 'minimal-bold' | 'retro-cassette' | 'active-theme';

interface LyricCardModalProps {
  open: boolean;
  onClose: () => void;
  track: Track | null;
  theme: ThemeId;
}

const TEMPLATE_OPTIONS: Array<{ id: CardTemplate; label: string }> = [
  { id: 'album-glass', label: 'Album Art Glass' },
  { id: 'minimal-bold', label: 'Minimalist Bold' },
  { id: 'retro-cassette', label: 'Retro Cassette' },
  { id: 'active-theme', label: 'Active Theme' },
];

export function LyricCardModal({ open, onClose, track, theme }: LyricCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [customQuote, setCustomQuote] = useState('');
  const [template, setTemplate] = useState<CardTemplate>('album-glass');

  useEffect(() => {
    if (!open || !track) return;
    const initial = (track.lyrics ?? []).slice(0, 2).map((l) => l.text);
    setSelectedLines(initial);
    setCustomQuote(
      initial.length === 0 ? `Listening closely to ${track.title} on ChordDeck.` : ''
    );
  }, [open, track]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const quoteLines =
    selectedLines.length > 0
      ? selectedLines
      : customQuote.trim()
        ? customQuote.trim().split('\n').slice(0, 4)
        : [`"${track?.title ?? 'Untitled'}"`];

  useEffect(() => {
    if (!open || !track || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 720;
    const H = 900;
    canvas.width = W;
    canvas.height = H;

    const paletteList = THEME_COVER_PALETTES[theme];
    const [pBg, pPrimary, pHighlight] = paletteList[track.coverSeed % paletteList.length];
    const themeMeta = THEME_OPTIONS.find((t) => t.id === theme) ?? THEME_OPTIONS[0];

    // Background render by template
    if (template === 'minimal-bold') {
      ctx.fillStyle = '#faf8f2';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = pPrimary;
      ctx.fillRect(0, 0, W, 24);
    } else if (template === 'retro-cassette') {
      ctx.fillStyle = '#1b1716';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#e76f51';
      ctx.fillRect(48, 56, W - 96, 16);
      ctx.fillStyle = '#f4a261';
      ctx.fillRect(48, 76, W - 96, 12);
      ctx.strokeStyle = '#e9c46a';
      ctx.lineWidth = 4;
      ctx.strokeRect(48, 110, W - 96, H - 200);
    } else if (template === 'active-theme') {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, themeMeta.swatches[0]);
      grad.addColorStop(0.55, pBg);
      grad.addColorStop(1, themeMeta.swatches[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, pBg);
      grad.addColorStop(0.6, pPrimary);
      grad.addColorStop(1, '#0d0d12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Glass panel frame
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(48, 72, W - 96, H - 144, 28);
      ctx.fill();
      ctx.stroke();
    }

    const fgColor = template === 'minimal-bold' ? '#141414' : '#ffffff';
    const subColor =
      template === 'minimal-bold'
        ? '#52525b'
        : template === 'retro-cassette'
          ? '#f4a261'
          : 'rgba(255,255,255,0.78)';

    // Header badge + track metadata
    ctx.fillStyle = template === 'minimal-bold' ? pPrimary : pHighlight;
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText('CHORDDECK · LYRIC CARD', 84, 150);

    ctx.fillStyle = fgColor;
    ctx.font = 'bold 34px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(track.title.slice(0, 30), 84, 210);

    ctx.fillStyle = subColor;
    ctx.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillText(`${track.artist} — ${track.album}`.slice(0, 42), 84, 246);

    // Divider line
    ctx.strokeStyle = subColor;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(84, 280);
    ctx.lineTo(W - 84, 280);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Wrapped Lyric Lines
    ctx.fillStyle = fgColor;
    ctx.font = 'bold 36px "Plus Jakarta Sans", Georgia, serif';
    let y = 365;
    const maxLineW = W - 168;

    for (const rawLine of quoteLines.slice(0, 4)) {
      const words = rawLine.split(/\s+/);
      let current = '';
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxLineW && current) {
          ctx.fillText(current, 84, y);
          y += 50;
          current = word;
        } else {
          current = test;
        }
      }
      if (current) {
        ctx.fillText(current, 84, y);
        y += 62;
      }
      if (y > H - 170) break;
    }

    // Footer signature
    ctx.fillStyle = subColor;
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillText(
      `${themeMeta.emoji} ${themeMeta.label.toUpperCase()} · ${track.bpm ?? 112} BPM`,
      84,
      H - 104
    );
  }, [open, track, theme, template, quoteLines]);

  if (!open || !track) return null;

  const toggleLine = (lineText: string) => {
    setSelectedLines((prev) => {
      if (prev.includes(lineText)) {
        return prev.filter((item) => item !== lineText);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), lineText];
      }
      return [...prev, lineText];
    });
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${track.title.replace(/[^a-z0-9]+/gi, '_').toLowerCase()}_lyric_card.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const lyrics = track.lyrics ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create Lyric Quote Card"
        data-testid="lyric-card-modal"
        onClick={(e) => e.stopPropagation()}
        className="theme-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          border: 'var(--border-width) var(--border-style) var(--border-strong)',
        }}
      >
        <div className="win95-titlebar" aria-hidden="true">
          <span>LYRIC_CARD_STUDIO.PNG</span>
          <span>_ □ ×</span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Quote className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            <div>
              <h2 className="font-theme-display text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Lyric &amp; Quote Card Studio
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Pick up to 4 lyric lines or write a custom quote, choose a template, and export PNG.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lyric Card Studio"
            className="p-1.5 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* Controls */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Card Template
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {TEMPLATE_OPTIONS.map((opt) => {
                  const active = template === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTemplate(opt.id)}
                      aria-pressed={active}
                      className="px-2.5 py-2 text-xs font-semibold cursor-pointer text-left"
                      style={{
                        backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                        color: active ? 'var(--text-on-accent)' : 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {lyrics.length > 0 ? (
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Select Lyrics ({selectedLines.length}/4)
                </span>
                <div
                  className="max-h-48 overflow-y-auto space-y-1 p-2"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {lyrics.map((line, i) => {
                    const checked = selectedLines.includes(line.text);
                    return (
                      <button
                        key={`${line.time}-${i}`}
                        type="button"
                        onClick={() => toggleLine(line.text)}
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-left text-xs cursor-pointer"
                        style={{
                          backgroundColor: checked ? 'var(--accent-subtle)' : 'transparent',
                          color: checked ? 'var(--accent-primary)' : 'var(--text-primary)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <span className="truncate">{line.text}</span>
                        {checked && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label
                htmlFor="custom-quote-input"
                className="text-xs font-bold uppercase tracking-wider block"
                style={{ color: 'var(--text-muted)' }}
              >
                Or Custom Quote
              </label>
              <textarea
                id="custom-quote-input"
                rows={3}
                value={customQuote}
                onChange={(e) => {
                  setCustomQuote(e.target.value);
                  if (e.target.value.trim()) setSelectedLines([]);
                }}
                placeholder="Type favorite lyric or listening note..."
                className="w-full px-3 py-2 text-xs outline-none resize-none"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleDownloadPng}
              data-testid="download-lyric-card-png"
              className="theme-btn-primary w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold cursor-pointer"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span>Download High-Res PNG</span>
            </button>
          </div>

          {/* Live Canvas Preview */}
          <div className="flex flex-col items-center gap-2">
            <canvas
              ref={canvasRef}
              aria-label="Lyric card PNG preview"
              className="w-full max-w-[290px] aspect-[4/5] shadow-xl"
              style={{
                border: 'var(--border-width) var(--border-style) var(--border-color)',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
