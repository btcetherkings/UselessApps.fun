'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { markJobRunning, markJobSuccess, markJobFailure } = require('../jobs/job-lib');

const ROOT_DIR = path.join(__dirname, '..', '..');
const QUEUE_FILE = path.join(ROOT_DIR, 'tools', 'actions', 'action-queue.json');

const SAFE_ACTIONS = new Set([
  'sync_review',
  'run_learning',
  'pull_basic_stats',
  'pull_advanced_analytics',
  'refresh_dashboard',
  'approve_video',
  'reject_video',
  'needs_rerender'
]);

const RESTRICTED_ACTIONS = new Set([
  'publish_unlisted',
  'publish_public',
  'delete_video',
  'public_post_to_social',
  'change_credentials'
]);

const JOB_BY_ACTION = {
  sync_review: 'sync_review',
  run_learning: 'run_learning',
  pull_basic_stats: 'pull_youtube_stats',
  pull_advanced_analytics: 'pull_advanced_analytics',
  refresh_dashboard: 'build_dashboard',
  approve_video: 'review_action',
  reject_video: 'review_action',
  needs_rerender: 'review_action'
};

function now() {
  return new Date().toISOString();
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function loadQueue() {
  return readJson(QUEUE_FILE, {
    version: 1,
    updatedAt: null,
    actions: []
  });
}

function saveQueue(queue) {
  queue.updatedAt = now();
  writeJson(QUEUE_FILE, queue);
}

function makeId() {
  return `act_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

function safetyFor(type) {
  if (SAFE_ACTIONS.has(type)) {
    return {
      level: 'safe',
      requiresTerminal: false,
      publicPublishing: false
    };
  }

  if (RESTRICTED_ACTIONS.has(type)) {
    return {
      level: 'restricted',
      requiresTerminal: true,
      publicPublishing: type === 'publish_public'
    };
  }

  return {
    level: 'unknown',
    requiresTerminal: true,
    publicPublishing: false
  };
}

function terminalCommandFor(action) {
  return `./scripts/run-action.sh ${action.id}`;
}

function queueAction(type, payload = {}, source = 'cli') {
  if (!type) throw new Error('Action type is required.');

  const queue = loadQueue();

  const action = {
    id: makeId(),
    type,
    status: 'pending',
    createdAt: now(),
    updatedAt: now(),
    source,
    payload,
    safety: safetyFor(type),
    terminalCommand: '',
    history: [],
    result: null,
    error: null
  };

  action.terminalCommand = terminalCommandFor(action);

  action.history.push({
    at: now(),
    status: 'pending',
    note: 'Action queued'
  });

  queue.actions.push(action);
  saveQueue(queue);

  return action;
}

function updateAction(id, patch, note) {
  const queue = loadQueue();
  const action = queue.actions.find(a => a.id === id);

  if (!action) {
    throw new Error(`Action not found: ${id}`);
  }

  Object.assign(action, patch);
  action.updatedAt = now();
  action.terminalCommand = terminalCommandFor(action);

  action.history = action.history || [];
  action.history.push({
    at: now(),
    status: action.status,
    note: note || ''
  });

  saveQueue(queue);
  return action;
}

function listActions(status = null) {
  const queue = loadQueue();
  let actions = queue.actions || [];

  if (status) {
    actions = actions.filter(a => a.status === status);
  }

  return actions;
}

function runScript(args) {
  const result = spawnSync(args[0], args.slice(1), {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: false
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${args.join(' ')} failed with exit code ${result.status}`);
  }
}

function scriptForAction(action) {
  const p = action.payload || {};

  if (action.type === 'sync_review') {
    return ['bash', './scripts/sync-review.sh'];
  }

  if (action.type === 'run_learning') {
    return ['bash', './scripts/learning-v2.sh'];
  }

  if (action.type === 'pull_basic_stats') {
    return ['bash', './scripts/youtube-stats-pull.sh'];
  }

  if (action.type === 'pull_advanced_analytics') {
    return ['bash', './scripts/youtube-advanced-pull.sh'];
  }

  if (action.type === 'refresh_dashboard') {
    return ['bash', './scripts/daily-report-v2.sh'];
  }

  if (action.type === 'approve_video') {
    if (!p.videoId) throw new Error('approve_video requires payload.videoId');
    return ['bash', './scripts/approve-video.sh', p.videoId, p.note || 'Approved from action queue'];
  }

  if (action.type === 'reject_video') {
    if (!p.videoId) throw new Error('reject_video requires payload.videoId');
    return ['bash', './scripts/reject-video.sh', p.videoId, p.note || 'Rejected from action queue'];
  }

  if (action.type === 'needs_rerender') {
    if (!p.videoId) throw new Error('needs_rerender requires payload.videoId');
    return ['bash', './scripts/needs-rerender.sh', p.videoId, p.note || 'Marked for rerender from action queue'];
  }

  throw new Error(`Unsupported action type: ${action.type}`);
}

function runAction(id) {
  const queue = loadQueue();
  const action = queue.actions.find(a => a.id === id);

  if (!action) {
    throw new Error(`Action not found: ${id}`);
  }

  if (!['pending', 'approved', 'failed'].includes(action.status)) {
    throw new Error(`Action ${id} is not runnable from status ${action.status}`);
  }

  if (action.safety?.level === 'restricted') {
    throw new Error(`Restricted action cannot be run by generic runner: ${action.type}`);
  }

  const jobKey = JOB_BY_ACTION[action.type] || action.type;

  updateAction(id, { status: 'running', error: null }, 'Action started');
  markJobRunning(jobKey);

  try {
    const command = scriptForAction(action);
    runScript(command);

    markJobSuccess(jobKey);

    return updateAction(id, {
      status: 'completed',
      result: {
        completedAt: now(),
        command: command.join(' ')
      },
      error: null
    }, 'Action completed');
  } catch (err) {
    markJobFailure(jobKey, err.message);

    return updateAction(id, {
      status: 'failed',
      error: err.message
    }, `Action failed: ${err.message}`);
  }
}

module.exports = {
  queueAction,
  listActions,
  updateAction,
  runAction,
  loadQueue,
  safetyFor
};
