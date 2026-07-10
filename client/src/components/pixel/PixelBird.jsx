import PixelSprite from './PixelSprite.jsx';

// Two-frame flying bird, facing right. Flip with `flip` for right-to-left flight.
const FRAME_WINGS_UP = [
  '.....WW......',
  '....WWWW.....',
  '.....WWW.....',
  '...BBBBBBB...',
  '..BBBBBBBBB..',
  '.TBBBBBBBEB..',
  'TTBBBBBBBBBK.',
  '.TBBBBBBBB...',
  '...BBBBBB....',
  '.............',
];

const FRAME_WINGS_DOWN = [
  '.............',
  '.............',
  '.............',
  '...BBBBBBB...',
  '..BBBBBBBBB..',
  '.TBBBBBBBEB..',
  'TTBBBBBBBBBK.',
  '.TBBWWBBBB...',
  '...WWWW......',
  '.....WW......',
];

export default function PixelBird({ body = '#c96f4a', wing = '#a34f2e', px = 4, still = false, flip = false, className = '' }) {
  const palette = {
    B: body,
    W: wing,
    T: wing,
    E: '#3a2a22',
    K: '#e0a23f',
  };
  const frames = still ? [FRAME_WINGS_UP] : [FRAME_WINGS_UP, FRAME_WINGS_DOWN];
  return (
    <PixelSprite
      frames={frames}
      palette={palette}
      px={px}
      className={`${flip ? 'flipped' : ''} ${className}`}
    />
  );
}
