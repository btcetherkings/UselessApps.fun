'use strict';

const { openDb } = require('../db/db');

const db = openDb();

const total = db.prepare('SELECT COUNT(*) AS c FROM audit_events').get().c;
const recent = db.prepare(`
  SELECT event_type, source, entity_type, entity_id, message, created_at
  FROM audit_events
  ORDER BY created_at DESC
  LIMIT 25
`).all();

console.log('');
console.log('Audit Report');
console.log('============');
console.log('');
console.log(`Total audit events: ${total}`);
console.log('');

for (const row of recent) {
  console.log(`- ${row.created_at} | ${row.event_type} | ${row.source} | ${row.message || ''}`);
}

console.log('');
db.close();
