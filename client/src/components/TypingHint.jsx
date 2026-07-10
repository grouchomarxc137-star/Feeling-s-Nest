export default function TypingHint({ show, label }) {
  if (!show) return null;
  return <p className="typing-hint">{label} is typing…</p>;
}
