import PixelBird from './PixelBird.jsx';

// Ambient background birds. dir 1 = left-to-right, -1 = right-to-left.
const BIRDS = [
  { top: '7%', dur: 30, delay: -6, px: 3, dir: 1, body: '#c96f4a', wing: '#a34f2e' },
  { top: '14%', dur: 42, delay: -20, px: 2, dir: -1, body: '#e0b23f', wing: '#c08a24' },
  { top: '26%', dur: 26, delay: -2, px: 3, dir: 1, body: '#d38f83', wing: '#b96f63' },
  { top: '58%', dur: 48, delay: -33, px: 2, dir: 1, body: '#e0b23f', wing: '#c08a24' },
  { top: '74%', dur: 34, delay: -12, px: 3, dir: -1, body: '#c96f4a', wing: '#a34f2e' },
  { top: '88%', dur: 40, delay: -25, px: 2, dir: -1, body: '#d38f83', wing: '#b96f63' },
];

export default function BirdFlock() {
  return (
    <div className="bird-flock" aria-hidden="true">
      {BIRDS.map((bird, i) => (
        <div
          key={i}
          className="bird-track"
          style={{
            top: bird.top,
            animationDuration: `${bird.dur}s`,
            animationDelay: `${bird.delay}s`,
            animationDirection: bird.dir === 1 ? 'normal' : 'reverse',
          }}
        >
          <div className="bird-bob" style={{ animationDelay: `${i * 0.7}s` }}>
            <PixelBird body={bird.body} wing={bird.wing} px={bird.px} flip={bird.dir === -1} />
          </div>
        </div>
      ))}
    </div>
  );
}
