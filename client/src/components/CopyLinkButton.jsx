import { useState } from 'react';

export default function CopyLinkButton({ sessionId }) {
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
    <button className="btn ghost tiny-btn" onClick={copy}>
      {copied ? 'Link copied!' : 'Copy session link'}
    </button>
  );
}
