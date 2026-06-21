'use strict';

const { updateAction } = require('./action-lib');

const id = process.argv[2];
const note = process.argv.slice(3).join(' ') || 'Action approved';

if (!id) {
  console.error('Usage: node tools/actions/approve-action.js ACTION_ID NOTE');
  process.exit(1);
}

const action = updateAction(id, { status: 'approved' }, note);
console.log(`Approved ${action.id}`);
