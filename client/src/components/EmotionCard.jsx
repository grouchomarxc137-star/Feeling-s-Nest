import PixelBird from './pixel/PixelBird.jsx';

export default function EmotionCard({ emotion }) {
  return (
    <div className="emotion-card">
      <div className="emotion-card-head">
        <PixelBird still px={3} body="#d38f83" wing="#b96f63" />
        <h3>{emotion.text}</h3>
      </div>
      {emotion.context && <p className="subtle">{emotion.context}</p>}
      {emotion.intensity != null && (
        <div className="intensity-tag">Loudness {emotion.intensity}/10</div>
      )}
    </div>
  );
}
