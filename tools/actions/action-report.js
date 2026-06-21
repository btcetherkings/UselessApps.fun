'use strict';

const { listActions } = require('./action-lib');

const actions = listActions();

const counts = actions.reduce((acc, a) => {
  acc[a.status] = (acc[a.status] || 0) + 1;
  return acc;
}, {});

console.log('');
console.log('Action Queue Report');
console.log('===================');
console.log('');

console.log('Counts');
console.log('------');
if (!Object.keys(counts).length) {
  console.log('none: 0');
} else {
  for (const [status, count] of Object.entries(counts)) {
    console.log(`${status}: ${count}`);
  }
}

console.log('');

console.log('Pending / Approved / Failed');
console.log('---------------------------');

const important = actions
  .filter(a => ['pending', 'approved', 'failed'].includes(a.status))
  .slice()
  .reverse();

if (!important.length) {
  console.log('No pending, approved, or failed actions.');
} else {
  for (const a of important) {
    console.log(`- ${a.id} | ${a.type} | ${a.status} | ${a.safety?.level}`);
    console.log(`  run: ${a.terminalCommand || `./scripts/run-action.sh ${a.id}`}`);
    if (a.error) console.log(`  error: ${a.error}`);
  }
}

console.log('');
