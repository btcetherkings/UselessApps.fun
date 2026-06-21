'use strict';

const { runAction } = require('./action-lib');

const id = process.argv[2];

if (!id) {
  console.error('Usage: node tools/actions/run-action.js ACTION_ID');
  process.exit(1);
}

const action = runAction(id);
console.log(`Action ${action.id}: ${action.status}`);

if (action.error) {
  console.error(action.error);
  process.exit(1);
}
