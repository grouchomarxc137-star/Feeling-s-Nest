import PixelSprite from './PixelSprite.jsx';

// A little drooped bird for when something didn't land. Faces left, sheds one
// slow pixel tear (the .tear element, animated in CSS).
const FRAME_DROOP = [
  '...........',
  '....BBBB...',
  '...BBBBBB..',
  '..BBBBBBB..',
  '..BEBBBBB..',
  '.KBBBBBBB..',
  '..BBWWBBB..',
  '..BBBBBBB..',
  '...BBBBB...',
];

export default function SadBird({ body = '#d38f83', wing = '#b96f63', px = 4 }) {
  const palette = {
    B: body,
    W: wing,
    E: '#3a2a22',
    K: '#e0a23f',
  };
  return (
    <span className="sad-bird" style={{ width: 11 * px, height: 9 * px }}>
      <PixelSprite frames={[FRAME_DROOP]} palette={palette} px={px} />
      <span className="tear" style={{ left: 3 * px, top: 5 * px, width: px, height: px }} />
    </span>
  );
}
