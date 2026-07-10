import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'app.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'setup',
    initiator_token TEXT,
    responder_token TEXT,
    initiator_name TEXT,
    responder_name TEXT,
    current_emotion_index INTEGER NOT NULL DEFAULT 0,
    discord_notified INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS emotions (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    order_index INTEGER NOT NULL,
    text TEXT NOT NULL,
    context TEXT,
    intensity INTEGER,
    status TEXT NOT NULL DEFAULT 'awaiting_ack',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS acknowledgments (
    id TEXT PRIMARY KEY,
    emotion_id TEXT NOT NULL REFERENCES emotions(id),
    text TEXT NOT NULL,
    accepted INTEGER,
    gap_note TEXT,
    attempt_number INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reassurances (
    id TEXT PRIMARY KEY,
    emotion_id TEXT NOT NULL REFERENCES emotions(id),
    text TEXT,
    skipped INTEGER NOT NULL DEFAULT 0,
    sufficiency TEXT,
    gap_note TEXT,
    attempt_number INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS agreements (
    id TEXT PRIMARY KEY,
    emotion_id TEXT NOT NULL REFERENCES emotions(id) UNIQUE,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_emotions_session ON emotions(session_id);
  CREATE INDEX IF NOT EXISTS idx_ack_emotion ON acknowledgments(emotion_id);
  CREATE INDEX IF NOT EXISTS idx_reassurance_emotion ON reassurances(emotion_id);
`);

const sessionColumns = db.prepare(`PRAGMA table_info(sessions)`).all().map((c) => c.name);
if (!sessionColumns.includes('discord_notified')) {
  db.exec(`ALTER TABLE sessions ADD COLUMN discord_notified INTEGER NOT NULL DEFAULT 0`);
}
if (!sessionColumns.includes('initiator_name')) {
  db.exec(`ALTER TABLE sessions ADD COLUMN initiator_name TEXT`);
}
if (!sessionColumns.includes('responder_name')) {
  db.exec(`ALTER TABLE sessions ADD COLUMN responder_name TEXT`);
}

export default db;
