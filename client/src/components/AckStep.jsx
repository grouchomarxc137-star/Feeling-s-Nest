import { useState } from 'react';
import { emitAction } from '../socket.js';
import SadBird from './pixel/SadBird.jsx';

export default function AckStep({ emotion, emitTyping }) {
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const attempt = emotion.acknowledgments.length + 1;

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError('A few words is all it takes');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await emitAction('ack:submit', { emotionId: emotion.id, text });
      emitTyping(false);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>{attempt > 1 ? `Round ${attempt} — you've got this` : 'Your turn to listen'}</h2>
      <p className="subtle">
        Say back what you heard, in your own words. No fixing yet — just show them you get it.
      </p>
      {emotion.acknowledgments.length > 0 && (
        <div className="gap-note-box gap-with-bird">
          <SadBird />
          <div>
            <strong>What didn't quite land last time:</strong>
            <p>{emotion.acknowledgments[emotion.acknowledgments.length - 1].gap_note}</p>
          </div>
        </div>
      )}
      <form onSubmit={submit} className="stacked-form">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => emitTyping(true)}
          onBlur={() => emitTyping(false)}
          placeholder="So what I'm hearing is…"
          rows={4}
          autoFocus
        />
        <button className="btn primary" type="submit" disabled={busy}>
          Send it over
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
