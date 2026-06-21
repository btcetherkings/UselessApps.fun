'use strict';

const { getReviewCards } = require('./review-summary');

const summary = getReviewCards();

console.log('');
console.log('Review Cards');
console.log('============');
console.log('');
console.log(`Total: ${summary.total}`);
console.log(`Needs review: ${summary.needsReview}`);
console.log(`Approved: ${summary.approved}`);
console.log(`Rejected: ${summary.rejected}`);
console.log(`Unsafe/rerender: ${summary.unsafe}`);
console.log('');

if (!summary.cards.length) {
  console.log('No review cards found.');
  process.exit(0);
}

for (const card of summary.cards) {
  console.log(`## ${card.title}`);
  console.log(`Video ID: ${card.videoId}`);
  console.log(`URL: ${card.url || 'none'}`);
  console.log(`Status: ${card.status}`);
  console.log(`Public safe: ${card.publicSafe}`);
  console.log(`Audio: ${card.audioReadiness}`);
  console.log(`Safety: ${card.safetyStatus}`);
  console.log(`Learning score: ${card.learningScore}`);
  console.log(`Recommended: ${card.recommendedAction}`);
  console.log('');
  console.log('Commands:');
  console.log(`  ${card.commands.approve}`);
  console.log(`  ${card.commands.reject}`);
  console.log(`  ${card.commands.rerender}`);
  console.log(`  ${card.commands.exportPack}`);
  console.log(`  ${card.commands.calendar}`);
  console.log(`  ${card.commands.publishUnlisted}`);
  console.log('');
}
