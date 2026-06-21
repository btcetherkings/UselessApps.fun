'use strict';

const { queueAction } = require('./action-lib');

const type = process.argv[2];
const payloadText = process.argv.slice(3).join(' ').trim() || '{}';

if (!type) {
  console.error('Usage: node tools/actions/queue-action.js ACTION_TYPE JSON_PAYLOAD');
  process.exit(1);
}

let payload;

try {
  payload = JSON.parse(payloadText);
} catch (err) {
  console.error('');
  console.error('Invalid JSON payload.');
  console.error(`Payload received: ${payloadText}`);
  console.error(`Error: ${err.message}`);
  console.error('');
  process.exit(1);
}

const action = queueAction(type, payload, 'cli');

console.log('');
console.log('Queued action');
console.log('-------------');
console.log(`ID: ${action.id}`);
console.log(`Type: ${action.type}`);
console.log(`Status: ${action.status}`);
console.log(`Safety: ${action.safety.level}`);
console.log(`Run: ${action.terminalCommand}`);
console.log('');
