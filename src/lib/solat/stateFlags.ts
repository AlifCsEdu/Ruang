/**
 * Malaysian state flag SVG data for the zone selector.
 * Simplified geometric representations — viewBox "0 0 600 300" for all flags.
 * Each flag is a self-contained SVG string (no external deps).
 */
import type { StateFlag } from './types';

/**
 * Build an inline SVG string from path elements within a 600×300 viewBox.
 */
function svg(inner: string, bg = ''): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300">${bg ? `<rect width="600" height="300" fill="${bg}"/>` : ''}${inner}</svg>`;
}

// Helper: horizontal stripes
function stripes(colors: string[], h = 300): string {
  const sh = h / colors.length;
  return colors.map((c, i) => `<rect y="${i * sh}" width="600" height="${sh}" fill="${c}"/>`).join('');
}

const RED = '#CC0001';
const WHITE = '#FFFFFF';
const BLUE = '#010066';
const YELLOW = '#FFCC00';
const BLACK = '#000000';
const GREEN = '#006847';

export const STATE_FLAGS: StateFlag[] = [
  {
    state: 'Johor',
    emoji: '🏠',
    color: '#010066',
    // Blue field with red-white-blue-white stripes in canton, crescent+star
    svgPath: svg(
      `${stripes([BLUE, BLUE, BLUE, BLUE])}` +
      `<rect width="300" height="150" fill="${BLUE}"/>` +
      `<rect x="0" y="0" width="300" height="37.5" fill="${RED}"/>` +
      `<rect x="0" y="75" width="300" height="37.5" fill="${RED}"/>` +
      `<path d="M380,150 a60,60 0 1,1 0.1,0" fill="${YELLOW}" opacity="0.9"/>` +
      `<path d="M400,150 a45,45 0 1,1 0.1,0" fill="${BLUE}"/>` +
      `<polygon points="460,130 467,148 486,148 471,159 477,177 460,167 443,177 449,159 434,148 453,148" fill="${YELLOW}"/>`,
      BLUE
    ),
  },
  {
    state: 'Kedah',
    emoji: '🌾',
    color: '#CC0001',
    // Red field with yellow crescent, star, and wreath
    svgPath: svg(
      `<path d="M240,150 a80,80 0 1,1 0.1,0" fill="${YELLOW}" opacity="0.85"/>` +
      `<path d="M265,150 a60,60 0 1,1 0.1,0" fill="${RED}"/>` +
      `<polygon points="370,120 380,148 410,148 387,165 395,193 370,177 345,193 353,165 330,148 360,148" fill="${YELLOW}"/>`,
      RED
    ),
  },
  {
    state: 'Kelantan',
    emoji: '🌙',
    color: '#CC0001',
    // Red field with white crescent, star, and two kris daggers
    svgPath: svg(
      `<path d="M250,150 a80,80 0 1,1 0.1,0" fill="${WHITE}" opacity="0.9"/>` +
      `<path d="M275,150 a58,58 0 1,1 0.1,0" fill="${RED}"/>` +
      `<polygon points="380,120 390,148 420,148 396,165 404,193 380,177 356,193 364,165 340,148 370,148" fill="${WHITE}"/>` +
      `<line x1="120" y1="80" x2="160" y2="220" stroke="${WHITE}" stroke-width="8"/>` +
      `<line x1="480" y1="80" x2="440" y2="220" stroke="${WHITE}" stroke-width="8"/>`,
      RED
    ),
  },
  {
    state: 'Melaka',
    emoji: '⚓',
    color: '#010066',
    // Blue-white-red-white stripes with yellow crescent+star in canton
    svgPath: svg(
      `${stripes([BLUE, WHITE, RED, WHITE])}` +
      `<rect width="250" height="150" fill="${BLUE}"/>` +
      `<path d="M100,75 a40,40 0 1,1 0.1,0" fill="${YELLOW}" opacity="0.9"/>` +
      `<path d="M115,75 a28,28 0 1,1 0.1,0" fill="${BLUE}"/>` +
      `<polygon points="170,55 176,72 194,72 180,82 185,99 170,90 155,99 160,82 146,72 164,72" fill="${YELLOW}"/>`,
      BLUE
    ),
  },
  {
    state: 'Negeri Sembilan',
    emoji: '🛡️',
    color: '#FFCC00',
    // Yellow field with black triangle, red diagonal, white and black stripes
    svgPath: svg(
      `<rect width="600" height="100" fill="${YELLOW}"/>` +
      `<rect y="100" width="600" height="100" fill="${RED}"/>` +
      `<rect y="200" width="600" height="100" fill="${BLACK}"/>` +
      `<rect width="200" height="100" fill="${YELLOW}"/>` +
      `<polygon points="0,0 200,0 100,150" fill="${BLACK}"/>` +
      `<polygon points="30,20 170,20 100,120" fill="${RED}"/>` +
      `<circle cx="100" cy="55" r="15" fill="${YELLOW}"/>` +
      `<circle cx="80" cy="80" r="8" fill="${YELLOW}"/>` +
      `<circle cx="120" cy="80" r="8" fill="${YELLOW}"/>`,
      YELLOW
    ),
  },
  {
    state: 'Pahang',
    emoji: '🏔️',
    color: '#000000',
    // Black over white horizontal stripes
    svgPath: svg(
      `<rect width="600" height="150" fill="${BLACK}"/>` +
      `<rect y="150" width="600" height="150" fill="${WHITE}"/>`,
      BLACK
    ),
  },
  {
    state: 'Perak',
    emoji: '👑',
    color: '#FFCC00',
    // White-yellow-black horizontal stripes
    svgPath: svg(
      `<rect width="600" height="100" fill="${WHITE}"/>` +
      `<rect y="100" width="600" height="100" fill="${YELLOW}"/>` +
      `<rect y="200" width="600" height="100" fill="${BLACK}"/>`,
      WHITE
    ),
  },
  {
    state: 'Perlis',
    emoji: '🌿',
    color: '#FFCC00',
    // Yellow over green horizontal stripes
    svgPath: svg(
      `<rect width="600" height="150" fill="${YELLOW}"/>` +
      `<rect y="150" width="600" height="150" fill="${GREEN}"/>`,
      YELLOW
    ),
  },
  {
    state: 'Pulau Pinang',
    emoji: '🌴',
    color: '#010066',
    // Blue-white-yellow vertical stripes with tree
    svgPath: svg(
      `<rect width="200" height="300" fill="${BLUE}"/>` +
      `<rect x="200" width="200" height="300" fill="${WHITE}"/>` +
      `<rect x="400" width="200" height="300" fill="${YELLOW}"/>` +
      `<rect x="275" y="140" width="10" height="100" fill="#8B4513"/>` +
      `<ellipse cx="280" cy="130" rx="40" ry="30" fill="${GREEN}"/>`,
      BLUE
    ),
  },
  {
    state: 'Sabah',
    emoji: '🏝️',
    color: '#0038FF',
    // Blue-white-red triangle design with crescent
    svgPath: svg(
      `${stripes([BLUE, WHITE, RED])}` +
      `<polygon points="0,0 250,150 0,300" fill="${BLUE}"/>` +
      `<path d="M100,150 a40,40 0 1,1 0.1,0" fill="${YELLOW}" opacity="0.9"/>` +
      `<path d="M115,150 a28,28 0 1,1 0.1,0" fill="${BLUE}"/>`,
      BLUE
    ),
  },
  {
    state: 'Sarawak',
    emoji: '🦜',
    color: '#FFCC00',
    // Yellow field with black-blue diagonal, red-yellow crescent+star
    svgPath: svg(
      `<rect width="600" height="300" fill="${YELLOW}"/>` +
      `<polygon points="0,0 600,0 600,300" fill="${BLACK}"/>` +
      `<polygon points="0,0 600,0 600,150" fill="${BLUE}"/>` +
      `<path d="M270,150 a55,55 0 1,1 0.1,0" fill="${YELLOW}" opacity="0.9"/>` +
      `<path d="M290,150 a38,38 0 1,1 0.1,0" fill="${BLUE}"/>` +
      `<polygon points="360,130 367,148 386,148 371,159 377,177 360,167 343,177 349,159 334,148 353,148" fill="${YELLOW}"/>`,
      YELLOW
    ),
  },
  {
    state: 'Selangor',
    emoji: '🏙️',
    color: '#CC0001',
    // Red-yellow quarters with white crescent+star in canton
    svgPath: svg(
      `<rect width="300" height="150" fill="${RED}"/>` +
      `<rect x="300" width="300" height="150" fill="${YELLOW}"/>` +
      `<rect y="150" width="300" height="150" fill="${YELLOW}"/>` +
      `<rect x="300" y="150" width="300" height="150" fill="${RED}"/>` +
      `<path d="M120,75 a40,40 0 1,1 0.1,0" fill="${WHITE}" opacity="0.9"/>` +
      `<path d="M135,75 a28,28 0 1,1 0.1,0" fill="${RED}"/>` +
      `<polygon points="185,55 191,72 209,72 195,82 200,99 185,90 170,99 175,82 161,72 179,72" fill="${WHITE}"/>`,
      RED
    ),
  },
  {
    state: 'Terengganu',
    emoji: '☪️',
    color: '#000000',
    // Black field with white border stripe, crescent+star
    svgPath: svg(
      `<rect x="20" y="20" width="560" height="260" fill="${BLACK}" stroke="${WHITE}" stroke-width="20"/>` +
      `<path d="M250,150 a65,65 0 1,1 0.1,0" fill="${WHITE}" opacity="0.9"/>` +
      `<path d="M275,150 a48,48 0 1,1 0.1,0" fill="${BLACK}"/>` +
      `<polygon points="370,120 380,148 410,148 387,165 395,193 370,177 345,193 353,165 330,148 360,148" fill="${WHITE}"/>`,
      BLACK
    ),
  },
  {
    state: 'Wilayah Persekutuan',
    emoji: '🏛️',
    color: '#010066',
    // Blue-white-red-yellow stripes with crescent+star
    svgPath: svg(
      `${stripes([RED, WHITE, BLUE, YELLOW])}` +
      `<rect width="200" height="150" fill="${BLUE}"/>` +
      `<path d="M80,75 a35,35 0 1,1 0.1,0" fill="${YELLOW}" opacity="0.9"/>` +
      `<path d="M93,75 a24,24 0 1,1 0.1,0" fill="${BLUE}"/>` +
      `<polygon points="130,55 136,72 154,72 140,82 145,99 130,90 115,99 120,82 106,72 124,72" fill="${YELLOW}"/>`,
      BLUE
    ),
  },
];

/**
 * Get flag SVG by state name.
 */
export function getFlagByState(state: string): StateFlag | undefined {
  return STATE_FLAGS.find((f) => f.state.toLowerCase() === state.toLowerCase());
}

/**
 * Render a flag as an inline SVG HTML string at given dimensions.
 */
export function renderFlagSvg(state: string, width = 24, height = 16): string {
  const flag = getFlagByState(state);
  if (!flag) return '';
  // Replace the viewBox-based SVG with explicit width/height
  return flag.svgPath
    .replace('<svg ', `<svg width="${width}" height="${height}" `);
}
