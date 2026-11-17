import { Heart } from 'lucide-react';
import type { ThemeId } from '../types/music';

interface ThemeHeartIconProps {
  theme: ThemeId;
  filled?: boolean;
  className?: string;
}

/**
 * Renders a chunky pixelated heart in 8-Bit Pixel Retro mode,
 * or an adaptive crisp SVG heart in all other themes.
 */
export function ThemeHeartIcon({
  theme,
  filled = false,
  className = 'w-4 h-4',
}: ThemeHeartIconProps) {
  if (theme === 'pixel-retro') {
    return (
      <svg
        viewBox="0 0 16 16"
        className={className}
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {filled ? (
          <>
            <rect x="2" y="3" width="4" height="2" fill="currentColor" />
            <rect x="10" y="3" width="4" height="2" fill="currentColor" />
            <rect x="1" y="5" width="14" height="3" fill="currentColor" />
            <rect x="2" y="8" width="12" height="2" fill="currentColor" />
            <rect x="4" y="10" width="8" height="2" fill="currentColor" />
            <rect x="6" y="12" width="4" height="2" fill="currentColor" />
            <rect x="7" y="14" width="2" height="1" fill="currentColor" />
          </>
        ) : (
          <>
            <rect x="2" y="3" width="4" height="1" fill="currentColor" />
            <rect x="10" y="3" width="4" height="1" fill="currentColor" />
            <rect x="1" y="4" width="1" height="4" fill="currentColor" />
            <rect x="6" y="4" width="1" height="2" fill="currentColor" />
            <rect x="9" y="4" width="1" height="2" fill="currentColor" />
            <rect x="7" y="5" width="2" height="1" fill="currentColor" />
            <rect x="14" y="4" width="1" height="4" fill="currentColor" />
            <rect x="2" y="8" width="1" height="2" fill="currentColor" />
            <rect x="13" y="8" width="1" height="2" fill="currentColor" />
            <rect x="3" y="10" width="2" height="1" fill="currentColor" />
            <rect x="11" y="10" width="2" height="1" fill="currentColor" />
            <rect x="5" y="11" width="2" height="2" fill="currentColor" />
            <rect x="9" y="11" width="2" height="2" fill="currentColor" />
            <rect x="7" y="13" width="2" height="2" fill="currentColor" />
          </>
        )}
      </svg>
    );
  }

  return (
    <Heart
      className={`${className} ${filled ? 'fill-current' : ''}`}
      aria-hidden="true"
    />
  );
}
