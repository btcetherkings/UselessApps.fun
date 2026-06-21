'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { openDb, ROOT_DIR, now } = require('./db');
const { auditLog } = require('../audit/audit-log');

function readJson(rel, fallback) {
  try {
    const file = path.join(ROOT_DIR, rel);
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function idFrom(value) {
  return crypto.createHash('sha1').update(String(value)).digest('hex').slice(0, 16);
}

const db = openDb();
const updatedAt = now();

const apps = readJson('apps.json', []);
const processed = readJson('tools/video-generator/processed-v3.json', {});
const actions = readJson('tools/actions/action-queue.json', { actions: [] });
const jobs = readJson('tools/jobs/job-status.json', { jobs: {} });
const channels = readJson('tools/social/social-channels.json', { channels: {} });

const insertContent = db.prepare(`
  INSERT OR REPLACE INTO content_items
  (id, name, file, category, safety_status, payload_json, updated_at)
  VALUES
  (@id, @name, @file, @category, @safety_status, @payload_json, @updated_at)
`);

for (const app of Array.isArray(apps) ? apps : []) {
  insertContent.run({
    id: idFrom(app.file || app.name),
    name: app.name || '',
    file: app.file || '',
    category: app.category || app.fakeCategory || '',
    safety_status: app.safetyCheck?.status || '',
    payload_json: JSON.stringify(app),
    updated_at: updatedAt
  });
}

const insertVideo = db.prepare(`
  INSERT OR REPLACE INTO video_records
  (id, name, video_id, url, status, public_safe, safety_status, learning_score, payload_json, updated_at)
  VALUES
  (@id, @name, @video_id, @url, @status, @public_safe, @safety_status, @learning_score, @payload_json, @updated_at)
`);

for (const [key, record] of Object.entries(processed || {})) {
  insertVideo.run({
    id: idFrom(key),
    name: record.name || '',
    video_id: record.youtube?.videoId || record.videoId || '',
    url: record.youtube?.url || record.url || '',
    status: record.youtube?.privacyStatus || record.status || '',
    public_safe: record.audioValidation?.publicSafe ? 1 : 0,
    safety_status: record.safetyCheck?.status || '',
    learning_score: Number(record.learningScore || 0),
    payload_json: JSON.stringify(record),
    updated_at: updatedAt
  });
}

const insertAction = db.prepare(`
  INSERT OR REPLACE INTO action_snapshots
  (id, type, status, safety_level, terminal_command, payload_json, updated_at)
  VALUES
  (@id, @type, @status, @safety_level, @terminal_command, @payload_json, @updated_at)
`);

for (const action of actions.actions || []) {
  insertAction.run({
    id: action.id,
    type: action.type || '',
    status: action.status || '',
    safety_level: action.safety?.level || '',
    terminal_command: action.terminalCommand || '',
    payload_json: JSON.stringify(action),
    updated_at: updatedAt
  });
}

const insertJob = db.prepare(`
  INSERT OR REPLACE INTO job_snapshots
  (id, status, last_run, last_success, last_error, duration_ms, payload_json, updated_at)
  VALUES
  (@id, @status, @last_run, @last_success, @last_error, @duration_ms, @payload_json, @updated_at)
`);

for (const [key, job] of Object.entries(jobs.jobs || {})) {
  insertJob.run({
    id: key,
    status: job.status || '',
    last_run: job.lastRun || '',
    last_success: job.lastSuccess || '',
    last_error: job.lastError || '',
    duration_ms: Number(job.durationMs || 0),
    payload_json: JSON.stringify(job),
    updated_at: updatedAt
  });
}

const insertPlatform = db.prepare(`
  INSERT OR REPLACE INTO platform_accounts
  (id, enabled, connected, status, payload_json, updated_at)
  VALUES
  (@id, @enabled, @connected, @status, @payload_json, @updated_at)
`);

for (const [key, channel] of Object.entries(channels.channels || {})) {
  insertPlatform.run({
    id: key,
    enabled: channel.enabled ? 1 : 0,
    connected: channel.connected ? 1 : 0,
    status: channel.status || '',
    payload_json: JSON.stringify(channel),
    updated_at: updatedAt
  });
}

db.prepare(`
  INSERT INTO system_snapshots
  (id, snapshot_type, payload_json, created_at)
  VALUES
  (@id, @snapshot_type, @payload_json, @created_at)
`).run({
  id: `snap_${Date.now()}`,
  snapshot_type: 'json_sync',
  payload_json: JSON.stringify({
    apps: Array.isArray(apps) ? apps.length : 0,
    processed: Object.keys(processed || {}).length,
    actions: (actions.actions || []).length,
    jobs: Object.keys(jobs.jobs || {}).length,
    channels: Object.keys(channels.channels || {}).length
  }),
  created_at: updatedAt
});

db.close();

auditLog({
  eventType: 'db_sync',
  source: 'sync-json-to-db',
  message: 'Synced JSON state into SQLite',
  payload: { updatedAt }
});

console.log('Synced JSON state into SQLite.');
