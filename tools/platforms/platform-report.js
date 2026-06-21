'use strict';

const { getPlatformSummary } = require('./platform-lib');

const summary = getPlatformSummary();

console.log('');
console.log('Platform Connector Report');
console.log('=========================');
console.log('');
console.log(`Total platforms: ${summary.total}`);
console.log(`Enabled: ${summary.enabled}`);
console.log(`Connected: ${summary.connected}`);
console.log(`API mode: ${summary.api}`);
console.log(`Manual mode: ${summary.manual}`);
console.log(`Future: ${summary.future}`);
console.log('');

for (const p of summary.platforms) {
  console.log(`- ${p.key}`);
  console.log(`  enabled: ${p.enabled}`);
  console.log(`  connected: ${p.connected}`);
  console.log(`  mode: ${p.mode}`);
  console.log(`  status: ${p.status}`);
  console.log(`  upload: ${p.supportsUpload}`);
  console.log(`  analytics: ${p.supportsAnalytics}`);
  console.log('');
}
