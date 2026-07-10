import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function createSession() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sessions', { method: 'POST' });
      if (!res.ok) throw new Error('Could not create a session');
      const data = await res.json();
      navigate(`/s/${data.id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="screen centered">
      <div className="card intro-card">
        <img src="/birds_logo.webp" alt="" className="landing-logo" onError={(e) => (e.target.style.display = 'none')} />
        <h1>Our nest where our feelings are safe</h1>
        <p className="subtle">
          For me and you. We remember our love, we take care of each other's feelings, like a principessa once said: "kind reminder that it's me and you against the problem, discomfort, world 💛


        </p>
        <button className="btn primary" onClick={createSession} disabled={loading}>
          {loading ? 'Fluffing the nest…' : 'Open the nest'}
        </button>
        {error && <p className="error">{error}</p>}
        <p className="tiny subtle">
          You'll get a link to share.
        </p>
      </div>
    </div>
  );
}
