'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.join(__dirname, '..', '..');
const CALENDAR_FILE = path.join(ROOT_DIR, 'tools', 'calendar', 'publishing-calendar.json');

const ALLOWED_STATUSES = new Set([
  'idea',
  'ready',
  'scheduled',
  'published',
  'skipped',
  'blocked'
]);

function now() {
  return new Date().toISOString();
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function loadCalendar() {
  return readJson(CALENDAR_FILE, {
    version: 1,
    updatedAt: null,
    items: []
  });
}

function saveCalendar(data) {
  data.updatedAt = now();
  writeJson(CALENDAR_FILE, data);
}

function makeId() {
  return `cal_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function addCalendarItem({
  title,
  videoId = '',
  platform = 'youtube',
  status = 'idea',
  plannedAt = '',
  notes = ''
}) {
  if (!title) throw new Error('title is required');
  if (!ALLOWED_STATUSES.has(status)) throw new Error(`invalid status: ${status}`);

  const calendar = loadCalendar();

  const item = {
    id: makeId(),
    title,
    videoId,
    platform,
    status,
    plannedAt,
    actualPublishedAt: '',
    notes,
    createdAt: now(),
    updatedAt: now()
  };

  calendar.items.push(item);
  saveCalendar(calendar);

  return item;
}

function getCalendarSummary() {
  const calendar = loadCalendar();
  const items = calendar.items || [];

  const counts = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    acc[`platform_${item.platform}`] = (acc[`platform_${item.platform}`] || 0) + 1;
    return acc;
  }, {});

  return {
    total: items.length,
    counts,
    items: items.slice(-50).reverse()
  };
}

module.exports = {
  loadCalendar,
  addCalendarItem,
  getCalendarSummary
};
