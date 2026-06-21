'use strict';

const path = require('path');
const { importPrivateUploads } = require('./lib');
const { validateAllAudioRecords } = require('../media/audio-validate');

async function main() {
  console.log('');
  console.log('UselessApps.fun Review Sync');
  console.log('===========================');
  console.log('');

  const imported = importPrivateUploads();

  console.log(`Imported: ${imported.imported}`);
  console.log(`Updated: ${imported.updated}`);
  console.log('');

  const validation = validateAllAudioRecords({
    quiet: true,
    updateReviewDb: true
  });

  console.log(`Audio records validated: ${validation.results.length}`);
  console.log('');

  const latest = validation.results.slice(-5);

  console.log('Latest audio validation');
  console.log('-----------------------');

  for (const item of latest) {
    console.log(`- ${item.name}`);
    console.log(`  uploaded: ${item.uploaded} | dryRun: ${item.dryRun}`);
    console.log(`  mode: ${item.validation.mode}`);
    console.log(`  readiness: ${item.validation.readiness}`);
    console.log(`  publicSafe: ${item.validation.publicSafe}`);
    console.log(`  warnings: ${item.validation.warnings.join(', ') || 'none'}`);
  }

  console.log('');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
