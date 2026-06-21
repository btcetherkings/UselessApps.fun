'use strict';

const fs = require('fs');
const path = require('path');

const { auditLog } = require('../audit/audit-log');

const ROOT_DIR = path.join(__dirname, '..', '..');
const STAMP = new Date().toISOString().replace(/[:.]/g, '-');
const BACKUP_DIR = path.join(ROOT_DIR, 'backups', `banned-content-cleanup-${STAMP}`);

const FILES = {
  apps: path.join(ROOT_DIR, 'apps.json'),
  processed: path.join(ROOT_DIR, 'tools', 'video-generator', 'processed-v3.json'),
  review: path.join(ROOT_DIR, 'tools', 'publish', 'review-db.json')
};

const BANNED_TERMS = [
  'fake_government_warning',
  'fake_police_chase',
  'fake_conspiracy_investigation',
  'government',
  'police',
  'politics',
  'politician',
  'election',
  'adult',
  'porn',
  'weapon',
  'drug',
  'self-harm',
  'real emergency',
  'public authority'
];

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

function backup(file, name) {
  if (!fs.existsSync(file)) return;
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  fs.copyFileSync(file, path.join(BACKUP_DIR, name));
}

function isBanned(value) {
  const text = JSON.stringify(value || {}).toLowerCase();
  return BANNED_TERMS.some(term => text.includes(term));
}

function main() {
  backup(FILES.apps, 'apps.json');
  backup(FILES.processed, 'processed-v3.json');
  backup(FILES.review, 'review-db.json');

  let removedApps = 0;
  let markedProcessed = 0;
  let markedReview = 0;

  const apps = readJson(FILES.apps, []);
  if (Array.isArray(apps)) {
    const safeApps = apps.filter(app => {
      const banned = isBanned(app);
      if (banned) removedApps += 1;
      return !banned;
    });
    writeJson(FILES.apps, safeApps);
  }

  const processed = readJson(FILES.processed, {});
  for (const [key, item] of Object.entries(processed || {})) {
    if (isBanned(item)) {
      item.status = 'cleanup_candidate';
      item.reviewStatus = 'needs_rerender';
      item.cleanupReason = 'Banned/unsafe story mode or term detected';
      item.cleanupMarkedAt = new Date().toISOString();
      markedProcessed += 1;
    }
  }
  writeJson(FILES.processed, processed);

  const review = readJson(FILES.review, { version: 1, updatedAt: null, items: [], videos: {} });

  if (Array.isArray(review.items)) {
    for (const item of review.items) {
      if (isBanned(item)) {
        item.status = 'needs_rerender';
        item.cleanupReason = 'Banned/unsafe story mode or term detected';
        item.cleanupMarkedAt = new Date().toISOString();
        markedReview += 1;
      }
    }
  }

  if (review.videos && typeof review.videos === 'object') {
    for (const item of Object.values(review.videos)) {
      if (isBanned(item)) {
        item.status = 'needs_rerender';
        item.cleanupReason = 'Banned/unsafe story mode or term detected';
        item.cleanupMarkedAt = new Date().toISOString();
        markedReview += 1;
      }
    }
  }

  review.updatedAt = new Date().toISOString();
  writeJson(FILES.review, review);

  auditLog({
    eventType: 'banned_content_cleanup',
    source: 'cleanup-banned-content',
    message: 'Archived and marked banned generated content',
    payload: {
      backupDir: BACKUP_DIR,
      removedApps,
      markedProcessed,
      markedReview
    }
  });

  console.log('Banned content cleanup complete.');
  console.log(`Backup: ${BACKUP_DIR}`);
  console.log(`Removed apps: ${removedApps}`);
  console.log(`Marked processed: ${markedProcessed}`);
  console.log(`Marked review: ${markedReview}`);
}

main();
