'use strict';

const { listActions } = require('./action-lib');

const status = process.argv[2] || null;
const actions = listActions(status);

console.log('');
console.log('UselessApps.fun Action Queue');
console.log('============================');
console.log('');

if (!actions.length) {
  console.log('No actions found.');
  process.exit(0);
}

for (const a of actions.slice().reverse()) {
  console.log(`- ${a.id}`);
  console.log(`  type: ${a.type}`);
  console.log(`  status: ${a.status}`);
  console.log(`  safety: ${a.safety?.level || 'unknown'}`);
  console.log(`  source: ${a.source || 'unknown'}`);
  console.log(`  created: ${a.createdAt}`);
  console.log(`  run: ${a.terminalCommand || `./scripts/run-action.sh ${a.id}`}`);
  if (a.error) console.log(`  error: ${a.error}`);
  console.log('');
}
