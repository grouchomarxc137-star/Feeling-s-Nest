import { useEffect, useState } from 'react';
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

const PHRASES = ['Ti amo Principessa Mia', 'Nhebek', 'EUUW', 'Mimimimimi', 'My person', 'My soulmate', 'My other half'];

const CHIRP_DURATION = 3400;

function randomDelay() {
  return 5000 + Math.random() * 9000;
}

export default function BirdFlock() {
  const [bubbles, setBubbles] = useState({});

  useEffect(() => {
    const timers = [];

    function scheduleChirp(i) {
      timers.push(
        setTimeout(() => {
          const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
          setBubbles((prev) => ({ ...prev, [i]: phrase }));
          timers.push(
            setTimeout(() => {
              setBubbles((prev) => {
                const next = { ...prev };
                delete next[i];
                return next;
              });
              scheduleChirp(i);
            }, CHIRP_DURATION)
          );
        }, randomDelay())
      );
    }

    BIRDS.forEach((_, i) => scheduleChirp(i));
    return () => timers.forEach(clearTimeout);
  }, []);

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
            {bubbles[i] && <span className="bird-speech">{bubbles[i]}</span>}
            <PixelBird body={bird.body} wing={bird.wing} px={bird.px} flip={bird.dir === -1} />
          </div>
        </div>
      ))}
    </div>
  );
}
