'use strict';

const { importPrivateUploads } = require('./lib');

const { db } = importPrivateUploads();
const items = Object.values(db.items);

const counts = items.reduce((acc, item) => {
  const status = item.status || 'unknown';
  acc[status] = (acc[status] || 0) + 1;
  return acc;
}, {});

console.log('');
console.log('UselessApps.fun Publish Report');
console.log('==============================');
console.log('');

console.log('Status counts');
console.log('-------------');

for (const [status, count] of Object.entries(counts)) {
  console.log(`${status}: ${count}`);
}

console.log('');

console.log('Approved, not yet published');
console.log('---------------------------');

const approved = items.filter(item => item.status === 'approved');

if (!approved.length) {
  console.log('None.');
} else {
  for (const item of approved) {
    console.log(`- ${item.appName}`);
    console.log(`  videoId: ${item.videoId}`);
    console.log(`  score: ${item.score || 0}`);
    console.log(`  url: ${item.youtubeUrl}`);
  }
}

console.log('');

console.log('Recent audit');
console.log('------------');

for (const event of db.audit.slice(-10).reverse()) {
  console.log(`${event.at} | ${event.action} | ${event.videoId} | ${event.note || ''}`);
}

console.log('');

const audioCounts = items.reduce((acc, item) => {
  const readiness = item.audioValidation?.readiness || 'not_validated';
  acc[readiness] = (acc[readiness] || 0) + 1;
  return acc;
}, {});

console.log('Audio readiness counts');
console.log('----------------------');

for (const [status, count] of Object.entries(audioCounts)) {
  console.log(`${status}: ${count}`);
}

console.log('');

console.log('Audio warnings');
console.log('--------------');

for (const item of items) {
  const av = item.audioValidation;
  if (!av || !av.warnings?.length) continue;

  console.log(`- ${item.appName}`);
  console.log(`  videoId: ${item.videoId}`);
  console.log(`  readiness: ${av.readiness}`);
  console.log(`  warnings: ${av.warnings.join(', ')}`);
}

console.log('');
