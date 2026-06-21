'use strict';

const { updateAction } = require('./action-lib');

const id = process.argv[2];
const note = process.argv.slice(3).join(' ') || 'Action rejected';

if (!id) {
  console.error('Usage: node tools/actions/reject-action.js ACTION_ID NOTE');
  process.exit(1);
}

const action = updateAction(id, { status: 'rejected' }, note);
console.log(`Rejected ${action.id}`);
