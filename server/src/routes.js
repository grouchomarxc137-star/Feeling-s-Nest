import { Router } from 'express';
import * as repo from './repo.js';
import { decorateState } from './stateMachine.js';

const router = Router();

router.post('/sessions', (req, res) => {
  const session = repo.createSession();
  res.status(201).json({ id: session.id });
});

router.get('/sessions/:id', (req, res) => {
  const fullState = repo.getFullState(req.params.id);
  if (!fullState) return res.status(404).json({ error: 'Session not found' });
  res.json(decorateState(fullState));
});

export default router;
