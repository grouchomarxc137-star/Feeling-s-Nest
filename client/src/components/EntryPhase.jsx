import { useState } from 'react';
import { emitAction } from '../socket.js';
import { ROLES } from '../constants.js';
import TypingHint from './TypingHint.jsx';

export default function EntryPhase({ role, state, emitTyping, otherTyping, otherName }) {
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [showForm, setShowForm] = useState(state.emotions.length === 0);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const emotions = state.emotions;

  if (role !== ROLES.INITIATOR) {
    return (
      <div className="card centered-card">
        <h2>While we wait</h2>
        <p className="subtle">
          {otherName} is gathering their feelings
          {emotions.length > 0 ? ` (${emotions.length} in the nest so far)` : ''}. Deep breaths —
          your only job in a minute is to listen.
        </p>
        <TypingHint show={otherTyping} label={otherName} />
      </div>
    );
  }

  async function submitEmotion(e) {
    e.preventDefault();
    if (!text.trim()) {
      setError('Give this feeling a name');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await emitAction('emotion:add', { text, context, intensity });
      setText('');
      setContext('');
      setIntensity(5);
      emitTyping(false);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function lockEntry() {
    setBusy(true);
    setError(null);
    try {
      await emitAction('entry:lock', {});
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>What's sitting on your chest?</h2>
      <p className="subtle">One feeling at a time. Small words are fine — spelling doesn't count here.</p>

      {emotions.length > 0 && (
        <ul className="emotion-list">
          {emotions.map((em) => (
            <li key={em.id}>{em.text}</li>
          ))}
        </ul>
      )}

      {showForm ? (
        <form onSubmit={submitEmotion} className="stacked-form">
          <label>
            The feeling
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => emitTyping(true)}
              onBlur={() => emitTyping(false)}
              placeholder="anxious, mushy, invisible, over the moon…"
              autoFocus
            />
          </label>
          <label>
            The story behind it (optional)
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              onFocus={() => emitTyping(true)}
              onBlur={() => emitTyping(false)}
              placeholder="what happened, or what set it off"
              rows={3}
            />
          </label>
          <label>
            How loud is it? {intensity}/10
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
            />
          </label>
          <button className="btn primary" type="submit" disabled={busy}>
            Tuck it in the nest
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      ) : (
        <div className="stacked-form">
          <p>Anything else in there?</p>
          <div className="button-row">
            <button className="btn primary" onClick={() => setShowForm(true)}>
              Yep, one more
            </button>
            <button className="btn secondary" onClick={lockEntry} disabled={busy}>
              That's the lot — let's begin
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </div>
  );
}
