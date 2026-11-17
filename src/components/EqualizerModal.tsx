import { Activity, Disc3, RotateCcw, Scissors, Sliders, Volume2, X } from 'lucide-react';
import { useEffect } from 'react';
import type { EqPresetId, Track } from '../types/music';
import { EQ_BAND_LABELS, EQ_PRESETS, clampEqGainDb } from '../utils/audioEngine';

interface EqualizerModalProps {
  open: boolean;
  onClose: () => void;
  presetId: EqPresetId;
  gains: [number, number, number, number, number];
  autoLevelEnabled: boolean;
  deadAirSkipEnabled: boolean;
  vinylNoiseEnabled: boolean;
  currentTrack: Track | null;
  onSelectPreset: (presetId: Exclude<EqPresetId, 'custom'>) => void;
  onChangeBandGain: (bandIndex: number, dbValue: number) => void;
  onToggleAutoLevel: () => void;
  onToggleDeadAirSkip: () => void;
  onToggleVinylNoise: () => void;
}

export function EqualizerModal({
  open,
  onClose,
  presetId,
  gains,
  autoLevelEnabled,
  deadAirSkipEnabled,
  vinylNoiseEnabled,
  currentTrack,
  onSelectPreset,
  onChangeBandGain,
  onToggleAutoLevel,
  onToggleDeadAirSkip,
  onToggleVinylNoise,
}: EqualizerModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const activePresetMeta = EQ_PRESETS.find((p) => p.id === presetId);
  const currentGain = currentTrack?.replayGain ?? 1;
  const currentTrimStart = currentTrack?.trimStart ?? 0;
  const currentTrimEnd = currentTrack?.trimEnd ?? currentTrack?.duration ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Audio Equalizer & Smart FX"
        data-testid="equalizer-modal"
        onClick={(e) => e.stopPropagation()}
        className="theme-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5"
        style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          border: 'var(--border-width) var(--border-style) var(--border-strong)',
        }}
      >
        <div className="win95-titlebar" aria-hidden="true">
          <span>AUDIO_EQ_DSP.EXE</span>
          <span>_ □ ×</span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-9 h-9 flex items-center justify-center shrink-0"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
              }}
            >
              <Sliders className="w-4 h-4" aria-hidden="true" />
            </span>
            <div>
              <h2
                className="font-theme-display text-base sm:text-lg font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Equalizer &amp; Audio FX
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Real-time 5-band Web Audio DSP, ReplayGain leveling &amp; -50 dB silence trimming
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Equalizer modal"
            className="p-1.5 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Frequency Presets
            </span>
            <button
              type="button"
              onClick={() => onSelectPreset('flat')}
              className="inline-flex items-center gap-1 text-xs font-semibold cursor-pointer hover:underline"
              style={{ color: 'var(--accent-primary)' }}
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>Reset Flat</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {EQ_PRESETS.map((preset) => {
              const active = presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset.id)}
                  aria-pressed={active}
                  data-testid={`eq-preset-${preset.id}`}
                  className="px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
                  style={{
                    backgroundColor: active ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    color: active ? 'var(--text-on-accent)' : 'var(--text-primary)',
                    border: active
                      ? 'var(--border-width) var(--border-style) var(--accent-primary)'
                      : 'var(--border-width) var(--border-style) var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  {preset.name}
                </button>
              );
            })}
            {presetId === 'custom' && (
              <span
                className="px-3 py-1.5 text-xs font-semibold whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  color: 'var(--accent-primary)',
                  border: '1px solid var(--accent-primary)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                Custom Curve
              </span>
            )}
          </div>

          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {activePresetMeta
              ? activePresetMeta.description
              : 'Custom manual gain adjustments applied live to audio output.'}
          </p>
        </div>

        {/* 5-Band EQ Sliders */}
        <div
          className="p-4 space-y-3"
          style={{
            backgroundColor: 'var(--bg-input)',
            border: 'var(--border-width) var(--border-style) var(--border-color)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div className="grid grid-cols-5 gap-2 sm:gap-4 items-end">
            {EQ_BAND_LABELS.map((label, idx) => {
              const db = clampEqGainDb(gains[idx] ?? 0);
              const pct = ((db + 12) / 24) * 100;
              return (
                <div key={label} className="flex flex-col items-center gap-2">
                  <span
                    className="font-theme-mono text-xs font-bold tabular-nums"
                    style={{
                      color:
                        db > 0
                          ? 'var(--accent-primary)'
                          : db < 0
                            ? 'var(--accent-secondary)'
                            : 'var(--text-muted)',
                    }}
                  >
                    {db > 0 ? `+${db.toFixed(1)}` : db.toFixed(1)} dB
                  </span>

                  <div className="relative h-36 w-8 flex items-center justify-center">
                    <div
                      className="w-2 h-full rounded-full overflow-hidden relative"
                      style={{ backgroundColor: 'var(--track-rail)' }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 transition-all duration-150"
                        style={{
                          height: `${pct}%`,
                          backgroundColor: 'var(--accent-primary)',
                        }}
                      />
                    </div>
                    {/* Center 0dB reference tick */}
                    <div
                      className="absolute left-0 right-0 top-1/2 h-px pointer-events-none opacity-45"
                      style={{ backgroundColor: 'var(--text-muted)' }}
                    />
                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={0.5}
                      value={db}
                      aria-label={`${label} gain`}
                      data-testid={`eq-band-slider-${idx}`}
                      onChange={(e) => onChangeBandGain(idx, Number(e.target.value))}
                      className="absolute inset-0 w-36 h-8 origin-center -rotate-90 translate-y-14 -translate-x-14 opacity-0 cursor-pointer"
                    />
                  </div>

                  <span
                    className="font-theme-mono text-[11px] font-semibold whitespace-nowrap"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Smart Auto-Volume Leveler, Dead-Silence Trimmer & Vinyl Crackle */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onToggleAutoLevel}
            aria-pressed={autoLevelEnabled}
            data-testid="toggle-auto-level"
            className="p-3.5 text-left flex items-start justify-between gap-2.5 cursor-pointer transition-colors"
            style={{
              backgroundColor: autoLevelEnabled ? 'var(--accent-subtle)' : 'var(--bg-surface)',
              border: autoLevelEnabled
                ? 'var(--border-width) var(--border-style) var(--accent-primary)'
                : 'var(--border-width) var(--border-style) var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Volume2
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--accent-primary)' }}
                  aria-hidden="true"
                />
                <span
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Auto-Level
                </span>
              </div>
              <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                Normalizes RMS loudness across tracks (ReplayGain).
              </p>
              {currentTrack && (
                <p className="font-theme-mono text-[10px] pt-0.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  Gain ×{currentGain.toFixed(2)}
                </p>
              )}
            </div>
            <span
              className="px-2 py-0.5 text-[11px] font-bold shrink-0"
              style={{
                backgroundColor: autoLevelEnabled ? 'var(--accent-primary)' : 'var(--bg-input)',
                color: autoLevelEnabled ? 'var(--text-on-accent)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {autoLevelEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleDeadAirSkip}
            aria-pressed={deadAirSkipEnabled}
            data-testid="toggle-dead-air-skip"
            className="p-3.5 text-left flex items-start justify-between gap-2.5 cursor-pointer transition-colors"
            style={{
              backgroundColor: deadAirSkipEnabled ? 'var(--accent-subtle)' : 'var(--bg-surface)',
              border: deadAirSkipEnabled
                ? 'var(--border-width) var(--border-style) var(--accent-primary)'
                : 'var(--border-width) var(--border-style) var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Scissors
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--accent-secondary)' }}
                  aria-hidden="true"
                />
                <span
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Dead-Air Skip
                </span>
              </div>
              <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                Trims silence below -50 dB on track transitions.
              </p>
              {currentTrack && (
                <p className="font-theme-mono text-[10px] pt-0.5 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {currentTrimStart.toFixed(1)}s – {currentTrimEnd.toFixed(1)}s
                </p>
              )}
            </div>
            <span
              className="px-2 py-0.5 text-[11px] font-bold shrink-0"
              style={{
                backgroundColor: deadAirSkipEnabled ? 'var(--accent-primary)' : 'var(--bg-input)',
                color: deadAirSkipEnabled ? 'var(--text-on-accent)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {deadAirSkipEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={onToggleVinylNoise}
            aria-pressed={vinylNoiseEnabled}
            data-testid="toggle-vinyl-noise"
            className="p-3.5 text-left flex items-start justify-between gap-2.5 cursor-pointer transition-colors"
            style={{
              backgroundColor: vinylNoiseEnabled ? 'var(--accent-subtle)' : 'var(--bg-surface)',
              border: vinylNoiseEnabled
                ? 'var(--border-width) var(--border-style) var(--accent-primary)'
                : 'var(--border-width) var(--border-style) var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Disc3
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--accent-primary)' }}
                  aria-hidden="true"
                />
                <span
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Vinyl Crackle
                </span>
              </div>
              <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                Subtle analog surface hiss &amp; dust crackle while playing.
              </p>
            </div>
            <span
              className="px-2 py-0.5 text-[11px] font-bold shrink-0"
              style={{
                backgroundColor: vinylNoiseEnabled ? 'var(--accent-primary)' : 'var(--bg-input)',
                color: vinylNoiseEnabled ? 'var(--text-on-accent)' : 'var(--text-muted)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {vinylNoiseEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <span className="inline-flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" aria-hidden="true" />
            <span>EQ filters update the live Web Audio graph and visualizer in real time.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="theme-btn-primary px-4 py-1.5 text-xs font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
