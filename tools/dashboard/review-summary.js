'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const REVIEW_FILE = path.join(ROOT_DIR, 'tools', 'publish', 'review-db.json');

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function countBy(items, fn) {
  return items.reduce((acc, item) => {
    const key = fn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function getReviewSummary() {
  const review = readJson(REVIEW_FILE, { items: {}, audit: [] });
  const items = Object.values(review.items || {});

  const statusCounts = countBy(items, item => item.status || 'unknown');
  const decisionCounts = countBy(items, item => item.decision || 'none');
  const audioReadinessCounts = countBy(items, item => item.audioValidation?.readiness || 'not_validated');

  const readyForApproval = items.filter(item =>
    item.status === 'private_uploaded' &&
    item.audioValidation?.publicSafe === true &&
    item.decision !== 'approved'
  );

  const readyForUnlisted = items.filter(item =>
    item.decision === 'approved' &&
    item.status === 'private_uploaded' &&
    item.audioValidation?.publicSafe === true
  );

  const blockedForPublic = items.filter(item =>
    item.audioValidation?.publicSafe === false ||
    item.audioValidation?.readiness === 'blocked_for_public'
  );

  return {
    total: items.length,
    statusCounts,
    decisionCounts,
    audioReadinessCounts,
    publicSafe: items.filter(item => item.audioValidation?.publicSafe === true).length,
    blockedForPublic: blockedForPublic.length,
    readyForApproval,
    readyForUnlisted,
    latestAudit: (review.audit || []).slice(-5).reverse()
  };
}

module.exports = {
  getReviewSummary
};
