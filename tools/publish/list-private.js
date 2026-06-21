'use strict';

const { importPrivateUploads } = require('./lib');

const { db, imported, updated } = importPrivateUploads();

const items = Object.values(db.items)
  .sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
  });

console.log('');
console.log('UselessApps.fun Private Review Queue');
console.log('====================================');
console.log('');
console.log(`Imported: ${imported}, Updated: ${updated}`);
console.log(`Total review items: ${items.length}`);
console.log('');

if (!items.length) {
  console.log('No private uploaded videos found yet.');
  process.exit(0);
}

for (const item of items) {
  console.log(`- ${item.appName}`);
  console.log(`  videoId: ${item.videoId}`);
  console.log(`  status: ${item.status}`);
  console.log(`  decision: ${item.decision || 'none'}`);
  console.log(`  score: ${item.score || 0} | views=${item.views || 0} likes=${item.likes || 0} comments=${item.comments || 0}`);
  console.log(`  type: ${item.appType || 'unknown'} | story: ${item.storyMode || 'unknown'}`);
  console.log(`  title: ${item.youtubeTitle || ''}`);
  console.log(`  url: ${item.youtubeUrl || ''}`);
  console.log(`  local: ${item.localVideo || ''}`);

  const av = item.audioValidation;
  if (av) {
    console.log(`  audio: ${av.mode} | readiness=${av.readiness} | publicSafe=${av.publicSafe}`);
    console.log(`  audio warnings: ${(av.warnings || []).join(', ') || 'none'}`);
  } else {
    console.log('  audio: not validated yet');
  }

  if (item.reviewNotes?.length) {
    const last = item.reviewNotes[item.reviewNotes.length - 1];
    console.log(`  last note: ${last.note}`);
  }

  console.log('');
}
