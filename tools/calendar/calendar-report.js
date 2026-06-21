'use strict';

const { getCalendarSummary } = require('./calendar-lib');

const summary = getCalendarSummary();

console.log('');
console.log('Publishing Calendar Report');
console.log('==========================');
console.log('');
console.log(`Total items: ${summary.total}`);
console.log(`Ideas: ${summary.counts.idea || 0}`);
console.log(`Ready: ${summary.counts.ready || 0}`);
console.log(`Scheduled: ${summary.counts.scheduled || 0}`);
console.log(`Published: ${summary.counts.published || 0}`);
console.log(`Blocked: ${summary.counts.blocked || 0}`);
console.log('');

for (const item of summary.items.slice(0, 20)) {
  console.log(`- ${item.id} | ${item.platform} | ${item.status} | ${item.title}`);
  if (item.plannedAt) console.log(`  planned: ${item.plannedAt}`);
  if (item.notes) console.log(`  notes: ${item.notes}`);
}

console.log('');
