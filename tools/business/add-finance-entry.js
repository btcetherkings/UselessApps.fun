'use strict';

const crypto = require('crypto');
const { openDb, now } = require('../db/db');
const { auditLog } = require('../audit/audit-log');

const type = process.argv[2];
const amount = Number(process.argv[3]);
const category = process.argv[4] || 'general';
const note = process.argv.slice(5).join(' ') || '';

if (!['revenue', 'cost'].includes(type)) {
  console.error('Usage: node tools/business/add-finance-entry.js revenue|cost AMOUNT CATEGORY NOTE');
  process.exit(1);
}

if (!Number.isFinite(amount)) {
  console.error('Amount must be a number.');
  process.exit(1);
}

const row = {
  id: `fin_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
  type,
  amount,
  currency: process.env.FINANCE_CURRENCY || 'GBP',
  category,
  source: 'manual',
  platform: '',
  video_id: '',
  note,
  created_at: now()
};

const db = openDb();

db.prepare(`
  INSERT INTO finance_entries
  (id, type, amount, currency, category, source, platform, video_id, note, created_at)
  VALUES
  (@id, @type, @amount, @currency, @category, @source, @platform, @video_id, @note, @created_at)
`).run(row);

db.close();

auditLog({
  eventType: 'finance_entry_created',
  source: 'finance-cli',
  entityType: 'finance_entry',
  entityId: row.id,
  message: `${type} ${row.currency} ${amount} ${category}`,
  payload: row
});

console.log(`Added ${type}: ${row.currency} ${amount} (${category})`);
