import { EMOTION_STATUS, ROLES } from '../constants.js';
import EmotionCard from './EmotionCard.jsx';
import WaitingBanner from './WaitingBanner.jsx';
import AckStep from './AckStep.jsx';
import FeedbackStep from './FeedbackStep.jsx';
import ReassuranceStep from './ReassuranceStep.jsx';
import SufficiencyStep from './SufficiencyStep.jsx';
import AgreementStep from './AgreementStep.jsx';

export default function EmotionFlow({ role, state, emitTyping, otherTyping, otherName }) {
  const emotion = state.emotions.find((e) => e.isCurrent);
  if (!emotion) {
    return (
      <div className="card centered-card">
        <p className="subtle">Fetching the next feeling from the nest…</p>
      </div>
    );
  }

  let step = null;

  switch (emotion.status) {
    case EMOTION_STATUS.AWAITING_ACK:
      step =
        role === ROLES.RESPONDER ? (
          <AckStep emotion={emotion} emitTyping={emitTyping} />
        ) : (
          <WaitingBanner
            message={`${otherName} is finding the right words…`}
            otherTyping={otherTyping}
            otherName={otherName}
          />
        );
      break;

    case EMOTION_STATUS.AWAITING_FEEDBACK:
      step =
        role === ROLES.INITIATOR ? (
          <FeedbackStep emotion={emotion} emitTyping={emitTyping} />
        ) : (
          <WaitingBanner
            message={`Your words are with ${otherName} now. Fingers crossed, wings crossed…`}
            otherTyping={otherTyping}
            otherName={otherName}
          />
        );
      break;

    case EMOTION_STATUS.AWAITING_REASSURANCE:
      if (emotion.reassuranceMaxReached) {
        step = <ReassuranceStep emotion={emotion} role={role} emitTyping={emitTyping} />;
      } else {
        step =
          role === ROLES.RESPONDER ? (
            <ReassuranceStep emotion={emotion} role={role} emitTyping={emitTyping} />
          ) : (
            <WaitingBanner
              message={`${otherName} is thinking about what comes next…`}
              otherTyping={otherTyping}
              otherName={otherName}
            />
          );
      }
      break;

    case EMOTION_STATUS.AWAITING_SUFFICIENCY:
      step =
        role === ROLES.INITIATOR ? (
          <SufficiencyStep emotion={emotion} emitTyping={emitTyping} />
        ) : (
          <WaitingBanner
            message={`${otherName} is sitting with your promise for a moment…`}
            otherTyping={otherTyping}
            otherName={otherName}
          />
        );
      break;

    case EMOTION_STATUS.AWAITING_AGREEMENT:
      step = <AgreementStep emotion={emotion} emitTyping={emitTyping} />;
      break;

    default:
      step = null;
  }

  return (
    <div>
      <EmotionCard emotion={emotion} />
      {step}
    </div>
  );
}
