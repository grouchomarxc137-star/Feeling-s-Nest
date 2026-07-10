import { useState } from 'react';
import { emitAction } from '../socket.js';

export default function FeedbackStep({ emotion, emitTyping }) {
  const [gapNote, setGapNote] = useState('');
  const [showGapForm, setShowGapForm] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const latestAck = emotion.acknowledgments[emotion.acknowledgments.length - 1];

  async function respond(accepted) {
    if (!accepted && !gapNote.trim()) {
      setShowGapForm(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await emitAction('ack:feedback', { emotionId: emotion.id, accepted, gapNote });
      emitTyping(false);
      setGapNote('');
      setShowGapForm(false);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>Did that land?</h2>
      <div className="quote-box">{latestAck?.text}</div>
      {!showGapForm ? (
        <div className="button-row">
          <button className="btn primary" onClick={() => respond(true)} disabled={busy}>
            Yes — I feel heard
          </button>
          <button className="btn secondary" onClick={() => setShowGapForm(true)} disabled={busy}>
            Not quite…
          </button>
        </div>
      ) : (
        <div className="stacked-form">
          <label>
            What was missing? (be gentle, be honest)
            <textarea
              value={gapNote}
              onChange={(e) => setGapNote(e.target.value)}
              onFocus={() => emitTyping(true)}
              onBlur={() => emitTyping(false)}
              placeholder="I wanted you to notice that…"
              rows={3}
              autoFocus
            />
          </label>
          <div className="button-row">
            <button className="btn primary" onClick={() => respond(false)} disabled={busy}>
              Send it gently
            </button>
            <button className="btn ghost" onClick={() => setShowGapForm(false)} disabled={busy}>
              Never mind
            </button>
          </div>
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
