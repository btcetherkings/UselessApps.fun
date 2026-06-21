'use strict';

const { openDb } = require('../db/db');

const db = openDb();

const revenue = db.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM finance_entries WHERE type='revenue'").get().total;
const costs = db.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM finance_entries WHERE type='cost'").get().total;
const count = db.prepare("SELECT COUNT(*) AS c FROM finance_entries").get().c;
const recent = db.prepare(`
  SELECT type, amount, currency, category, note, created_at
  FROM finance_entries
  ORDER BY created_at DESC
  LIMIT 20
`).all();

console.log('');
console.log('Finance Report');
console.log('==============');
console.log('');
console.log(`Entries: ${count}`);
console.log(`Revenue: GBP ${Number(revenue).toFixed(2)}`);
console.log(`Costs: GBP ${Number(costs).toFixed(2)}`);
console.log(`Profit: GBP ${(Number(revenue) - Number(costs)).toFixed(2)}`);
console.log('');

for (const row of recent) {
  console.log(`- ${row.created_at} | ${row.type} | ${row.currency} ${row.amount} | ${row.category} | ${row.note || ''}`);
}

console.log('');
db.close();
