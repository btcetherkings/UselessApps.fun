'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { auditLog } = require('../audit/audit-log');

const ROOT_DIR = path.join(__dirname, '..', '..');
const STAMP = new Date().toISOString().replace(/[:.]/g, '-');
const ARCHIVE_DIR = path.join(ROOT_DIR, 'backups', `clean-start-${STAMP}`);

const expected = 'CLEAN START USELESSAPPS';

function copyIfExists(src, destName) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  fs.copyFileSync(src, path.join(ARCHIVE_DIR, destName));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

console.log('');
console.log('Clean Start Confirmation');
console.log('========================');
console.log('');
console.log('This archives local runtime state and resets review/processed/action state.');
console.log('It does NOT delete YouTube videos.');
console.log('');
console.log('Type this exact phrase to continue:');
console.log(expected);
console.log('');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Confirm: ', answer => {
  rl.close();

  if (answer.trim() !== expected) {
    console.error('Confirmation mismatch. Clean start cancelled.');
    process.exit(1);
  }

  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

  copyIfExists(path.join(ROOT_DIR, 'tools', 'publish', 'review-db.json'), 'review-db.json');
  copyIfExists(path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json'), 'processed-v3.json');
  copyIfExists(path.join(ROOT_DIR, 'tools', 'actions', 'action-queue.json'), 'action-queue.json');
  copyIfExists(path.join(ROOT_DIR, 'tools', 'autopilot', 'autopilot-state.json'), 'autopilot-state.json');
  copyIfExists(path.join(ROOT_DIR, 'tools', 'autopilot', 'content-ledger.json'), 'content-ledger.json');

  writeJson(path.join(ROOT_DIR, 'tools', 'publish', 'review-db.json'), {
    version: 1,
    updatedAt: new Date().toISOString(),
    items: [],
    videos: {}
  });

  writeJson(path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json'), {});
  writeJson(path.join(ROOT_DIR, 'tools', 'actions', 'action-queue.json'), {
    version: 1,
    updatedAt: new Date().toISOString(),
    actions: []
  });

  auditLog({
    eventType: 'clean_start_completed',
    source: 'cleanup-videos',
    message: 'Archived runtime state and reset local video/action state',
    payload: { archiveDir: ARCHIVE_DIR }
  });

  console.log(`Clean start complete. Archive: ${ARCHIVE_DIR}`);
});
