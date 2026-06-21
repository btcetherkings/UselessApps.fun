'use strict';

const { addCalendarItem } = require('./calendar-lib');

const title = process.argv[2];
const platform = process.argv[3] || 'youtube';
const plannedAt = process.argv[4] || '';
const notes = process.argv.slice(5).join(' ') || '';

if (!title) {
  console.error('Usage: node tools/calendar/add-calendar-item.js "Title" platform plannedAt notes');
  process.exit(1);
}

const item = addCalendarItem({
  title,
  platform,
  plannedAt,
  notes
});

console.log(`Added calendar item: ${item.id}`);
