import { Check, ImagePlus, Palette, Pencil, RotateCcw, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { Track } from '../types/music';
import {
  normalizeTrackDetailsPayload,
  resizeCoverImageToDataUrl,
  type TrackDetailsDraft,
} from '../utils/coverArt';

interface CoverDesignerModalProps {
  open: boolean;
  onClose: () => void;
  track: Track | null;
  onSaveTrackDetails: (trackId: string, details: TrackDetailsDraft) => void;
}

type PatternKind = 'rings' | 'grid' | 'diagonal' | 'dots' | 'horizon';
type ArtworkSourceMode = 'photo' | 'studio';

const GRADIENT_PRESETS: Array<{ id: string; label: string; colors: [string, string, string] }> = [
  { id: 'emerald', label: 'Studio Emerald', colors: ['#0f2e1f', '#1db954', '#bbf7d0'] },
  { id: 'sunset', label: 'Vapor Sunset', colors: ['#3b0764', '#ff71ce', '#fffb96'] },
  { id: 'cyber', label: 'Cyber Cyan', colors: ['#070510', '#00f0ff', '#ff2a85'] },
  { id: 'amber', label: 'Warm Analog', colors: ['#451a03', '#f59e0b', '#fef3c7'] },
  { id: 'blueprint', label: 'Drafting Blue', colors: ['#0a2540', '#38bdf8', '#ffffff'] },
];

const PATTERN_OPTIONS: Array<{ id: PatternKind; label: string }> = [
  { id: 'rings', label: 'Vinyl Rings' },
  { id: 'grid', label: 'Synth Grid' },
  { id: 'diagonal', label: 'Diagonal Stripes' },
  { id: 'dots', label: 'Halftone Dots' },
  { id: 'horizon', label: 'Sun Horizon' },
];

const EMOJI_STAMPS = ['💿', '🎧', '🎹', '⚡', '🌙', '🌊', '🔥', '🚀'];

export function CoverDesignerModal({
  open,
  onClose,
  track,
  onSaveTrackDetails,
}: CoverDesignerModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [draftTitle, setDraftTitle] = useState('');
  const [draftArtist, setDraftArtist] = useState('');
  const [draftAlbum, setDraftAlbum] = useState('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(undefined);
  const [artworkMode, setArtworkMode] = useState<ArtworkSourceMode>('studio');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [gradientId, setGradientId] = useState('emerald');
  const [pattern, setPattern] = useState<PatternKind>('rings');
  const [emoji, setEmoji] = useState('💿');
  const [showTypography, setShowTypography] = useState(true);

  useEffect(() => {
    if (!open || !track) return;
    setDraftTitle(track.title);
    setDraftArtist(track.artist);
    setDraftAlbum(track.album);
    setPhotoDataUrl(track.customCoverUrl);
    setArtworkMode(track.customCoverUrl ? 'photo' : 'studio');
    setUploadError(null);
  }, [open, track]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !track || artworkMode !== 'studio' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const S = 512;
    canvas.width = S;
    canvas.height = S;

    const preset = GRADIENT_PRESETS.find((g) => g.id === gradientId) ?? GRADIENT_PRESETS[0];
    const [c0, c1, c2] = preset.colors;

    const grad = ctx.createLinearGradient(0, 0, S, S);
    grad.addColorStop(0, c0);
    grad.addColorStop(0.55, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, S, S);

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
    if (pattern === 'rings') {
      for (let r = 64; r <= 230; r += 38) {
        ctx.lineWidth = r % 76 === 0 ? 4 : 2;
        ctx.beginPath();
        ctx.arc(S / 2, S / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (pattern === 'grid') {
      ctx.lineWidth = 2;
      for (let pos = 48; pos < S; pos += 48) {
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, S);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(S, pos);
        ctx.stroke();
      }
    } else if (pattern === 'diagonal') {
      ctx.lineWidth = 14;
      for (let x = -S; x < S * 2; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + S, S);
        ctx.stroke();
      }
    } else if (pattern === 'dots') {
      for (let y = 32; y < S; y += 36) {
        for (let x = 32; x < S; x += 36) {
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (pattern === 'horizon') {
      ctx.beginPath();
      ctx.arc(S / 2, S * 0.56, 120, Math.PI, 0);
      ctx.fill();
      ctx.lineWidth = 3;
      for (let y = S * 0.58; y < S; y += 26) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(S, y);
        ctx.stroke();
      }
    }
    ctx.restore();

    if (emoji) {
      ctx.font = '112px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, S / 2, showTypography ? S * 0.42 : S * 0.5);
    }

    if (showTypography) {
      const displayTitle = draftTitle.trim() || track.title;
      const displayArtist = draftArtist.trim() || track.artist;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
      ctx.fillRect(0, S - 148, S, 148);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.fillText(displayTitle.slice(0, 22), 32, S - 82);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '600 20px "JetBrains Mono", monospace';
      ctx.fillText(displayArtist.slice(0, 28), 32, S - 42);
    }
  }, [open, track, artworkMode, gradientId, pattern, emoji, showTypography, draftTitle, draftArtist]);

  if (!open || !track) return null;

  const handleImagePick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    try {
      const resized = await resizeCoverImageToDataUrl(file);
      setPhotoDataUrl(resized);
      setArtworkMode('photo');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Unable to load selected picture.');
    }
  };

  const handleSave = () => {
    let coverToSave: string | undefined;
    if (artworkMode === 'photo') {
      coverToSave = photoDataUrl;
    } else if (canvasRef.current) {
      coverToSave = canvasRef.current.toDataURL('image/png');
    }

    const normalized = normalizeTrackDetailsPayload(
      {
        title: draftTitle,
        artist: draftArtist,
        album: draftAlbum,
        customCoverUrl: coverToSave,
      },
      track
    );
    onSaveTrackDetails(track.id, normalized);
    onClose();
  };

  const handleResetPictureOnly = () => {
    const normalized = normalizeTrackDetailsPayload(
      {
        title: draftTitle,
        artist: draftArtist,
        album: draftAlbum,
        customCoverUrl: undefined,
      },
      track
    );
    onSaveTrackDetails(track.id, normalized);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit Song and Picture"
        data-testid="cover-designer-modal"
        onClick={(e) => e.stopPropagation()}
        className="theme-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4"
        style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          border: 'var(--border-width) var(--border-style) var(--border-strong)',
        }}
      >
        <div className="win95-titlebar" aria-hidden="true">
          <span>EDIT_SONG_AND_COVER.EXE</span>
          <span>_ □ ×</span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} aria-hidden="true" />
            <div>
              <h2 className="font-theme-display text-base sm:text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                Edit Song &amp; Picture
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Rename song metadata or upload / design custom album artwork
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Edit Song modal"
            className="p-1.5 cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden Image File Picker */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImagePick}
          data-testid="upload-cover-input"
          className="sr-only"
          aria-label="Upload custom song picture"
        />

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-5 items-start">
          {/* Left: Cover Preview + Upload Picture Action */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-full max-w-[230px] aspect-square overflow-hidden flex items-center justify-center"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: 'var(--border-width) var(--border-style) var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              {artworkMode === 'photo' && photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt={draftTitle || track.title}
                  data-testid="cover-photo-preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <canvas
                  ref={canvasRef}
                  aria-label="Custom cover artwork preview"
                  className="w-full h-full block"
                />
              )}
            </div>

            <div className="w-full max-w-[230px] space-y-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                data-testid="upload-cover-button"
                className="theme-btn-secondary w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold cursor-pointer"
              >
                <ImagePlus className="w-4 h-4" aria-hidden="true" />
                <span>{photoDataUrl ? 'Change Picture File' : 'Upload Picture File'}</span>
              </button>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (photoDataUrl) {
                      setArtworkMode('photo');
                    } else {
                      imageInputRef.current?.click();
                    }
                  }}
                  aria-pressed={artworkMode === 'photo'}
                  className="px-2 py-1.5 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  style={{
                    backgroundColor: artworkMode === 'photo' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    color: artworkMode === 'photo' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <ImagePlus className="w-3 h-3" aria-hidden="true" />
                  <span>Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setArtworkMode('studio')}
                  aria-pressed={artworkMode === 'studio'}
                  className="px-2 py-1.5 text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer"
                  style={{
                    backgroundColor: artworkMode === 'studio' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    color: artworkMode === 'studio' ? 'var(--text-on-accent)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <Palette className="w-3 h-3" aria-hidden="true" />
                  <span>Designer</span>
                </button>
              </div>

              {uploadError && (
                <p className="text-[11px] text-red-400 text-center">{uploadError}</p>
              )}
            </div>
          </div>

          {/* Right: Track Metadata Fields & Custom Artwork Controls */}
          <div className="space-y-4">
            <div className="space-y-2.5">
              <div>
                <label
                  htmlFor="edit-song-title"
                  className="block text-xs font-bold uppercase tracking-wider mb-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Song Title
                </label>
                <input
                  id="edit-song-title"
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  data-testid="edit-track-title-input"
                  placeholder="Enter song title"
                  className="w-full px-3 py-2 text-xs sm:text-sm font-semibold outline-none"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="edit-song-artist"
                    className="block text-xs font-bold uppercase tracking-wider mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Artist
                  </label>
                  <input
                    id="edit-song-artist"
                    type="text"
                    value={draftArtist}
                    onChange={(e) => setDraftArtist(e.target.value)}
                    data-testid="edit-track-artist-input"
                    placeholder="Artist name"
                    className="w-full px-3 py-2 text-xs sm:text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="edit-song-album"
                    className="block text-xs font-bold uppercase tracking-wider mb-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Album
                  </label>
                  <input
                    id="edit-song-album"
                    type="text"
                    value={draftAlbum}
                    onChange={(e) => setDraftAlbum(e.target.value)}
                    data-testid="edit-track-album-input"
                    placeholder="Album name"
                    className="w-full px-3 py-2 text-xs sm:text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  />
                </div>
              </div>
            </div>

            {artworkMode === 'photo' && photoDataUrl ? (
              <div
                className="p-3.5 space-y-2"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--accent-primary)' }}>
                  <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Custom Picture Ready</span>
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Your uploaded image is cropped square and will appear across the Track List, Now Playing Bar, Up Next Queue, Record Shelf, and Song View.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-1 border-t border-[var(--border-color)]">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Mesh Gradient
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {GRADIENT_PRESETS.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGradientId(g.id)}
                        aria-pressed={gradientId === g.id}
                        className="px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        style={{
                          backgroundColor: gradientId === g.id ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                          color: gradientId === g.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                          border:
                            gradientId === g.id
                              ? '1px solid var(--accent-primary)'
                              : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${g.colors[0]}, ${g.colors[1]})`,
                          }}
                        />
                        <span>{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Pattern Overlay
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PATTERN_OPTIONS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPattern(p.id)}
                        aria-pressed={pattern === p.id}
                        className="px-2.5 py-1 text-xs font-semibold cursor-pointer"
                        style={{
                          backgroundColor: pattern === p.id ? 'var(--accent-primary)' : 'var(--bg-surface)',
                          color: pattern === p.id ? 'var(--text-on-accent)' : 'var(--text-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {EMOJI_STAMPS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEmoji(em)}
                        className="w-7 h-7 text-sm flex items-center justify-center cursor-pointer"
                        style={{
                          backgroundColor: emoji === em ? 'var(--accent-subtle)' : 'var(--bg-input)',
                          border:
                            emoji === em
                              ? '1px solid var(--accent-primary)'
                              : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {em}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTypography((v) => !v)}
                    aria-pressed={showTypography}
                    className="px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                    style={{
                      backgroundColor: showTypography ? 'var(--accent-subtle)' : 'var(--bg-input)',
                      color: showTypography ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {showTypography ? '✓ Title On' : 'Title Off'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-color)]">
              {(track.customCoverUrl || photoDataUrl) && (
                <button
                  type="button"
                  onClick={handleResetPictureOnly}
                  className="theme-btn-secondary inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Reset Art</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                data-testid="save-custom-cover"
                className="theme-btn-primary flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold cursor-pointer"
              >
                <Check className="w-4 h-4" aria-hidden="true" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
