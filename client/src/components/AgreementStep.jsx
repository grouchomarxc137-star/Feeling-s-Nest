import { useState } from 'react';
import { emitAction } from '../socket.js';
import PixelHearts from './pixel/PixelHearts.jsx';

export default function AgreementStep({ emotion, emitTyping }) {
  const latest = emotion.reassurances[emotion.reassurances.length - 1];
  const [text, setText] = useState(latest?.text || '');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError('Add the commitment text, or skip');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await emitAction('agreement:save', { emotionId: emotion.id, text });
      emitTyping(false);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  async function skip() {
    setBusy(true);
    setError(null);
    try {
      await emitAction('agreement:skip', { emotionId: emotion.id });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="card centered-card">
      <PixelHearts />
      <h2>It landed! Pinky promise time?</h2>
      <p className="subtle">
        Want to keep this promise somewhere you can both peek at it later? Tweak the words if you
        like.
      </p>
      <form onSubmit={save} className="stacked-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => emitTyping(true)}
          onBlur={() => emitTyping(false)}
          rows={3}
        />
        <div className="button-row">
          <button className="btn primary" type="submit" disabled={busy}>
            Save the promise
          </button>
          <button className="btn ghost" type="button" onClick={skip} disabled={busy}>
            No need to write it down
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
