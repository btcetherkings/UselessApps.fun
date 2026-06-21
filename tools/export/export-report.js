'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const EXPORT_ROOT = path.join(ROOT_DIR, 'exports', 'manual-packs');

console.log('');
console.log('Manual Export Pack Report');
console.log('=========================');
console.log('');

if (!fs.existsSync(EXPORT_ROOT)) {
  console.log('No export packs found.');
  process.exit(0);
}

const packs = fs.readdirSync(EXPORT_ROOT)
  .map(name => {
    const full = path.join(EXPORT_ROOT, name);
    return {
      name,
      full,
      mtime: fs.statSync(full).mtimeMs
    };
  })
  .filter(x => fs.statSync(x.full).isDirectory())
  .sort((a, b) => b.mtime - a.mtime);

console.log(`Total export packs: ${packs.length}`);
console.log('');

for (const pack of packs.slice(0, 25)) {
  console.log(`- ${pack.name}`);
}
console.log('');
