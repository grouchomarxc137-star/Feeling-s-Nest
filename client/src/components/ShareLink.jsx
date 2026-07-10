import { useState } from 'react';

export default function ShareLink({ sessionId }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/s/${sessionId}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <div className="share-link">
      <input readOnly value={url} onFocus={(e) => e.target.select()} />
      <button className="btn secondary" onClick={copy}>
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
}
