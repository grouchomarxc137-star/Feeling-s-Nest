import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { socket, emitAction } from '../socket.js';
import { SESSION_STATUS, ROLES } from '../constants.js';
import RoleClaim from '../components/RoleClaim.jsx';
import ShareLink from '../components/ShareLink.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import EntryPhase from '../components/EntryPhase.jsx';
import EmotionFlow from '../components/EmotionFlow.jsx';
import Summary from '../components/Summary.jsx';
import ConnectionBanner from '../components/ConnectionBanner.jsx';
import CancelSession from '../components/CancelSession.jsx';
import CopyLinkButton from '../components/CopyLinkButton.jsx';

function storageKey(sessionId) {
  return `reassurance:${sessionId}`;
}

function readStoredCreds(sessionId) {
  try {
    const raw = localStorage.getItem(storageKey(sessionId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredCreds(sessionId, creds) {
  localStorage.setItem(storageKey(sessionId), JSON.stringify(creds));
}

export default function SessionPage() {
  const { sessionId } = useParams();
  const [state, setState] = useState(null);
  const [role, setRole] = useState(null);
  const [joinError, setJoinError] = useState(null);
  const [presence, setPresence] = useState({ initiatorConnected: false, responderConnected: false });
  const [typingRole, setTypingRole] = useState(null);
  const [connected, setConnected] = useState(socket.connected);
  const [notFound, setNotFound] = useState(false);
  const typingTimeoutRef = useRef(null);
  const roleRef = useRef(null);

  const join = useCallback(
    async (chosenRole, name) => {
      const stored = readStoredCreds(sessionId);
      setJoinError(null);
      try {
        const res = await emitAction('session:join', {
          sessionId,
          role: chosenRole || stored?.role || null,
          token: stored?.token || null,
          name,
        });
        writeStoredCreds(sessionId, { role: res.role, token: res.token });
        roleRef.current = res.role;
        setRole(res.role);
      } catch (err) {
        setJoinError(err.message);
      }
    },
    [sessionId]
  );

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sessions/${sessionId}`).then((res) => {
      if (cancelled) return;
      if (res.status === 404) setNotFound(true);
    });

    function onConnect() {
      setConnected(true);
      const stored = readStoredCreds(sessionId);
      if (stored?.token || roleRef.current) {
        join(roleRef.current);
      }
    }
    function onDisconnect() {
      setConnected(false);
    }
    function onState(payload) {
      setState(payload);
    }
    function onPresence(payload) {
      setPresence(payload);
    }
    function onTyping({ role: fromRole, isTyping }) {
      setTypingRole(isTyping ? fromRole : null);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => setTypingRole(null), 4000);
      }
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('session:state', onState);
    socket.on('presence:update', onPresence);
    socket.on('presence:typing', onTyping);

    socket.connect();
    const stored = readStoredCreds(sessionId);
    if (stored?.role) {
      roleRef.current = stored.role;
      setRole(stored.role);
    }
    if (socket.connected) onConnect();

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('session:state', onState);
      socket.off('presence:update', onPresence);
      socket.off('presence:typing', onTyping);
      socket.disconnect();
    };
  }, [sessionId, join]);

  const emitTyping = useCallback(
    (isTyping) => {
      if (!connected || !roleRef.current) return;
      socket.emit('presence:typing', { isTyping });
    },
    [connected]
  );

  if (notFound) {
    return (
      <div className="screen centered">
        <div className="card centered-card">
          <h2>This nest is empty</h2>
          <p className="subtle">The link might be old or mistyped — double-check it with your person.</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <RoleClaim
        sessionId={sessionId}
        onClaim={join}
        error={joinError}
        connected={connected}
      />
    );
  }

  if (!state) {
    return (
      <div className="screen centered">
        <div className="card centered-card">
          <p className="subtle">Fluffing the nest…</p>
        </div>
      </div>
    );
  }

  const otherRole = role === ROLES.INITIATOR ? ROLES.RESPONDER : ROLES.INITIATOR;
  const otherConnected = otherRole === ROLES.INITIATOR ? presence.initiatorConnected : presence.responderConnected;
  const otherTyping = typingRole === otherRole;
  const otherName = otherRole === ROLES.INITIATOR ? state.session.initiatorName : state.session.responderName;

  const isActive =
    state.session.status === SESSION_STATUS.SETUP ||
    state.session.status === SESSION_STATUS.ENTRY ||
    state.session.status === SESSION_STATUS.PROCESSING;

  return (
    <div className="screen">
      <div className="session-shell">
        {state.session.status !== SESSION_STATUS.COMPLETED && state.session.status !== SESSION_STATUS.CANCELLED && (
          <ConnectionBanner connected={connected} otherConnected={otherConnected} otherName={otherName} />
        )}
        {state.session.status === SESSION_STATUS.PROCESSING && (
          <ProgressBar current={state.progress.current} total={state.progress.total} />
        )}

        {state.session.status === SESSION_STATUS.CANCELLED && (
          <div className="card centered-card">
            <h2>This session was cancelled</h2>
            <p className="subtle">
              {otherName} or you called it off. The nest is closed — start a new session whenever
              you're both ready.
            </p>
          </div>
        )}

        {state.session.status === SESSION_STATUS.SETUP && (
          <div className="card centered-card">
            <h2>Waiting for {otherName} to fly in</h2>
            <p className="subtle">Send them this link — we'll keep their spot on the branch warm.</p>
            <ShareLink sessionId={sessionId} />
          </div>
        )}

        {state.session.status === SESSION_STATUS.ENTRY && (
          <EntryPhase
            role={role}
            state={state}
            sessionId={sessionId}
            emitTyping={emitTyping}
            otherTyping={otherTyping}
            otherName={otherName}
          />
        )}

        {state.session.status === SESSION_STATUS.PROCESSING && (
          <EmotionFlow
            role={role}
            state={state}
            emitTyping={emitTyping}
            otherTyping={otherTyping}
            otherName={otherName}
          />
        )}

        {state.session.status === SESSION_STATUS.COMPLETED && <Summary state={state} />}

        {isActive && (
          <div className="session-actions">
            <CopyLinkButton sessionId={sessionId} />
            <CancelSession />
          </div>
        )}
      </div>
    </div>
  );
}
