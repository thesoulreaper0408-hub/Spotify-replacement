import { BookOpen, Check, Trash2, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import type { Track } from '../types/music';

interface TrackJournalModalProps {
  open: boolean;
  onClose: () => void;
  track: Track | null;
  onSaveNote: (trackId: string, note: string, noteDate: string) => void;
}

const MEMORY_CHIPS = [
  'Road trip 2026',
  'Late-night coding anthem',
  'Rainy window coffee session',
  'First concert memory',
];

export function TrackJournalModal({
  open,
  onClose,
  track,
  onSaveNote,
}: TrackJournalModalProps) {
  const [note, setNote] = useState('');
  const [noteDate, setNoteDate] = useState('');

  useEffect(() => {
    if (!open || !track) return;
    setNote(track.note ?? '');
    setNoteDate(track.noteDate ?? new Date().toISOString().slice(0, 10));
  }, [open, track]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !track) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveNote(track.id, note.trim(), noteDate.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label="Song Memory Journal"
        data-testid="track-journal-modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="theme-panel w-full max-w-md p-5 sm:p-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          border: 'var(--border-width) var(--border-style) var(--border-strong)',
        }}
      >
        <div className="win95-titlebar" aria-hidden="true">
          <span>SONG_JOURNAL.TXT</span>
          <span>_ □ ×</span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-5 h-5 shrink-0" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            <div className="min-w-0">
              <h2 className="font-theme-display text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                Memory Note: {track.title}
              </h2>
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {track.artist}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Journal modal"
            className="p-1 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {MEMORY_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setNote(chip)}
              className="px-2 py-1 text-[11px] font-medium cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="journal-note-input" className="text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>
            Personal Note
          </label>
          <textarea
            id="journal-note-input"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Write why this song matters to you..."
            className="w-full px-3 py-2 text-xs sm:text-sm outline-none resize-none"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
            }}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="journal-date-input" className="text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>
            Memory Date
          </label>
          <input
            id="journal-date-input"
            type="date"
            value={noteDate}
            onChange={(e) => setNoteDate(e.target.value)}
            className="w-full px-3 py-2 text-xs font-theme-mono outline-none"
            style={{
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-color)]">
          {track.note ? (
            <button
              type="button"
              onClick={() => {
                onSaveNote(track.id, '', '');
                onClose();
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 cursor-pointer hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear Note</span>
            </button>
          ) : (
            <span />
          )}

          <button
            type="submit"
            data-testid="save-journal-note"
            className="theme-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold cursor-pointer"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>Save Memory</span>
          </button>
        </div>
      </form>
    </div>
  );
}
