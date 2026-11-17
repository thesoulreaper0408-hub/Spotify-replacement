import type { SceneryPropConfig } from '../utils/scenery';

interface SceneryPropSvgProps {
  prop: SceneryPropConfig;
}

/**
 * Renders distinct, theme-authentic SVG/CSS illustrations for each Lively World prop.
 */
export function SceneryPropSvg({ prop }: SceneryPropSvgProps) {
  switch (prop.kind) {
    /* === 1. Classic Dark === */
    case 'vinyl-record':
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16">
          <circle cx="40" cy="40" r="34" fill="#111111" stroke="#1db954" strokeWidth="2" />
          <circle cx="40" cy="40" r="25" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <circle cx="40" cy="40" r="18" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <circle cx="40" cy="40" r="11" fill="#1db954" />
          <circle cx="40" cy="40" r="3" fill="#090909" />
        </svg>
      );
    case 'soundwave-ring':
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#eab308" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="40" cy="40" r="20" fill="none" stroke="#1db954" strokeOpacity="0.7" strokeWidth="2" />
          <circle cx="40" cy="40" r="9" fill="none" stroke="#eab308" strokeOpacity="0.85" strokeWidth="2" />
        </svg>
      );
    case 'treble-clef':
      return (
        <svg viewBox="0 0 60 80" className="w-12 h-16">
          <path
            d="M34 62 C26 66 20 58 24 50 C28 42 40 40 38 26 C37 16 30 12 28 20 C26 28 32 42 32 64 C32 71 25 74 21 70"
            fill="none"
            stroke="#1db954"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="33" cy="46" r="6" fill="none" stroke="#eab308" strokeWidth="2.5" />
        </svg>
      );
    case 'eighth-note':
      return (
        <svg viewBox="0 0 60 60" className="w-12 h-12">
          <ellipse cx="22" cy="44" rx="9" ry="6.5" transform="rotate(-18 22 44)" fill="#1db954" />
          <path d="M29 42 V14 L46 20 V29 L29 23" fill="none" stroke="#eab308" strokeWidth="3.5" strokeLinejoin="round" />
        </svg>
      );
    case 'studio-headphones':
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16">
          <path d="M18 46 V38 C18 23 28 14 40 14 C52 14 62 23 62 38 V46" fill="none" stroke="#1db954" strokeWidth="4" strokeLinecap="round" />
          <rect x="13" y="42" width="11" height="22" rx="5" fill="#262626" stroke="#1db954" strokeWidth="2" />
          <rect x="56" y="42" width="11" height="22" rx="5" fill="#262626" stroke="#1db954" strokeWidth="2" />
        </svg>
      );
    case 'spotlight-beam':
      return (
        <div
          className="w-40 h-72 opacity-25"
          style={{
            background: 'linear-gradient(180deg, rgba(29, 185, 84, 0.45) 0%, rgba(234, 179, 8, 0.12) 45%, transparent 100%)',
            clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
          }}
        />
      );
    case 'bokeh-orb':
      return (
        <div
          className="w-24 h-24 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(29, 185, 84, 0.55), rgba(234, 179, 8, 0.18) 55%, transparent 72%)',
          }}
        />
      );

    /* === 2. 8-Bit Pixel Retro === */
    case 'space-invader':
      return (
        <svg viewBox="0 0 11 8" className="w-14 h-10" shapeRendering="crispEdges">
          <rect x="2" y="0" width="1" height="1" fill="#00e5ff" />
          <rect x="8" y="0" width="1" height="1" fill="#00e5ff" />
          <rect x="3" y="1" width="1" height="1" fill="#00e5ff" />
          <rect x="7" y="1" width="1" height="1" fill="#00e5ff" />
          <rect x="2" y="2" width="7" height="1" fill="#00e5ff" />
          <rect x="1" y="3" width="2" height="1" fill="#00e5ff" />
          <rect x="4" y="3" width="3" height="1" fill="#00e5ff" />
          <rect x="8" y="3" width="2" height="1" fill="#00e5ff" />
          <rect x="0" y="4" width="11" height="1" fill="#00e5ff" />
          <rect x="0" y="5" width="1" height="2" fill="#00e5ff" />
          <rect x="2" y="5" width="7" height="1" fill="#00e5ff" />
          <rect x="10" y="5" width="1" height="2" fill="#00e5ff" />
          <rect x="2" y="6" width="1" height="1" fill="#00e5ff" />
          <rect x="8" y="6" width="1" height="1" fill="#00e5ff" />
          <rect x="3" y="7" width="2" height="1" fill="#ffd500" />
          <rect x="6" y="7" width="2" height="1" fill="#ffd500" />
        </svg>
      );
    case 'pixel-coin':
      return (
        <svg viewBox="0 0 12 12" className="w-11 h-11" shapeRendering="crispEdges">
          <rect x="3" y="1" width="6" height="10" fill="#ffd500" />
          <rect x="2" y="2" width="8" height="8" fill="#ffd500" />
          <rect x="5" y="3" width="2" height="6" fill="#ff8c00" />
          <rect x="3" y="2" width="1" height="2" fill="#fff7ae" />
        </svg>
      );
    case 'mystery-block':
      return (
        <svg viewBox="0 0 14 14" className="w-12 h-12" shapeRendering="crispEdges">
          <rect width="14" height="14" fill="#f59e0b" stroke="#000000" strokeWidth="1" />
          <rect x="2" y="2" width="1" height="1" fill="#78350f" />
          <rect x="11" y="2" width="1" height="1" fill="#78350f" />
          <rect x="2" y="11" width="1" height="1" fill="#78350f" />
          <rect x="11" y="11" width="1" height="1" fill="#78350f" />
          <rect x="5" y="3" width="4" height="2" fill="#ffffff" />
          <rect x="7" y="5" width="2" height="2" fill="#ffffff" />
          <rect x="6" y="7" width="2" height="2" fill="#ffffff" />
          <rect x="6" y="10" width="2" height="2" fill="#ffffff" />
        </svg>
      );
    case 'pixel-ghost':
      return (
        <svg viewBox="0 0 14 14" className="w-12 h-12" shapeRendering="crispEdges">
          <rect x="4" y="1" width="6" height="2" fill="#ff4ecd" />
          <rect x="2" y="3" width="10" height="8" fill="#ff4ecd" />
          <rect x="2" y="11" width="2" height="2" fill="#ff4ecd" />
          <rect x="6" y="11" width="2" height="2" fill="#ff4ecd" />
          <rect x="10" y="11" width="2" height="2" fill="#ff4ecd" />
          <rect x="4" y="5" width="2" height="3" fill="#ffffff" />
          <rect x="8" y="5" width="2" height="3" fill="#ffffff" />
          <rect x="5" y="6" width="1" height="2" fill="#141028" />
          <rect x="9" y="6" width="1" height="2" fill="#141028" />
        </svg>
      );
    case 'pixel-heart':
      return (
        <svg viewBox="0 0 14 12" className="w-11 h-10" shapeRendering="crispEdges">
          <rect x="2" y="1" width="3" height="2" fill="#ff3b6b" />
          <rect x="9" y="1" width="3" height="2" fill="#ff3b6b" />
          <rect x="1" y="3" width="12" height="3" fill="#ff3b6b" />
          <rect x="3" y="6" width="8" height="2" fill="#ff3b6b" />
          <rect x="5" y="8" width="4" height="2" fill="#ff3b6b" />
          <rect x="6" y="10" width="2" height="1" fill="#ff3b6b" />
        </svg>
      );
    case 'pixel-cloud':
      return (
        <svg viewBox="0 0 20 10" className="w-20 h-10" shapeRendering="crispEdges">
          <rect x="5" y="1" width="8" height="3" fill="#94a3b8" />
          <rect x="2" y="4" width="16" height="4" fill="#cbd5e1" />
          <rect x="1" y="6" width="18" height="3" fill="#e2e8f0" />
        </svg>
      );
    case 'pixel-rocket':
      return (
        <svg viewBox="0 0 16 16" className="w-12 h-12" shapeRendering="crispEdges">
          <rect x="7" y="1" width="2" height="2" fill="#ffffff" />
          <rect x="6" y="3" width="4" height="6" fill="#00e5ff" />
          <rect x="4" y="7" width="2" height="3" fill="#ff4ecd" />
          <rect x="10" y="7" width="2" height="3" fill="#ff4ecd" />
          <rect x="7" y="5" width="2" height="2" fill="#ffd500" />
          <rect x="7" y="10" width="2" height="3" fill="#ffd500" />
          <rect x="6" y="12" width="4" height="2" fill="#ff6b00" />
        </svg>
      );
    case 'pixel-mushroom':
      return (
        <svg viewBox="0 0 14 14" className="w-11 h-11" shapeRendering="crispEdges">
          <rect x="3" y="1" width="8" height="2" fill="#ff3b6b" />
          <rect x="1" y="3" width="12" height="5" fill="#ff3b6b" />
          <rect x="3" y="3" width="2" height="2" fill="#ffffff" />
          <rect x="9" y="4" width="2" height="2" fill="#ffffff" />
          <rect x="4" y="8" width="6" height="5" fill="#fde68a" />
          <rect x="5" y="9" width="1" height="2" fill="#000000" />
          <rect x="8" y="9" width="1" height="2" fill="#000000" />
        </svg>
      );
    case 'pixel-potion':
      return (
        <svg viewBox="0 0 12 14" className="w-10 h-12" shapeRendering="crispEdges">
          <rect x="4" y="1" width="4" height="2" fill="#cbd5e1" />
          <rect x="5" y="3" width="2" height="2" fill="#94a3b8" />
          <rect x="3" y="5" width="6" height="7" fill="#7dff6b" />
          <rect x="2" y="7" width="8" height="4" fill="#22c55e" />
          <rect x="3" y="7" width="2" height="2" fill="#ffffff" />
        </svg>
      );

    /* === 3. 2D Cartoon / Comic === */
    case 'comic-bubble':
      return (
        <div
          className="px-3 py-1.5 text-xs font-extrabold tracking-wider select-none"
          style={{
            backgroundColor: prop.label === 'VIBE!' ? '#22d3ee' : prop.label === 'BASS!' ? '#f43f5e' : '#ffd43b',
            color: prop.label === 'BASS!' ? '#ffffff' : '#000000',
            border: '3px solid #000000',
            borderRadius: '14px',
            boxShadow: '3px 3px 0px #000000',
            transform: 'rotate(-6deg)',
          }}
        >
          {prop.label ?? 'BOOM!'}
        </div>
      );
    case 'comic-lightning':
      return (
        <svg viewBox="0 0 60 80" className="w-12 h-16">
          <polygon points="34,4 12,42 28,42 20,76 48,34 32,34" fill="#ffd43b" stroke="#000000" strokeWidth="3.5" strokeLinejoin="round" />
        </svg>
      );
    case 'comic-star':
      return (
        <svg viewBox="0 0 60 60" className="w-12 h-12">
          <polygon points="30,4 37,23 56,30 37,37 30,56 23,37 4,30 23,23" fill="#22d3ee" stroke="#000000" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      );
    case 'comic-boombox':
      return (
        <svg viewBox="0 0 80 56" className="w-16 h-12">
          <path d="M24 14 V6 H56 V14" fill="none" stroke="#000000" strokeWidth="3.5" />
          <rect x="6" y="14" width="68" height="36" rx="6" fill="#f43f5e" stroke="#000000" strokeWidth="3.5" />
          <circle cx="22" cy="32" r="10" fill="#ffd43b" stroke="#000000" strokeWidth="3" />
          <circle cx="58" cy="32" r="10" fill="#ffd43b" stroke="#000000" strokeWidth="3" />
          <rect x="34" y="24" width="12" height="10" fill="#ffffff" stroke="#000000" strokeWidth="2.5" />
        </svg>
      );
    case 'halftone-swirl':
      return (
        <svg viewBox="0 0 80 80" className="w-16 h-16">
          <path d="M40 40 m0 -6 a6 6 0 1 1 -6 6 a12 12 0 1 1 12 12 a18 18 0 1 1 -18 -18 a26 26 0 1 1 26 26" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
        </svg>
      );
    case 'comic-skateboard':
      return (
        <svg viewBox="0 0 80 40" className="w-16 h-8">
          <rect x="6" y="10" width="68" height="12" rx="6" fill="#22d3ee" stroke="#000000" strokeWidth="3" />
          <circle cx="22" cy="28" r="6" fill="#ffd43b" stroke="#000000" strokeWidth="3" />
          <circle cx="58" cy="28" r="6" fill="#ffd43b" stroke="#000000" strokeWidth="3" />
        </svg>
      );
    case 'ink-splatter':
      return (
        <svg viewBox="0 0 70 70" className="w-14 h-14">
          <path d="M34 14 C44 10 54 18 52 28 C60 32 58 46 48 48 C44 58 30 58 26 48 C14 48 12 34 20 26 C18 16 26 10 34 14 Z" fill="#000000" fillOpacity="0.82" />
          <circle cx="12" cy="18" r="3.5" fill="#000000" />
          <circle cx="58" cy="14" r="3" fill="#000000" />
        </svg>
      );

    /* === 4. Cyberpunk Neon === */
    case 'cyber-skyline':
      return (
        <svg viewBox="0 0 140 120" className="w-32 h-28">
          <rect x="8" y="34" width="24" height="86" fill="#0b0719" stroke="#00f0ff" strokeWidth="1.5" />
          <rect x="38" y="14" width="30" height="106" fill="#110b24" stroke="#ff2a85" strokeWidth="1.5" />
          <rect x="74" y="42" width="24" height="78" fill="#0b0719" stroke="#00f0ff" strokeWidth="1.5" />
          <rect x="104" y="24" width="28" height="96" fill="#110b24" stroke="#ff2a85" strokeWidth="1.5" />
          <rect x="14" y="44" width="5" height="6" fill="#00f0ff" />
          <rect x="46" y="28" width="6" height="6" fill="#ff2a85" />
          <rect x="56" y="42" width="6" height="6" fill="#00f0ff" />
          <rect x="112" y="36" width="6" height="6" fill="#00f0ff" />
        </svg>
      );
    case 'hover-car':
      return (
        <svg viewBox="0 0 90 40" className="w-20 h-10">
          <line x1="0" y1="26" x2="26" y2="26" stroke="#ff2a85" strokeWidth="2.5" strokeDasharray="6 3" />
          <path d="M24 24 L36 14 H62 L76 22 L72 28 H24 Z" fill="#191136" stroke="#00f0ff" strokeWidth="2" />
          <circle cx="34" cy="29" r="3.5" fill="#ff2a85" />
          <circle cx="64" cy="29" r="3.5" fill="#00f0ff" />
        </svg>
      );
    case 'katakana-sign':
      return (
        <div
          className="px-2.5 py-1.5 text-xs font-bold tracking-widest select-none"
          style={{
            backgroundColor: 'rgba(17, 11, 36, 0.88)',
            color: '#00f0ff',
            border: '1.5px solid #ff2a85',
            boxShadow: '0 0 12px rgba(255, 42, 133, 0.5)',
            writingMode: prop.label === 'ネオン' ? 'vertical-rl' : 'horizontal-tb',
          }}
        >
          {prop.label ?? 'サウンド'}
        </div>
      );
    case 'holo-triangle':
      return (
        <svg viewBox="0 0 60 60" className="w-12 h-12">
          <polygon points="30,8 54,50 6,50" fill="none" stroke="#ff2a85" strokeWidth="2.5" />
          <line x1="30" y1="22" x2="30" y2="36" stroke="#00f0ff" strokeWidth="2.5" />
          <circle cx="30" cy="43" r="2.2" fill="#00f0ff" />
        </svg>
      );
    case 'cyber-visor':
      return (
        <svg viewBox="0 0 80 44" className="w-16 h-10">
          <path d="M10 14 H70 L64 32 L46 28 L40 22 L34 28 L16 32 Z" fill="rgba(0, 240, 255, 0.25)" stroke="#00f0ff" strokeWidth="2" />
          <line x1="18" y1="20" x2="62" y2="20" stroke="#ff2a85" strokeWidth="1.5" />
        </svg>
      );
    case 'circuit-trace':
      return (
        <svg viewBox="0 0 100 60" className="w-24 h-14">
          <path d="M8 14 H36 L48 26 H76 M16 44 H42 L56 30 H90" fill="none" stroke="#00f0ff" strokeWidth="1.8" />
          <circle cx="8" cy="14" r="3" fill="#ff2a85" />
          <circle cx="76" cy="26" r="3" fill="#00f0ff" />
          <circle cx="90" cy="30" r="3" fill="#ff2a85" />
        </svg>
      );
    case 'neon-rain':
      return (
        <svg viewBox="0 0 60 80" className="w-12 h-16">
          <line x1="12" y1="8" x2="22" y2="38" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
          <line x1="34" y1="16" x2="44" y2="52" stroke="#ff2a85" strokeWidth="2" strokeLinecap="round" />
          <line x1="20" y1="46" x2="30" y2="74" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'cyber-skull':
      return (
        <svg viewBox="0 0 60 64" className="w-12 h-12">
          <path d="M16 28 C16 14 44 14 44 28 V42 H38 V52 H22 V42 H16 Z" fill="#191136" stroke="#ff2a85" strokeWidth="2" />
          <rect x="20" y="25" width="20" height="7" fill="#00f0ff" />
          <line x1="26" y1="42" x2="26" y2="50" stroke="#00f0ff" strokeWidth="1.5" />
          <line x1="34" y1="42" x2="34" y2="50" stroke="#00f0ff" strokeWidth="1.5" />
        </svg>
      );

    /* === 5. Cozy Paper / Sketch === */
    case 'paper-airplane':
      return (
        <svg viewBox="0 0 70 50" className="w-14 h-11">
          <polygon points="6,24 64,8 40,42 32,29" fill="#fffdf8" stroke="#2b2623" strokeWidth="2" strokeLinejoin="round" />
          <line x1="32" y1="29" x2="64" y2="8" stroke="#b45309" strokeWidth="1.8" />
        </svg>
      );
    case 'coffee-mug':
      return (
        <svg viewBox="0 0 64 64" className="w-14 h-14">
          <path d="M22 10 Q26 16 22 22 M34 8 Q38 14 34 20" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
          <rect x="14" y="26" width="28" height="26" rx="4" fill="#fffdf8" stroke="#2b2623" strokeWidth="2" />
          <path d="M42 32 H48 C52 32 52 44 48 44 H42" fill="none" stroke="#2b2623" strokeWidth="2" />
        </svg>
      );
    case 'coffee-stain':
      return (
        <svg viewBox="0 0 80 80" className="w-20 h-20">
          <circle cx="40" cy="40" r="26" fill="none" stroke="#b45309" strokeOpacity="0.45" strokeWidth="4" strokeDasharray="18 3 28 2" />
          <circle cx="42" cy="41" r="24" fill="none" stroke="#92400e" strokeOpacity="0.25" strokeWidth="2" />
        </svg>
      );
    case 'sketch-cassette':
      return (
        <svg viewBox="0 0 80 54" className="w-16 h-11">
          <rect x="6" y="8" width="68" height="38" rx="4" fill="#fffdf8" stroke="#2b2623" strokeWidth="2" />
          <rect x="16" y="16" width="48" height="16" rx="2" fill="#efe5d4" stroke="#7c6f64" strokeWidth="1.5" />
          <circle cx="28" cy="24" r="5" fill="none" stroke="#2b2623" strokeWidth="1.8" />
          <circle cx="52" cy="24" r="5" fill="none" stroke="#2b2623" strokeWidth="1.8" />
        </svg>
      );
    case 'doodle-star':
      return (
        <svg viewBox="0 0 50 50" className="w-11 h-11">
          <path d="M25 6 L29 19 L43 20 L32 29 L36 42 L25 34 L14 42 L18 29 L7 20 L21 19 Z" fill="none" stroke="#b45309" strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
      );
    case 'taped-polaroid':
      return (
        <svg viewBox="0 0 64 74" className="w-14 h-16">
          <rect x="20" y="2" width="24" height="10" fill="rgba(234, 179, 8, 0.45)" stroke="#7c6f64" strokeWidth="1" strokeDasharray="2 2" />
          <rect x="8" y="8" width="48" height="58" rx="2" fill="#fffdf8" stroke="#2b2623" strokeWidth="2" />
          <rect x="14" y="14" width="36" height="34" fill="#efe5d4" stroke="#7c6f64" strokeWidth="1.5" />
        </svg>
      );
    case 'fountain-pen':
      return (
        <svg viewBox="0 0 70 70" className="w-14 h-14">
          <path d="M16 54 L26 30 L48 12 L58 22 L40 44 Z" fill="#efe5d4" stroke="#2b2623" strokeWidth="2" strokeLinejoin="round" />
          <line x1="16" y1="54" x2="29" y2="41" stroke="#b45309" strokeWidth="2" />
        </svg>
      );
    case 'crumpled-paper':
      return (
        <svg viewBox="0 0 60 60" className="w-12 h-12">
          <polygon points="18,12 40,10 50,26 42,46 20,48 10,30" fill="#fffdf8" stroke="#2b2623" strokeWidth="2" />
          <polyline points="18,12 30,28 42,46" fill="none" stroke="#7c6f64" strokeWidth="1.5" />
          <polyline points="10,30 30,28 50,26" fill="none" stroke="#7c6f64" strokeWidth="1.5" />
        </svg>
      );
    case 'doodle-heart':
      return (
        <svg viewBox="0 0 50 50" className="w-10 h-10">
          <path d="M25 40 C12 30 8 22 12 15 C16 10 23 12 25 18 C27 12 34 10 38 15 C42 22 38 30 25 40 Z" fill="none" stroke="#2f5d50" strokeWidth="2.2" />
        </svg>
      );
    case 'tape-strip':
      return (
        <div
          className="w-16 h-5"
          style={{
            backgroundColor: 'rgba(234, 179, 8, 0.38)',
            border: '1px dashed rgba(124, 111, 100, 0.65)',
            transform: 'rotate(-9deg)',
          }}
        />
      );

    /* === 6. Frutiger Aero / XP === */
    case 'aero-cloud':
      return (
        <svg viewBox="0 0 220 90" className="w-48 h-20">
          <g fill="#ffffff" fillOpacity="0.88">
            <ellipse cx="64" cy="54" rx="46" ry="20" />
            <ellipse cx="105" cy="42" rx="40" ry="24" />
            <ellipse cx="150" cy="54" rx="44" ry="18" />
          </g>
        </svg>
      );
    case 'soap-bubble':
      return (
        <div
          className="w-16 h-16 rounded-full"
          style={{
            border: '1.5px solid rgba(255, 255, 255, 0.9)',
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(125, 211, 252, 0.3) 55%, rgba(73, 196, 47, 0.22))',
            boxShadow: 'inset -4px -4px 10px rgba(12, 116, 228, 0.25), 0 4px 14px rgba(12, 116, 228, 0.16)',
          }}
        />
      );
    case 'clownfish':
      return (
        <svg viewBox="0 0 80 50" className="w-16 h-10">
          <ellipse cx="44" cy="25" rx="22" ry="14" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
          <polygon points="22,25 8,14 8,36" fill="#f97316" stroke="#ffffff" strokeWidth="1.8" />
          <rect x="34" y="12" width="6" height="26" rx="2" fill="#ffffff" />
          <rect x="48" y="14" width="5" height="22" rx="2" fill="#ffffff" />
          <circle cx="58" cy="22" r="2.2" fill="#0b2742" />
        </svg>
      );
    case 'angelfish':
      return (
        <svg viewBox="0 0 70 70" className="w-14 h-14">
          <polygon points="36,8 62,35 36,62 18,35" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
          <polygon points="18,35 6,24 6,46" fill="#49c42f" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="36" y1="14" x2="36" y2="56" stroke="#fef08a" strokeWidth="4" />
          <circle cx="50" cy="32" r="2.2" fill="#0b2742" />
        </svg>
      );
    case 'glass-orb':
      return (
        <div
          className="w-14 h-14 rounded-full"
          style={{
            background: 'radial-gradient(circle at 32% 28%, #ffffff 0%, #60a5fa 45%, #0c74e4 100%)',
            border: '1.5px solid rgba(255,255,255,0.9)',
            boxShadow: '0 6px 16px rgba(12, 116, 228, 0.28)',
          }}
        />
      );
    case 'sun-flare':
      return (
        <div
          className="w-28 h-28 rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(254,240,138,0.55) 35%, transparent 72%)',
          }}
        />
      );
    case 'aero-leaf':
      return (
        <svg viewBox="0 0 60 60" className="w-12 h-12">
          <path d="M12 46 C12 22 30 10 50 12 C48 34 36 48 12 46 Z" fill="#49c42f" stroke="#ffffff" strokeWidth="2" />
          <path d="M12 46 Q28 30 46 16" fill="none" stroke="#dcfce7" strokeWidth="2" />
        </svg>
      );
    case 'water-droplet':
      return (
        <svg viewBox="0 0 50 64" className="w-10 h-12">
          <path d="M25 6 C25 6 42 28 42 40 C42 50 34 58 25 58 C16 58 8 50 8 40 C8 28 25 6 25 6 Z" fill="rgba(56, 189, 248, 0.5)" stroke="#ffffff" strokeWidth="2" />
          <ellipse cx="19" cy="36" rx="3" ry="6" fill="#ffffff" fillOpacity="0.85" />
        </svg>
      );
    case 'water-ripple':
      return (
        <svg viewBox="0 0 90 50" className="w-20 h-12">
          <ellipse cx="45" cy="25" rx="38" ry="16" fill="none" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="2" />
          <ellipse cx="45" cy="25" rx="22" ry="9" fill="none" stroke="#0c74e4" strokeOpacity="0.45" strokeWidth="1.5" />
        </svg>
      );

    /* === 7. Vaporwave / 90s Synth === */
    case 'vapor-sun':
      return (
        <svg viewBox="0 0 120 120" className="w-28 h-28">
          <defs>
            <linearGradient id={`vsun-${prop.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffb96" />
              <stop offset="55%" stopColor="#ff71ce" />
              <stop offset="100%" stopColor="#b967ff" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="52" fill={`url(#vsun-${prop.id})`} />
          <rect x="4" y="62" width="112" height="5" fill="#1c0f36" />
          <rect x="4" y="74" width="112" height="6" fill="#1c0f36" />
          <rect x="4" y="88" width="112" height="8" fill="#1c0f36" />
        </svg>
      );
    case 'palm-tree':
      return (
        <svg viewBox="0 0 140 150" className="w-28 h-32">
          <path d="M72 146 Q66 102 74 56" stroke="#01cdfe" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M74 56 Q44 38 22 58 Q48 58 74 56 Z" fill="#ff71ce" />
          <path d="M74 56 Q50 26 32 22 Q58 38 74 56 Z" fill="#01cdfe" />
          <path d="M74 56 Q98 24 124 30 Q98 42 74 56 Z" fill="#ff71ce" />
          <path d="M74 56 Q106 46 128 66 Q100 60 74 56 Z" fill="#01cdfe" />
        </svg>
      );
    case 'marble-bust':
      return (
        <svg viewBox="0 0 100 120" className="w-24 h-28">
          <path
            d="M50 18 C38 18 30 28 30 42 C30 52 35 60 39 64 L38 76 L18 90 L14 114 L86 114 L82 90 L62 76 L61 64 C65 60 70 52 70 42 C70 28 62 18 50 18 Z"
            fill="#f9a8d4"
            fillOpacity="0.65"
            stroke="#01cdfe"
            strokeWidth="2"
          />
        </svg>
      );
    case 'vapor-dolphin':
      return (
        <svg viewBox="0 0 90 56" className="w-18 h-12">
          <path d="M12 36 Q34 8 68 24 L78 28 L66 32 Q42 26 24 42 L14 48 L18 38 Z" fill="#01cdfe" stroke="#ff71ce" strokeWidth="2" />
        </svg>
      );
    case 'win95-popup':
      return (
        <div
          className="w-32 text-[10px] font-mono select-none"
          style={{
            backgroundColor: '#2d1854',
            border: '2px solid #01cdfe',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.6)',
          }}
        >
          <div
            className="flex items-center justify-between px-1.5 py-0.5 font-bold"
            style={{ background: 'linear-gradient(90deg, #000080, #ff71ce)', color: '#ffffff' }}
          >
            <span className="truncate">{prop.label ?? 'WIN95.EXE'}</span>
            <span>×</span>
          </div>
          <div className="px-2 py-2 text-[#fff0fb] flex items-center justify-between">
            <span>OK_404</span>
            <span className="px-1.5 border border-[#01cdfe]">OK</span>
          </div>
        </div>
      );
    case 'marble-pillar':
      return (
        <svg viewBox="0 0 50 100" className="w-12 h-24">
          <rect x="6" y="8" width="38" height="10" fill="#e9d5ff" stroke="#01cdfe" strokeWidth="1.5" />
          <rect x="12" y="18" width="26" height="66" fill="#c084fc" fillOpacity="0.55" stroke="#01cdfe" strokeWidth="1.5" />
          <line x1="20" y1="20" x2="20" y2="82" stroke="#fff0fb" strokeWidth="1" />
          <line x1="30" y1="20" x2="30" y2="82" stroke="#fff0fb" strokeWidth="1" />
          <rect x="6" y="84" width="38" height="10" fill="#e9d5ff" stroke="#01cdfe" strokeWidth="1.5" />
        </svg>
      );
    case 'vhs-tape':
      return (
        <svg viewBox="0 0 80 50" className="w-16 h-10">
          <rect x="6" y="8" width="68" height="34" fill="#170c2b" stroke="#ff71ce" strokeWidth="2" />
          <rect x="14" y="14" width="52" height="14" fill="#3a1f6b" stroke="#01cdfe" strokeWidth="1.5" />
          <circle cx="24" cy="21" r="4" fill="#fffb96" />
          <circle cx="56" cy="21" r="4" fill="#fffb96" />
        </svg>
      );
    case 'pink-flamingo':
      return (
        <svg viewBox="0 0 60 80" className="w-12 h-16">
          <path d="M30 48 V74 M24 62 H34" stroke="#01cdfe" strokeWidth="2.5" />
          <ellipse cx="32" cy="42" rx="14" ry="9" fill="#ff71ce" />
          <path d="M22 38 Q16 20 26 12 Q32 10 34 16" fill="none" stroke="#ff71ce" strokeWidth="4" strokeLinecap="round" />
          <polygon points="34,14 40,18 33,19" fill="#fffb96" />
        </svg>
      );
    case 'checker-tile':
      return (
        <svg viewBox="0 0 48 48" className="w-12 h-12">
          <rect x="0" y="0" width="24" height="24" fill="#ff71ce" fillOpacity="0.6" />
          <rect x="24" y="0" width="24" height="24" fill="#01cdfe" fillOpacity="0.6" />
          <rect x="0" y="24" width="24" height="24" fill="#01cdfe" fillOpacity="0.6" />
          <rect x="24" y="24" width="24" height="24" fill="#ff71ce" fillOpacity="0.6" />
        </svg>
      );

    /* === 8. Blueprint / Architect === */
    case 'wireframe-cube':
      return (
        <svg viewBox="0 0 70 70" className="w-14 h-14">
          <rect x="12" y="22" width="32" height="32" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          <rect x="24" y="10" width="32" height="32" fill="none" stroke="#7dd3fc" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="12" y1="22" x2="24" y2="10" stroke="#7dd3fc" strokeWidth="1.5" />
          <line x1="44" y1="22" x2="56" y2="10" stroke="#7dd3fc" strokeWidth="1.5" />
          <line x1="12" y1="54" x2="24" y2="42" stroke="#7dd3fc" strokeWidth="1.5" />
          <line x1="44" y1="54" x2="56" y2="42" stroke="#7dd3fc" strokeWidth="1.5" />
        </svg>
      );
    case 'wireframe-pyramid':
      return (
        <svg viewBox="0 0 70 70" className="w-14 h-14">
          <polygon points="35,10 12,52 54,56" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          <line x1="35" y1="10" x2="46" y2="38" stroke="#7dd3fc" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="12" y1="52" x2="46" y2="38" stroke="#7dd3fc" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="54" y1="56" x2="46" y2="38" stroke="#7dd3fc" strokeWidth="1.2" strokeDasharray="3 3" />
        </svg>
      );
    case 'wireframe-sphere':
      return (
        <svg viewBox="0 0 70 70" className="w-14 h-14">
          <circle cx="35" cy="35" r="24" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          <ellipse cx="35" cy="35" rx="24" ry="9" fill="none" stroke="#7dd3fc" strokeWidth="1.2" />
          <ellipse cx="35" cy="35" rx="9" ry="24" fill="none" stroke="#7dd3fc" strokeWidth="1.2" />
        </svg>
      );
    case 'cad-compass':
      return (
        <svg viewBox="0 0 60 70" className="w-12 h-14">
          <circle cx="30" cy="14" r="5" fill="none" stroke="#ffffff" strokeWidth="1.8" />
          <line x1="28" y1="18" x2="14" y2="60" stroke="#ffffff" strokeWidth="1.8" />
          <line x1="32" y1="18" x2="46" y2="60" stroke="#ffffff" strokeWidth="1.8" />
          <path d="M18 44 Q30 50 42 44" fill="none" stroke="#7dd3fc" strokeWidth="1.4" strokeDasharray="3 2" />
        </svg>
      );
    case 'cad-protractor':
      return (
        <svg viewBox="0 0 80 50" className="w-16 h-10">
          <path d="M10 42 A30 30 0 0 1 70 42 Z" fill="none" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M22 42 A18 18 0 0 1 58 42" fill="none" stroke="#7dd3fc" strokeWidth="1.2" strokeDasharray="3 2" />
          <line x1="40" y1="42" x2="40" y2="12" stroke="#7dd3fc" strokeWidth="1" />
        </svg>
      );
    case 'cad-callout':
      return (
        <div
          className="px-2 py-1 text-[10px] font-mono select-none"
          style={{
            color: '#bae6fd',
            border: '1px solid rgba(255,255,255,0.65)',
            backgroundColor: 'rgba(10, 37, 64, 0.78)',
          }}
        >
          {prop.label ?? '45° // R=24mm'}
        </div>
      );
    case 'cad-crosshair':
      return (
        <svg viewBox="0 0 60 60" className="w-12 h-12">
          <circle cx="30" cy="30" r="18" fill="none" stroke="#7dd3fc" strokeWidth="1.2" strokeDasharray="4 3" />
          <line x1="6" y1="30" x2="54" y2="30" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="30" y1="6" x2="30" y2="54" stroke="#ffffff" strokeWidth="1.2" />
        </svg>
      );
    case 'cad-flow':
      return (
        <svg viewBox="0 0 100 40" className="w-24 h-10">
          <polyline points="6,30 36,30 48,12 90,12" fill="none" stroke="#7dd3fc" strokeWidth="1.5" strokeDasharray="5 3" />
          <circle cx="6" cy="30" r="3" fill="#ffffff" />
          <polygon points="94,12 86,8 86,16" fill="#ffffff" />
        </svg>
      );

    /* === 9. Claymorphism / Soft 3D === */
    case 'clay-sphere':
      return (
        <div
          className="w-20 h-20 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #ffd1e1, #ff7aa2)',
            boxShadow: '10px 12px 24px rgba(163, 177, 198, 0.48), inset 6px 6px 12px rgba(255,255,255,0.85), inset -6px -6px 14px rgba(108, 99, 255, 0.25)',
          }}
        />
      );
    case 'clay-torus':
      return (
        <div
          className="w-16 h-16 rounded-full"
          style={{
            border: '14px solid #a5b4fc',
            boxShadow: '8px 10px 20px rgba(163, 177, 198, 0.45), inset 4px 4px 8px rgba(255,255,255,0.85), inset -4px -4px 8px rgba(108, 99, 255, 0.35)',
          }}
        />
      );
    case 'clay-cloud':
      return (
        <div className="relative w-24 h-12">
          <div
            className="absolute inset-x-2 bottom-0 h-8 rounded-full"
            style={{
              background: '#ffffff',
              boxShadow: '6px 8px 16px rgba(163, 177, 198, 0.4), inset 4px 4px 8px rgba(255,255,255,0.95)',
            }}
          />
          <div className="absolute left-4 top-1 w-10 h-10 rounded-full bg-white shadow-inner" />
          <div className="absolute right-5 top-0 w-11 h-11 rounded-full bg-white shadow-inner" />
        </div>
      );
    case 'clay-star':
      return (
        <svg viewBox="0 0 60 60" className="w-12 h-12" style={{ filter: 'drop-shadow(4px 6px 8px rgba(163, 177, 198, 0.55))' }}>
          <path d="M30 6 L36 22 L53 23 L40 34 L44 51 L30 42 L16 51 L20 34 L7 23 L24 22 Z" fill="#fde68a" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case 'clay-cube':
      return (
        <div
          className="w-14 h-14 rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, #c4b5fd, #6c63ff)',
            boxShadow: '8px 10px 18px rgba(163, 177, 198, 0.5), inset 4px 4px 8px rgba(255,255,255,0.65)',
            transform: 'rotate(16deg)',
          }}
        />
      );
    case 'clay-blob-shape':
      return (
        <div
          className="w-20 h-16"
          style={{
            borderRadius: '58% 42% 64% 36% / 44% 56% 44% 56%',
            background: 'radial-gradient(circle at 30% 30%, #bbf7d0, #34d399)',
            boxShadow: '8px 10px 20px rgba(163, 177, 198, 0.45), inset 5px 5px 10px rgba(255,255,255,0.8)',
          }}
        />
      );

    /* === 10. Terminal / Hacker === */
    case 'terminal-radar':
      return (
        <svg viewBox="0 0 80 80" className="w-20 h-20">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#00ff41" strokeOpacity="0.65" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="22" fill="none" stroke="#00ff41" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="40" cy="40" r="10" fill="none" stroke="#00ff41" strokeOpacity="0.4" strokeWidth="1" />
          <line x1="40" y1="40" x2="66" y2="20" stroke="#00ff41" strokeWidth="2" />
          <circle cx="56" cy="28" r="2.5" fill="#00ff41" />
        </svg>
      );
    case 'ascii-skull':
      return (
        <pre className="font-mono text-[9px] leading-tight text-[#00ff41] select-none">
{` .---.
/ o o \\
|  ^  |
 '==='`}
        </pre>
      );
    case 'ascii-floppy':
      return (
        <pre className="font-mono text-[9px] leading-tight text-[#00ff41] select-none">
{`+------+
| [==] |
| +--+ |
+-+--+_+`}
        </pre>
      );
    case 'ascii-key':
      return (
        <pre className="font-mono text-[10px] leading-tight text-[#00ff41] select-none">
          {`[O]--^-^`}
        </pre>
      );
    case 'hex-snippet':
    case 'binary-burst':
      return (
        <div
          className="font-mono text-[11px] px-2 py-1 select-none"
          style={{
            color: '#00ff41',
            border: '1px solid rgba(0, 255, 65, 0.55)',
            backgroundColor: 'rgba(0, 18, 5, 0.85)',
          }}
        >
          {prop.label ?? '0x7F4A'}
        </div>
      );
    case 'network-graph':
      return (
        <svg viewBox="0 0 90 60" className="w-20 h-14">
          <line x1="16" y1="16" x2="48" y2="28" stroke="#00ff41" strokeWidth="1.2" strokeOpacity="0.7" />
          <line x1="48" y1="28" x2="76" y2="14" stroke="#00ff41" strokeWidth="1.2" strokeOpacity="0.7" />
          <line x1="48" y1="28" x2="68" y2="48" stroke="#00ff41" strokeWidth="1.2" strokeOpacity="0.7" />
          <line x1="16" y1="16" x2="22" y2="48" stroke="#00ff41" strokeWidth="1.2" strokeOpacity="0.7" />
          <circle cx="16" cy="16" r="4" fill="#00ff41" />
          <circle cx="48" cy="28" r="5" fill="#00ff41" />
          <circle cx="76" cy="14" r="3.5" fill="#00ff41" />
          <circle cx="68" cy="48" r="4" fill="#00ff41" />
          <circle cx="22" cy="48" r="3.5" fill="#00ff41" />
        </svg>
      );
    default:
      return null;
  }
}
