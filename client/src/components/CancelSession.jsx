import { useState } from 'react';
import { emitAction } from '../socket.js';

export default function CancelSession() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function confirmCancel() {
    setBusy(true);
    setError(null);
    try {
      await emitAction('session:cancel', {});
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="cancel-session">
      <button className="btn ghost tiny-btn" onClick={() => setConfirming(true)}>
        Cancel session
      </button>

      {confirming && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="card centered-card modal-card">
            <h2>End this session?</h2>
            <p className="subtle">
              Nothing said so far will be lost, but the nest closes for both of you and this session
              can't be picked back up.
            </p>
            {error && <p className="error">{error}</p>}
            <div className="button-row wrap">
              <button className="btn ghost" onClick={() => setConfirming(false)} disabled={busy}>
                Never mind
              </button>
              <button className="btn primary" onClick={confirmCancel} disabled={busy}>
                Yes, cancel it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
