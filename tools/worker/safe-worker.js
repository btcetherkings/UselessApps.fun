'use strict';

const fs = require('fs');
const path = require('path');
const { runAction, loadQueue } = require('../actions/action-lib');

const ROOT_DIR = path.join(__dirname, '..', '..');
const MAX_ACTIONS = Number(process.env.MAX_ACTIONS || 3);

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function logLine(file, line) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, line + '\n');
  console.log(line);
}

function main() {
  const logFile = path.join(ROOT_DIR, 'logs', 'worker', `worker-${nowStamp()}.log`);

  logLine(logFile, 'UselessApps.fun Safe Worker');
  logLine(logFile, '===========================');
  logLine(logFile, `Started: ${new Date().toISOString()}`);
  logLine(logFile, `MAX_ACTIONS: ${MAX_ACTIONS}`);
  logLine(logFile, '');

  const queue = loadQueue();
  const actions = queue.actions || [];

  const retryFailed = String(process.env.RETRY_FAILED || 'false').toLowerCase() === 'true';

  const runnableStatuses = retryFailed
    ? ['pending', 'approved', 'failed']
    : ['pending', 'approved'];

  const runnable = actions.filter(a =>
    runnableStatuses.includes(a.status) &&
    a.safety?.level === 'safe'
  );

  const restricted = actions.filter(a =>
    ['pending', 'approved'].includes(a.status) &&
    a.safety?.level === 'restricted'
  );

  if (restricted.length) {
    logLine(logFile, `Restricted actions skipped: ${restricted.length}`);
    for (const a of restricted) {
      logLine(logFile, `SKIP restricted ${a.id} ${a.type}`);
    }
    logLine(logFile, '');
  }

  const selected = runnable.slice(0, MAX_ACTIONS);

  if (!selected.length) {
    logLine(logFile, 'No safe runnable actions found.');
    logLine(logFile, `Finished: ${new Date().toISOString()}`);
    return;
  }

  let completed = 0;
  let failed = 0;

  for (const action of selected) {
    logLine(logFile, `RUN ${action.id} ${action.type}`);

    try {
      const result = runAction(action.id);

      if (result.status === 'completed') {
        completed += 1;
        logLine(logFile, `DONE ${action.id}`);
      } else {
        failed += 1;
        logLine(logFile, `FAIL ${action.id}: ${result.error || 'unknown error'}`);
      }
    } catch (err) {
      failed += 1;
      logLine(logFile, `CRASH ${action.id}: ${err.message}`);
    }

    logLine(logFile, '');
  }

  logLine(logFile, `Completed: ${completed}`);
  logLine(logFile, `Failed: ${failed}`);
  logLine(logFile, `Finished: ${new Date().toISOString()}`);

  if (failed > 0) process.exit(1);
}

main();
