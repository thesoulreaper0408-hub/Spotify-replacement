import type { ThemeId, Track } from '../types/music';
import { THEME_COVER_PALETTES } from '../themes/themes';

interface ThemeArtworkProps {
  theme: ThemeId;
  seed: number;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'track' | 'liked' | 'library' | 'playlist';
  customCoverUrl?: string;
}

const SIZE_CLASSES: Record<NonNullable<ThemeArtworkProps['size']>, string> = {
  xs: 'w-9 h-9',
  sm: 'w-11 h-11',
  md: 'w-14 h-14',
  lg: 'w-32 h-32 sm:w-40 sm:h-40',
  xl: 'w-full aspect-square max-w-[260px]',
};

const HEART_PATH =
  'M40 54s-14-9-14-18.4c0-4.7 3.7-8.4 8.2-8.4 2.6 0 4.8 1.3 5.8 3.3 1-2 3.2-3.3 5.8-3.3 4.5 0 8.2 3.7 8.2 8.4C54 45 40 54 40 54z';

export function ThemeArtwork({
  theme,
  seed,
  title = 'Album Art',
  size = 'sm',
  variant = 'track',
  customCoverUrl,
}: ThemeArtworkProps) {
  const palettes = THEME_COVER_PALETTES[theme];
  const palette = palettes[seed % palettes.length];
  const [bg, primary, highlight] = palette;

  const sizeCls = SIZE_CLASSES[size];
  const isLarge = size === 'lg' || size === 'xl';
  const showCustomImage = Boolean(customCoverUrl);

  return (
    <div
      className={`relative shrink-0 overflow-hidden select-none flex items-center justify-center ${sizeCls}`}
      style={{
        backgroundColor: bg,
        border: 'var(--border-width) var(--border-style) var(--border-color)',
        borderRadius: isLarge ? 'var(--radius-md)' : 'var(--radius-sm)',
        boxShadow: isLarge ? 'var(--shadow-card)' : undefined,
      }}
      aria-label={title}
    >
      {showCustomImage ? (
        <img
          src={customCoverUrl}
          alt={title}
          draggable={false}
          className="w-full h-full object-cover"
        />
      ) : null}

      {!showCustomImage && theme === 'classic-dark' && (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id={`grad-${seed}-${variant}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={bg} />
              <stop offset="100%" stopColor={primary} stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" fill={`url(#grad-${seed}-${variant})`} />
          {variant === 'liked' ? (
            <path d={HEART_PATH} fill={highlight} data-testid="liked-heart-only" />
          ) : (
            <>
              <circle cx="40" cy="40" r="24" fill="none" stroke={highlight} strokeOpacity="0.35" strokeWidth="2" />
              <circle cx="40" cy="40" r="14" fill="none" stroke={highlight} strokeOpacity="0.65" strokeWidth="2" />
              <circle cx="40" cy="40" r="5" fill={highlight} />
            </>
          )}
        </svg>
      )}

      {!showCustomImage && theme === 'pixel-retro' && (
        <svg viewBox="0 0 16 16" className="w-full h-full" shapeRendering="crispEdges" aria-hidden="true">
          <rect width="16" height="16" fill={bg} />
          <rect x="1" y="1" width="14" height="14" fill="none" stroke={primary} strokeWidth="1" />
          {variant === 'liked' ? (
            <g data-testid="liked-heart-only">
              <rect x="4" y="4" width="3" height="2" fill={highlight} />
              <rect x="9" y="4" width="3" height="2" fill={highlight} />
              <rect x="3" y="5" width="10" height="3" fill={highlight} />
              <rect x="4" y="8" width="8" height="2" fill={highlight} />
              <rect x="6" y="10" width="4" height="2" fill={highlight} />
              <rect x="7" y="12" width="2" height="1" fill={highlight} />
            </g>
          ) : (
            <>
              <rect x="3" y="9" width="2" height="4" fill={primary} />
              <rect x="6" y="5" width="2" height="8" fill={highlight} />
              <rect x="9" y="7" width="2" height="6" fill={primary} />
              <rect x="12" y="3" width="2" height="10" fill={highlight} />
            </>
          )}
        </svg>
      )}

      {!showCustomImage && theme === 'comic-book' && (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
          <rect width="80" height="80" fill={bg} />
          {variant === 'liked' ? (
            <path
              d={HEART_PATH}
              fill={primary}
              stroke="#000000"
              strokeWidth="3"
              data-testid="liked-heart-only"
            />
          ) : (
            <>
              <circle cx="20" cy="20" r="14" fill={primary} stroke="#000000" strokeWidth="3" />
              <polygon points="55,14 63,34 45,28" fill="#ffffff" stroke="#000000" strokeWidth="3" />
              <rect x="26" y="38" width="34" height="24" rx="4" fill="#ffffff" stroke="#000000" strokeWidth="3" />
            </>
          )}
        </svg>
      )}

      {!showCustomImage && theme === 'cyberpunk-neon' && (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
          <rect width="80" height="80" fill={bg} />
          {variant === 'liked' ? (
            <path
              d={HEART_PATH}
              fill={primary}
              stroke={highlight}
              strokeWidth="2.5"
              data-testid="liked-heart-only"
            />
          ) : (
            <>
              <line x1="0" y1="54" x2="80" y2="54" stroke={highlight} strokeOpacity="0.45" strokeWidth="1.5" />
              <line x1="0" y1="64" x2="80" y2="64" stroke={highlight} strokeOpacity="0.3" strokeWidth="1" />
              <line x1="20" y1="54" x2="6" y2="80" stroke={primary} strokeOpacity="0.4" strokeWidth="1" />
              <line x1="60" y1="54" x2="74" y2="80" stroke={primary} strokeOpacity="0.4" strokeWidth="1" />
              <polygon points="40,14 62,48 18,48" fill="none" stroke={primary} strokeWidth="2.5" />
              <circle cx="40" cy="36" r="6" fill={highlight} fillOpacity="0.85" />
            </>
          )}
        </svg>
      )}

      {!showCustomImage && theme === 'cozy-paper' && (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
          <rect width="80" height="80" fill={bg} />
          <rect x="8" y="8" width="64" height="64" rx="6" fill="none" stroke={highlight} strokeWidth="1.5" strokeDasharray="4 3" />
          {variant === 'liked' ? (
            <path
              d={HEART_PATH}
              fill={primary}
              fillOpacity="0.85"
              stroke={highlight}
              strokeWidth="2"
              data-testid="liked-heart-only"
            />
          ) : (
            <>
              <circle cx="40" cy="40" r="18" fill="none" stroke={highlight} strokeWidth="2" />
              <circle cx="40" cy="40" r="6" fill={primary} fillOpacity="0.35" stroke={highlight} strokeWidth="1.5" />
            </>
          )}
        </svg>
      )}

      {!showCustomImage && theme === 'frutiger-aero' && (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id={`aero-${seed}-${variant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="48%" stopColor={bg} />
              <stop offset="100%" stopColor={primary} stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <rect width="80" height="80" fill={`url(#aero-${seed}-${variant})`} />
          {variant === 'liked' ? (
            <path d={HEART_PATH} fill="#ffffff" fillOpacity="0.92" data-testid="liked-heart-only" />
          ) : (
            <>
              <circle cx="40" cy="44" r="20" fill={highlight} fillOpacity="0.85" />
              <ellipse cx="40" cy="24" rx="28" ry="14" fill="#ffffff" fillOpacity="0.65" />
              <circle cx="40" cy="44" r="7" fill="#ffffff" />
            </>
          )}
        </svg>
      )}

      {!showCustomImage && theme === 'vaporwave' && (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id={`vw-${seed}-${variant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primary} />
              <stop offset="65%" stopColor={highlight} />
              <stop offset="100%" stopColor={bg} />
            </linearGradient>
          </defs>
          <rect width="80" height="80" fill={`url(#vw-${seed}-${variant})`} />
          {variant === 'liked' ? (
            <path d={HEART_PATH} fill="#fffb96" fillOpacity="0.95" data-testid="liked-heart-only" />
          ) : (
            <>
              <circle cx="40" cy="34" r="18" fill="#fffb96" fillOpacity="0.9" />
              <rect x="0" y="34" width="80" height="3" fill={bg} fillOpacity="0.7" />
              <rect x="0" y="41" width="80" height="4" fill={bg} fillOpacity="0.8" />
              <line x1="0" y1="54" x2="80" y2="54" stroke="#01cdfe" strokeWidth="1.5" />
              <line x1="0" y1="64" x2="80" y2="64" stroke="#ff71ce" strokeWidth="1.5" />
            </>
          )}
        </svg>
      )}

      {!showCustomImage && theme === 'blueprint' && (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
          <rect width="80" height="80" fill={bg} />
          {variant === 'liked' ? (
            <path
              d={HEART_PATH}
              fill="none"
              stroke={highlight}
              strokeWidth="2.5"
              data-testid="liked-heart-only"
            />
          ) : (
            <>
              <line x1="40" y1="6" x2="40" y2="74" stroke={highlight} strokeOpacity="0.35" strokeDasharray="3 3" />
              <line x1="6" y1="40" x2="74" y2="40" stroke={highlight} strokeOpacity="0.35" strokeDasharray="3 3" />
              <circle cx="40" cy="40" r="22" fill="none" stroke={primary} strokeWidth="1.5" />
              <rect x="24" y="24" width="32" height="32" fill="none" stroke={highlight} strokeWidth="1" />
              <circle cx="40" cy="40" r="4" fill="none" stroke={primary} strokeWidth="1.5" />
            </>
          )}
        </svg>
      )}

      {!showCustomImage && theme === 'claymorphism' && (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
          <rect width="80" height="80" fill={bg} />
          {variant === 'liked' ? (
            <path d={HEART_PATH} fill={primary} data-testid="liked-heart-only" />
          ) : (
            <>
              <rect x="16" y="18" width="48" height="44" rx="16" fill={primary} fillOpacity="0.85" />
              <circle cx="40" cy="40" r="13" fill="#ffffff" fillOpacity="0.9" />
              <circle cx="52" cy="28" r="5" fill={highlight} />
            </>
          )}
        </svg>
      )}

      {!showCustomImage && theme === 'terminal' && (
        <svg viewBox="0 0 80 80" className="w-full h-full" aria-hidden="true">
          <rect width="80" height="80" fill={bg} />
          <rect x="6" y="6" width="68" height="68" fill="none" stroke={primary} strokeWidth="1.5" />
          {variant === 'liked' ? (
            <path d={HEART_PATH} fill={primary} data-testid="liked-heart-only" />
          ) : (
            <>
              <polyline
                points="14,44 26,44 32,26 40,56 48,30 56,44 66,44"
                fill="none"
                stroke={primary}
                strokeWidth="2.5"
              />
              <rect x="14" y="14" width="12" height="4" fill={highlight} />
            </>
          )}
        </svg>
      )}
    </div>
  );
}

interface PlaylistCoverGridProps {
  tracks: Track[];
  theme: ThemeId;
  title: string;
  size?: 'md' | 'lg';
}

/**
 * Renders an auto-generated 4-grid (2x2) mosaic from tracks inside a playlist.
 */
export function PlaylistCoverGrid({
  tracks,
  theme,
  title,
  size = 'lg',
}: PlaylistCoverGridProps) {
  if (tracks.length < 2) {
    return (
      <ThemeArtwork
        theme={theme}
        seed={tracks[0]?.coverSeed ?? 404}
        customCoverUrl={tracks[0]?.customCoverUrl}
        title={title}
        size={size}
        variant="playlist"
      />
    );
  }

  const slots = [0, 1, 2, 3].map((idx) => tracks[idx % tracks.length]);
  const sizeCls = size === 'lg' ? 'w-32 h-32 sm:w-40 sm:h-40' : 'w-14 h-14';

  return (
    <div
      className={`grid grid-cols-2 grid-rows-2 overflow-hidden shrink-0 ${sizeCls}`}
      style={{
        border: 'var(--border-width) var(--border-style) var(--border-color)',
        borderRadius: size === 'lg' ? 'var(--radius-md)' : 'var(--radius-sm)',
        boxShadow: size === 'lg' ? 'var(--shadow-card)' : undefined,
      }}
      aria-label={`${title} 4-grid cover`}
    >
      {slots.map((t, i) => {
        if (t.customCoverUrl) {
          return (
            <div key={`${t.id}-${i}`} className="w-full h-full overflow-hidden">
              <img
                src={t.customCoverUrl}
                alt={t.title}
                draggable={false}
                className="w-full h-full object-cover"
              />
            </div>
          );
        }
        const palettes = THEME_COVER_PALETTES[theme];
        const [bg, primary, highlight] = palettes[t.coverSeed % palettes.length];
        return (
          <div
            key={`${t.id}-${i}`}
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: bg }}
          >
            <svg viewBox="0 0 40 40" className="w-full h-full" aria-hidden="true">
              <rect width="40" height="40" fill={bg} />
              <circle cx="20" cy="20" r="10" fill={primary} fillOpacity="0.85" />
              <circle cx="20" cy="20" r="4" fill={highlight} />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
