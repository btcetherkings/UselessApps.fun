'use strict';

const fs = require('fs');
const path = require('path');
const { checkContentSafety } = require('../safety/content-policy');

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

function getReviewItem(videoId) {
  const review = readJson(REVIEW_FILE, { items: {} });
  return review.items?.[videoId] || null;
}

function hardAudioBlockers(item) {
  const warnings = item.audioValidation?.warnings || [];

  return warnings.filter(w => [
    'audio_missing',
    'test_audio_used',
    'audio_plan_exists_but_no_mix',
    'music_not_public_safe',
    'sfx_not_public_safe'
  ].includes(w));
}

function preflight(videoId, targetPrivacy = 'unlisted') {
  const item = getReviewItem(videoId);
  const result = {
    videoId,
    targetPrivacy,
    status: 'PASS',
    blockers: [],
    warnings: [],
    item: item || null
  };

  if (!item) {
    result.status = 'BLOCKED';
    result.blockers.push('video_not_found_in_review_db');
    return result;
  }

  if (!item.audioValidation) {
    result.status = 'BLOCKED';
    result.blockers.push('audio_not_validated');
    return result;
  }

  const audioBlockers = hardAudioBlockers(item);

  if (audioBlockers.length) {
    result.status = 'BLOCKED';
    result.blockers.push(...audioBlockers);
  }

  if (item.audioValidation.readiness === 'needs_audio_review') {
    result.warnings.push('needs_audio_review');
  }

  if (targetPrivacy === 'unlisted') {
    if (!['private_uploaded', 'approved', 'published_unlisted'].includes(item.status)) {
      result.status = 'BLOCKED';
      result.blockers.push(`bad_status_for_unlisted:${item.status}`);
    }
  }

  if (targetPrivacy === 'public') {
    if (item.decision !== 'approved') {
      result.status = 'BLOCKED';
      result.blockers.push('not_approved');
    }

    if (item.audioValidation.publicSafe !== true) {
      result.status = 'BLOCKED';
      result.blockers.push('audio_not_public_safe');
    }

    if (item.status !== 'published_unlisted') {
      result.warnings.push('prefer_unlisted_before_public');
    }

    if (String(process.env.ALLOW_PUBLIC_PUBLISH || '').toLowerCase() !== 'true') {
      result.warnings.push('ALLOW_PUBLIC_PUBLISH_not_set_actual_publish_will_block');
    }
  }

  if (result.status !== 'BLOCKED' && result.warnings.length) {
    result.status = 'WARN';
  }

  return result;
}

function printPreflight(result) {
  console.log('');
  console.log('UselessApps.fun Publish Preflight');
  console.log('=================================');
  console.log('');

  console.log(`Video ID: ${result.videoId}`);
  console.log(`Target: ${result.targetPrivacy}`);
  console.log(`Status: ${result.status}`);
  console.log('');

  if (result.item) {
    console.log(`Name: ${result.item.appName || result.item.name || 'unknown'}`);
    console.log(`Current status: ${result.item.status}`);
    console.log(`Decision: ${result.item.decision || 'none'}`);
    console.log(`URL: ${result.item.url || ''}`);

    const av = result.item.audioValidation;
    if (av) {
      console.log('');
      console.log('Audio');
      console.log('-----');
      console.log(`Mode: ${av.mode}`);
      console.log(`Readiness: ${av.readiness}`);
      console.log(`Public safe: ${av.publicSafe}`);
      console.log(`Warnings: ${(av.warnings || []).join(', ') || 'none'}`);
    }
  }

  console.log('');

  if (result.blockers.length) {
    console.log('Blockers');
    console.log('--------');
    for (const blocker of result.blockers) console.log(`- ${blocker}`);
    console.log('');
  }

  if (result.warnings.length) {
    console.log('Warnings');
    console.log('--------');
    for (const warning of result.warnings) console.log(`- ${warning}`);
    console.log('');
  }

  if (result.status === 'PASS') {
    console.log('Ready.');
  } else if (result.status === 'WARN') {
    console.log('Allowed with warnings. Review manually before continuing.');
  } else {
    console.log('Blocked. Fix the blockers before publishing.');
  }

  console.log('');
}

if (require.main === module) {
  const videoId = process.argv[2];
  const targetPrivacy = process.argv[3] || 'unlisted';

  if (!videoId) {
    console.error('Usage: node tools/publish/preflight.js VIDEO_ID unlisted|public');
    process.exit(1);
  }

  const result = preflight(videoId, targetPrivacy);
  printPreflight(result);

  if (result.status === 'BLOCKED') process.exit(2);
}

module.exports = {
  preflight,
  printPreflight
};
