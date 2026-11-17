import { X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

interface CreatePlaylistModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export function CreatePlaylistModal({ open, onClose, onCreate }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setName('');
    setDescription('');
    setError('');
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a playlist name.');
      return;
    }
    onCreate(trimmed, description.trim());
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-playlist-title"
    >
      <div
        className="theme-panel w-full max-w-md p-6 space-y-4"
        style={{ backgroundColor: 'var(--bg-surface-elevated)' }}
      >
        <div className="flex items-center justify-between">
          <h2
            id="create-playlist-title"
            className="font-theme-display text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Create Playlist
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="playlist-name-input"
              className="block text-xs font-semibold"
              style={{ color: 'var(--text-secondary)' }}
            >
              Playlist Name
            </label>
            <input
              id="playlist-name-input"
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Night Drive"
              className="w-full px-3.5 py-2.5 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: 'var(--border-width) var(--border-style) var(--border-color)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
            {error && (
              <p role="alert" className="text-xs font-medium text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="playlist-desc-input"
              className="block text-xs font-semibold"
              style={{ color: 'var(--text-secondary)' }}
            >
              Description (optional)
            </label>
            <textarea
              id="playlist-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short mood or note..."
              className="w-full px-3.5 py-2 text-sm outline-none resize-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: 'var(--border-width) var(--border-style) var(--border-color)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="theme-btn-secondary px-4 py-2 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="theme-btn-primary px-5 py-2 text-xs sm:text-sm font-bold cursor-pointer"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
