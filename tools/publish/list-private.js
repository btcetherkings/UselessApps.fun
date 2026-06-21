'use strict';

const { importPrivateUploads, loadReviewDb } = require('./lib');

function audioSummary(item) {
  const av = item.audioValidation;
  if (!av) {
    return {
      mode: 'not_validated',
      readiness: 'not_validated',
      publicSafe: false,
      warnings: ['not_validated']
    };
  }
  return av;
}

function recommendedAction(item) {
  const av = audioSummary(item);

  if (item.status === 'published_public') return 'ALREADY_PUBLIC';
  if (item.status === 'published_unlisted') return 'ALREADY_UNLISTED';
  if (av.readiness === 'blocked_for_public') return 'DO_NOT_PUBLIC_PUBLISH';
  if (av.readiness === 'needs_audio_review') return 'APPROVE_IF_CONTENT_AND_AUDIO_OK';
  if (item.decision === 'approved') return 'READY_FOR_UNLISTED_TEST';
  if (item.status === 'private_uploaded') return 'APPROVE_IF_CONTENT_OK';
  return 'REVIEW';
}

function groupName(item) {
  const av = audioSummary(item);

  if (item.status === 'published_public') return 'Published Public';
  if (item.status === 'published_unlisted') return 'Published Unlisted';
  if (item.decision === 'approved') return 'Approved / Ready To Publish';
  if (av.readiness === 'blocked_for_public') return 'Blocked For Public';
  if (av.readiness === 'needs_audio_review') return 'Needs Audio Review';
  if (av.publicSafe === true) return 'Ready For Approval';

  return 'Needs Review';
}

function printItem(item) {
  const av = audioSummary(item);

  console.log(`- ${item.appName || item.name}`);
  console.log(`  videoId: ${item.videoId}`);
  console.log(`  status: ${item.status}`);
  console.log(`  decision: ${item.decision || 'none'}`);
  console.log(`  score: ${item.score || 0} | views=${item.views || 0} likes=${item.likes || 0} comments=${item.comments || 0}`);
  console.log(`  type: ${item.appType || 'unknown'} | story: ${item.storyMode || 'unknown'}`);
  console.log(`  title: ${item.title || ''}`);
  console.log(`  url: ${item.url || ''}`);
  console.log(`  local: ${item.localVideo || ''}`);
  console.log(`  audio: ${av.mode} | readiness=${av.readiness} | publicSafe=${av.publicSafe}`);
  console.log(`  audio warnings: ${(av.warnings || []).join(', ') || 'none'}`);
  console.log(`  action: ${recommendedAction(item)}`);
  if (item.lastNote) console.log(`  last note: ${item.lastNote}`);
  console.log('');
}

function main() {
  const summary = importPrivateUploads();
  const review = loadReviewDb();
  const items = Object.values(review.items || {});

  console.log('');
  console.log('UselessApps.fun Private Review Queue');
  console.log('====================================');
  console.log('');
  console.log(`Imported: ${summary.imported}, Updated: ${summary.updated}`);
  console.log(`Total review items: ${items.length}`);
  console.log('');

  const order = [
    'Ready For Approval',
    'Needs Audio Review',
    'Approved / Ready To Publish',
    'Blocked For Public',
    'Published Unlisted',
    'Published Public',
    'Needs Review'
  ];

  for (const group of order) {
    const groupItems = items.filter(item => groupName(item) === group);
    if (!groupItems.length) continue;

    console.log(group);
    console.log('-'.repeat(group.length));

    for (const item of groupItems) {
      printItem(item);
    }
  }
}

main();
