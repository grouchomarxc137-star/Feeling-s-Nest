import PixelSprite from './PixelSprite.jsx';

const HEART = [
  '.HH.HH.',
  'HHHHHHH',
  'HHHHHHH',
  '.HHHHH.',
  '..HHH..',
  '...H...',
];

export default function PixelHearts({ count = 3, px = 3, color = '#c9857c' }) {
  return (
    <span className="heart-burst" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <PixelSprite key={i} frames={[HEART]} palette={{ H: color }} px={px} />
      ))}
    </span>
  );
}
