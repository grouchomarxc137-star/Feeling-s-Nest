import TypingHint from './TypingHint.jsx';

export default function WaitingBanner({ message, otherTyping, otherName }) {
  return (
    <div className="card centered-card">
      <p className="subtle">{message}</p>
      <TypingHint show={otherTyping} label={otherName} />
    </div>
  );
}
