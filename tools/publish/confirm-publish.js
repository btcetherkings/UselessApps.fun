'use strict';

const readline = require('readline');
const { spawnSync } = require('child_process');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');

const videoId = process.argv[2];
const target = process.argv[3];

if (!videoId || !['public', 'unlisted'].includes(target)) {
  console.error('Usage: node tools/publish/confirm-publish.js VIDEO_ID public|unlisted');
  process.exit(1);
}

const expected = `PUBLISH ${videoId} AS ${target}`;

console.log('');
console.log('Typed Publish Confirmation');
console.log('==========================');
console.log('');
console.log(`Video ID: ${videoId}`);
console.log(`Target: ${target}`);
console.log('');
console.log('This will run publish preflight and then attempt YouTube publish status update.');
console.log('Type this exact phrase to continue:');
console.log('');
console.log(expected);
console.log('');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Confirm: ', answer => {
  rl.close();

  if (answer.trim() !== expected) {
    console.error('Confirmation mismatch. Publish cancelled.');
    process.exit(1);
  }

  const result = spawnSync('bash', ['./scripts/publish-approved.sh', videoId, target], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: false
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status || 0);
});
