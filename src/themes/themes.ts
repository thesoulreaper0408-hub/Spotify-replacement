import type { ThemeId } from '../types/music';

export interface ThemeMeta {
  id: ThemeId;
  emoji: string;
  label: string;
  shortLabel: string;
  tagline: string;
  swatches: [string, string, string];
}

export const THEME_OPTIONS: ThemeMeta[] = [
  {
    id: 'classic-dark',
    emoji: '🎧',
    label: 'Classic Dark',
    shortLabel: 'Classic',
    tagline: 'Sleek studio glassmorphism & ambient glow',
    swatches: ['#121212', '#1DB954', '#FFFFFF'],
  },
  {
    id: 'pixel-retro',
    emoji: '👾',
    label: '8-Bit Pixel Retro',
    shortLabel: '8-Bit',
    tagline: 'Starfield arcade bricks & pixel hearts',
    swatches: ['#141028', '#FFD500', '#00E5FF'],
  },
  {
    id: 'comic-book',
    emoji: '💥',
    label: '2D Cartoon / Comic',
    shortLabel: 'Comic',
    tagline: 'Halftone dots, thick ink & POW pop',
    swatches: ['#FFF9DB', '#F43F5E', '#22D3EE'],
  },
  {
    id: 'cyberpunk-neon',
    emoji: '🌆',
    label: 'Cyberpunk Neon',
    shortLabel: 'Cyberpunk',
    tagline: 'Synth horizon grid, rain & neon glow',
    swatches: ['#070510', '#00F0FF', '#FF2A85'],
  },
  {
    id: 'cozy-paper',
    emoji: '📝',
    label: 'Cozy Paper / Sketch',
    shortLabel: 'Sketch',
    tagline: 'Ruled notebook, tape strips & ink doodles',
    swatches: ['#FAF5EB', '#B45309', '#2B2623'],
  },
  {
    id: 'frutiger-aero',
    emoji: '🫧',
    label: 'Frutiger Aero / XP',
    shortLabel: 'Aero XP',
    tagline: 'Sky clouds, soap bubbles & glossy gel',
    swatches: ['#E6F6FF', '#0C74E4', '#49C42F'],
  },
  {
    id: 'vaporwave',
    emoji: '🌴',
    label: 'Vaporwave / 90s Synth',
    shortLabel: 'Vaporwave',
    tagline: 'Sunset palms, bust silhouettes & Win95',
    swatches: ['#FF71CE', '#01CDFE', '#B967FF'],
  },
  {
    id: 'blueprint',
    emoji: '📐',
    label: 'Blueprint / Architect',
    shortLabel: 'Blueprint',
    tagline: 'CAD grid ticks, crosshairs & schematics',
    swatches: ['#0A2540', '#FFFFFF', '#7DD3FC'],
  },
  {
    id: 'claymorphism',
    emoji: '🧸',
    label: 'Claymorphism / Soft 3D',
    shortLabel: 'Clay 3D',
    tagline: 'Pastel 3D blobs & squishy marshmallow UI',
    swatches: ['#EEF2F9', '#6C63FF', '#FF7AA2'],
  },
  {
    id: 'terminal',
    emoji: '💻',
    label: 'Terminal / Hacker',
    shortLabel: 'Terminal',
    tagline: 'Matrix rain, CRT scanlines & [ >_ ] prompt',
    swatches: ['#000000', '#00FF41', '#008F11'],
  },
];

export const THEME_COVER_PALETTES: Record<ThemeId, Array<[string, string, string]>> = {
  'classic-dark': [
    ['#14532d', '#1db954', '#bbf7d0'],
    ['#1e293b', '#38bdf8', '#e0f2fe'],
    ['#3b0764', '#a855f7', '#f3e8ff'],
    ['#7c2d12', '#fb923c', '#ffedd5'],
    ['#0f172a', '#2dd4bf', '#ccfbf1'],
  ],
  'pixel-retro': [
    ['#1d1542', '#00e5ff', '#ffd500'],
    ['#2b103a', '#ff4ecd', '#7dff6b'],
    ['#0f2d38', '#52ff9c', '#ffffff'],
    ['#361914', '#ff7b29', '#ffe866'],
    ['#1b2147', '#6c8cff', '#ff5470'],
  ],
  'comic-book': [
    ['#ffd43b', '#f43f5e', '#000000'],
    ['#22d3ee', '#ffd43b', '#000000'],
    ['#f43f5e', '#22d3ee', '#000000'],
    ['#a3e635', '#f97316', '#000000'],
    ['#38bdf8', '#ec4899', '#000000'],
  ],
  'cyberpunk-neon': [
    ['#140724', '#ff2a85', '#00f0ff'],
    ['#061428', '#00f0ff', '#a855f7'],
    ['#1f0620', '#f43f5e', '#facc15'],
    ['#081b26', '#22d3ee', '#ff2a85'],
    ['#160b2e', '#c026d3', '#38bdf8'],
  ],
  'cozy-paper': [
    ['#efe5d4', '#b45309', '#2b2623'],
    ['#e7ecdf', '#2f5d50', '#2b2623'],
    ['#f2e2d9', '#9f3a2e', '#2b2623'],
    ['#e6e4ee', '#4b5563', '#2b2623'],
    ['#f5ecd7', '#a16207', '#2b2623'],
  ],
  'frutiger-aero': [
    ['#cdeeff', '#0c74e4', '#49c42f'],
    ['#d7f9e9', '#10b981', '#0284c7'],
    ['#e0f2fe', '#0284c7', '#38bdf8'],
    ['#dcfce7', '#16a34a', '#0ea5e9'],
    ['#e8f3ff', '#2563eb', '#22c55e'],
  ],
  'vaporwave': [
    ['#2d104a', '#ff71ce', '#01cdfe'],
    ['#1f1a4d', '#01cdfe', '#fffb96'],
    ['#3c1361', '#b967ff', '#05ffa1'],
    ['#4a1242', '#ff71ce', '#b967ff'],
    ['#142850', '#05ffa1', '#ff71ce'],
  ],
  'blueprint': [
    ['#0a2540', '#ffffff', '#7dd3fc'],
    ['#0c2d4d', '#e0f2fe', '#38bdf8'],
    ['#081d33', '#bae6fd', '#ffffff'],
    ['#0f3154', '#ffffff', '#93c5fd'],
    ['#0a2540', '#60a5fa', '#ffffff'],
  ],
  'claymorphism': [
    ['#e6e9f8', '#6c63ff', '#ff7aa2'],
    ['#fce7f3', '#ec4899', '#8b5cf6'],
    ['#e0f2fe', '#3b82f6', '#38bdf8'],
    ['#dcfce7', '#10b981', '#6c63ff'],
    ['#fef3c7', '#f59e0b', '#fb7185'],
  ],
  'terminal': [
    ['#000000', '#00ff41', '#008f11'],
    ['#001205', '#00ff41', '#5eff88'],
    ['#000000', '#39ff14', '#00b32c'],
    ['#021408', '#00ff41', '#a3ffb8'],
    ['#000000', '#00e639', '#008020'],
  ],
};
