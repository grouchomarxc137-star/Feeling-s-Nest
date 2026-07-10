import { useEffect, useState } from 'react';

export default function RoleClaim({ sessionId, onClaim, error, connected }) {
  const [claimed, setClaimed] = useState({ initiatorClaimed: false, responderClaimed: false });
  const [picking, setPicking] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sessions/${sessionId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setClaimed({
            initiatorClaimed: data.session.initiatorClaimed,
            responderClaimed: data.session.responderClaimed,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  function pick(role) {
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setPicking(true);
    onClaim(role, name);
  }

  return (
    <div className="screen centered">
      <div className="card intro-card">
        <img src="/birds_logo.webp" alt="" className="claim-logo" onError={(e) => (e.target.style.display = 'none')} />
        <h2>Coming in for a landing?</h2>
        <p className="subtle">
          First things first — what should we call you?
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Principe, Principessa, or anything you like"
          maxLength={40}
          required
          style={{ width: '100%' }}
        />
        {nameError && <p className="error">Please enter a name first</p>}
        <p className="subtle" style={{ marginTop: 16 }}>
          Now, which bird are you today? (No take-backs — it's locked for this session.)
        </p>
        <div className="role-buttons">
          <button
            className="btn primary"
            disabled={claimed.initiatorClaimed || picking || !connected}
            onClick={() => pick('initiator')}
          >
            {claimed.initiatorClaimed ? 'Already perched' : "I've got feelings to share"}
            <span className="tiny">the one talking</span>
          </button>
          <button
            className="btn secondary"
            disabled={claimed.responderClaimed || picking || !connected}
            onClick={() => pick('responder')}
          >
            {claimed.responderClaimed ? 'Already perched' : "I'm all ears"}
            <span className="tiny">the one listening</span>
          </button>
        </div>
        {!connected && <p className="subtle tiny">Connecting…</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}
