import { useState } from 'react';
import { emitAction } from '../socket.js';
import { SUFFICIENCY } from '../constants.js';

const OPTIONS = [
  { value: SUFFICIENCY.SATISFIED, label: "That's the stuff" },
  { value: SUFFICIENCY.PARTIAL, label: 'Almost there' },
  { value: SUFFICIENCY.NOT_NEEDED, label: 'Not what I needed' },
];

export default function SufficiencyStep({ emotion, emitTyping }) {
  const [gapNote, setGapNote] = useState('');
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const latest = emotion.reassurances[emotion.reassurances.length - 1];

  async function rate(sufficiency) {
    if (sufficiency !== SUFFICIENCY.SATISFIED && !gapNote.trim()) {
      setPending(sufficiency);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await emitAction('sufficiency:submit', { emotionId: emotion.id, sufficiency, gapNote });
      emitTyping(false);
      setGapNote('');
      setPending(null);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>Was that what you needed?</h2>
      <div className="quote-box">{latest?.text}</div>
      {!pending ? (
        <div className="button-row wrap">
          {OPTIONS.map((opt) => (
            <button key={opt.value} className="btn secondary" onClick={() => rate(opt.value)} disabled={busy}>
              {opt.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="stacked-form">
          <label>
            What's still missing? (they want to get this right)
            <textarea
              value={gapNote}
              onChange={(e) => setGapNote(e.target.value)}
              onFocus={() => emitTyping(true)}
              onBlur={() => emitTyping(false)}
              placeholder="It would help if…"
              rows={3}
              autoFocus
            />
          </label>
          <div className="button-row">
            <button className="btn primary" onClick={() => rate(pending)} disabled={busy}>
              Send it gently
            </button>
            <button className="btn ghost" onClick={() => setPending(null)} disabled={busy}>
              Never mind
            </button>
          </div>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
