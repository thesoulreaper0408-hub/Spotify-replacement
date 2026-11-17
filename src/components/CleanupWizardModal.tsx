import { CheckCircle2, Pause, Play, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import type { Track } from '../types/music';
import { formatDuration } from '../utils/audioParser';
import { findDuplicateTrackGroups } from '../utils/libraryCleanup';

interface CleanupWizardModalProps {
  open: boolean;
  onClose: () => void;
  tracks: Track[];
  currentTrackId: string | null;
  isPlaying: boolean;
  onPreviewTrack: (track: Track) => void;
  onRemoveTrack: (trackId: string) => void;
}

function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return 'Unknown size';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function CleanupWizardModal({
  open,
  onClose,
  tracks,
  currentTrackId,
  isPlaying,
  onPreviewTrack,
  onRemoveTrack,
}: CleanupWizardModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const groups = useMemo(() => findDuplicateTrackGroups(tracks), [tracks]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Library Health and Duplicate Cleanup"
        data-testid="cleanup-wizard-modal"
        onClick={(e) => e.stopPropagation()}
        className="theme-panel w-full max-w-2xl max-h-[86vh] overflow-y-auto p-5 sm:p-6 space-y-5"
        style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          border: 'var(--border-width) var(--border-style) var(--border-strong)',
        }}
      >
        <div className="win95-titlebar" aria-hidden="true">
          <span>LIBRARY_HEALTH.WIZ</span>
          <span>_ □ ×</span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              className="font-theme-display text-base sm:text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Smart Duplicate &amp; Library Cleanup
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Scans {tracks.length} tracks for identical file sizes, sample rates, and near-duplicate titles.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Library Cleanup modal"
            className="p-1.5 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {groups.length === 0 ? (
          <div
            className="p-8 text-center space-y-2.5"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: 'var(--border-width) var(--border-style) var(--border-color)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <CheckCircle2
              className="w-10 h-10 mx-auto"
              style={{ color: 'var(--accent-primary)' }}
              aria-hidden="true"
            />
            <p className="font-theme-display text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Your library is sparkling clean
            </p>
            <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Zero duplicate audio files or conflicting near-identical titles were detected across your {tracks.length} tracks.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                Found {groups.length} duplicate {groups.length === 1 ? 'group' : 'groups'}
              </span>
            </div>

            {groups.map((group) => (
              <div
                key={group.id}
                className="p-3.5 space-y-2.5"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: 'var(--border-width) var(--border-style) var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
                    {group.reason}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      group.tracks
                        .filter((t) => t.id !== group.recommendedKeepId)
                        .forEach((t) => onRemoveTrack(t.id));
                    }}
                    className="theme-btn-primary px-2.5 py-1 text-[11px] font-bold cursor-pointer whitespace-nowrap"
                  >
                    Keep Best &amp; Remove Copies
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.tracks.map((track) => {
                    const isKeeper = track.id === group.recommendedKeepId;
                    const isPreviewing = track.id === currentTrackId && isPlaying;
                    return (
                      <div
                        key={track.id}
                        className="p-2.5 flex flex-col justify-between gap-2"
                        style={{
                          backgroundColor: isKeeper ? 'var(--accent-subtle)' : 'var(--bg-input)',
                          border: isKeeper
                            ? '1px solid var(--accent-primary)'
                            : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className="text-xs font-bold truncate"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {track.title}
                            </p>
                            {isKeeper && (
                              <span
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold shrink-0"
                                style={{
                                  backgroundColor: 'var(--accent-primary)',
                                  color: 'var(--text-on-accent)',
                                  borderRadius: 'var(--radius-sm)',
                                }}
                              >
                                <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                                Highest Quality
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                            {track.artist} · {formatDuration(track.duration)}
                          </p>
                          <p className="font-theme-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {formatBytes(track.fileSizeBytes)} ·{' '}
                            {track.sampleRate ? `${(track.sampleRate / 1000).toFixed(1)} kHz` : 'Demo WAV'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border-color)]">
                          <button
                            type="button"
                            onClick={() => onPreviewTrack(track)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                            style={{ color: 'var(--accent-primary)' }}
                          >
                            {isPreviewing ? (
                              <Pause className="w-3 h-3 fill-current" />
                            ) : (
                              <Play className="w-3 h-3 fill-current" />
                            )}
                            <span>{isPreviewing ? 'Pause' : 'Preview'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onRemoveTrack(track.id)}
                            aria-label={`Delete duplicate ${track.title}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 cursor-pointer hover:underline"
                          >
                            <Trash2 className="w-3 h-3" aria-hidden="true" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
