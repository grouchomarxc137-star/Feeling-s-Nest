import { useState } from 'react';
import { emitAction } from '../socket.js';
import SadBird from './pixel/SadBird.jsx';

export default function ReassuranceStep({ emotion, role, emitTyping }) {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const attempt = emotion.reassuranceAttemptsUsed + 1;
  const lastGap = emotion.reassurances[emotion.reassurances.length - 1]?.gap_note;

  if (emotion.reassuranceMaxReached) {
    return (
      <div className="card">
        <h2>This one's a stubborn knot</h2>
        <p className="subtle">
          Three tries is plenty for today — some feelings need to circle a while before they land.
          Either of you can leave it open and fly on to the next one. That's not giving up, it's
          pacing yourselves.
        </p>
        <button
          className="btn primary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              await emitAction('emotion:markStillOpen', { emotionId: emotion.id });
            } catch (err) {
              setError(err.message);
              setBusy(false);
            }
          }}
        >
          Leave it open & fly on
        </button>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  if (role !== 'responder') {
    return null;
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await emitAction('reassurance:submit', { emotionId: emotion.id, text });
      emitTyping(false);
      setText('');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function skip() {
    setBusy(true);
    setError(null);
    try {
      await emitAction('reassurance:submit', { emotionId: emotion.id, skipped: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>{attempt > 1 ? `Another go — round ${attempt}` : 'Anything you want to promise?'}</h2>
      <p className="subtle">Offer something small and real — or say the listening was the gift.</p>
      {lastGap && (
        <div className="gap-note-box gap-with-bird">
          <SadBird />
          <div>
            <strong>What was still missing:</strong>
            <p>{lastGap}</p>
          </div>
        </div>
      )}
      <form onSubmit={submit} className="stacked-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => emitTyping(true)}
          onBlur={() => emitTyping(false)}
          placeholder="e.g. I'll check in tomorrow before your meeting"
          rows={4}
        />
        <div className="button-row">
          <button className="btn primary" type="submit" disabled={busy}>
            Offer it
          </button>
          <button className="btn ghost" type="button" onClick={skip} disabled={busy}>
            The listening was enough
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
