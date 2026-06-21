'use strict';

function safe(value, fallback = 'none') {
  if (value === null || value === undefined || value === '') return fallback;
  return value;
}

function asList(items, mapper = x => `- ${x}`) {
  if (!items || !items.length) return '- none';
  return items.map(mapper).join('\n');
}

function table(headers, rows) {
  const all = [headers, ...rows];
  const widths = headers.map((_, i) =>
    Math.max(...all.map(row => String(row[i] ?? '').length))
  );

  const line = row =>
    '| ' + row.map((cell, i) => String(cell ?? '').padEnd(widths[i])).join(' | ') + ' |';

  const sep =
    '| ' + widths.map(w => '-'.repeat(w)).join(' | ') + ' |';

  return [line(headers), sep, ...rows.map(line)].join('\n');
}

function scoreLabel(score) {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'needs attention';
  return 'weak';
}

function command(text) {
  return `\`${text}\``;
}

module.exports = {
  safe,
  asList,
  table,
  scoreLabel,
  command
};
