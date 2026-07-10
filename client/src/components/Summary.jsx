import { EMOTION_STATUS, SUFFICIENCY } from '../constants.js';
import PixelHearts from './pixel/PixelHearts.jsx';

const SUFFICIENCY_LABEL = {
  [SUFFICIENCY.SATISFIED]: 'Just right',
  [SUFFICIENCY.PARTIAL]: 'Almost there',
  [SUFFICIENCY.NOT_NEEDED]: 'Not quite it',
};

export default function Summary({ state }) {
  return (
    <div>
      <div className="card centered-card">
        <img src="/birds_logo.webp" alt="" className="landing-logo" onError={(e) => (e.target.style.display = 'none')} />
        <h1>You did the thing</h1>
        <PixelHearts />
        <p className="subtle">
          {state.session.initiatorName} &amp; {state.session.responderName} — here's everything you
          untangled together. Be a little proud. We are.
        </p>
      </div>
      {state.emotions.map((emotion, i) => {
        const finalAck = emotion.acknowledgments.find((a) => a.accepted) || emotion.acknowledgments.at(-1);
        const finalReassurance = emotion.reassurances.at(-1);
        return (
          <div className="card summary-item" key={emotion.id}>
            <div className="summary-header">
              <h3>
                {i + 1}. {emotion.text}
              </h3>
              <span className={`status-pill status-${emotion.status}`}>
                {emotion.status === EMOTION_STATUS.STILL_OPEN ? 'Still open' : 'Settled'}
              </span>
            </div>
            {emotion.context && <p className="subtle">{emotion.context}</p>}
            {finalAck && (
              <div className="summary-block">
                <strong>Acknowledgment</strong>
                <p>{finalAck.text}</p>
              </div>
            )}
            {finalReassurance && !finalReassurance.skipped && (
              <div className="summary-block">
                <strong>Reassurance</strong>
                <p>{finalReassurance.text}</p>
                {finalReassurance.sufficiency && (
                  <span className="tiny subtle">{SUFFICIENCY_LABEL[finalReassurance.sufficiency]}</span>
                )}
              </div>
            )}
            {emotion.agreement && (
              <div className="summary-block agreement-block">
                <strong>Agreement</strong>
                <p>{emotion.agreement.text}</p>
                <span className="tiny subtle">
                  Saved {new Date(emotion.agreement.created_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
