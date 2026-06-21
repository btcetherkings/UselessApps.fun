'use strict';

const { openDb, DB_FILE } = require('./db');

const db = openDb();

db.exec(`
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  source TEXT,
  entity_type TEXT,
  entity_id TEXT,
  message TEXT,
  payload_json TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  name TEXT,
  file TEXT,
  category TEXT,
  safety_status TEXT,
  payload_json TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS video_records (
  id TEXT PRIMARY KEY,
  name TEXT,
  video_id TEXT,
  url TEXT,
  status TEXT,
  public_safe INTEGER,
  safety_status TEXT,
  learning_score REAL,
  payload_json TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS action_snapshots (
  id TEXT PRIMARY KEY,
  type TEXT,
  status TEXT,
  safety_level TEXT,
  terminal_command TEXT,
  payload_json TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job_snapshots (
  id TEXT PRIMARY KEY,
  status TEXT,
  last_run TEXT,
  last_success TEXT,
  last_error TEXT,
  duration_ms INTEGER,
  payload_json TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS finance_entries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  category TEXT,
  source TEXT,
  platform TEXT,
  video_id TEXT,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_accounts (
  id TEXT PRIMARY KEY,
  enabled INTEGER,
  connected INTEGER,
  status TEXT,
  payload_json TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS system_snapshots (
  id TEXT PRIMARY KEY,
  snapshot_type TEXT,
  payload_json TEXT,
  created_at TEXT NOT NULL
);
`);

console.log(`SQLite database ready: ${DB_FILE}`);
