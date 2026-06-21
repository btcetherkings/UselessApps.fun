'use strict';

const BLOCKED_STORY_MODES = new Set([
  'fake_government_warning',
  'fake_police_chase',
  'fake_conspiracy_investigation'
]);

const BLOCKED_TERMS = [
  'government',
  'police',
  'politics',
  'politician',
  'election',
  'campaign',
  'parliament',
  'president',
  'prime minister',
  'porn',
  'adult',
  'sexual',
  'nudity',
  'hate',
  'extremism',
  'terrorism',
  'weapon',
  'gun',
  'knife',
  'bomb',
  'drug',
  'cocaine',
  'weed',
  'cannabis',
  'self-harm',
  'suicide',
  'medical advice',
  'legal advice',
  'financial advice',
  'emergency alert',
  'real emergency',
  'public authority'
];

const SAFE_REPLACEMENT_STORY_MODES = [
  'fake_documentary',
  'fake_courtroom_trial',
  'fake_investor_pitch',
  'fake_nature_documentary',
  'fake_product_launch_disaster',
  'fake_scientific_experiment',
  'fake_therapy_session',
  'fake_corporate_audit'
];

function normalise(value) {
  return String(value || '').toLowerCase();
}

function collectText(input) {
  if (!input) return '';
  if (typeof input === 'string') return input;

  return [
    input.name,
    input.title,
    input.description,
    input.summary,
    input.fakeCategory,
    input.category,
    input.type,
    input.storyMode,
    input.file,
    input.url,
    input.narration,
    input.hook,
    input.cta,
    input.storyPackage?.storyMode,
    input.metadataPackage?.youtube_shorts?.title,
    input.metadataPackage?.youtube_shorts?.description
  ].filter(Boolean).join(' ');
}

function checkContentSafety(input) {
  const text = normalise(collectText(input));
  const storyMode =
    input?.storyMode ||
    input?.storyPackage?.storyMode ||
    input?.template?.storyMode ||
    null;

  const warnings = [];
  const blockers = [];

  if (storyMode && BLOCKED_STORY_MODES.has(String(storyMode))) {
    blockers.push(`blocked_story_mode:${storyMode}`);
  }

  for (const term of BLOCKED_TERMS) {
    if (text.includes(term)) {
      blockers.push(`blocked_term:${term}`);
    }
  }

  return {
    status: blockers.length ? 'block' : warnings.length ? 'warn' : 'pass',
    riskScore: blockers.length * 50 + warnings.length * 10,
    blocked: blockers.length > 0,
    warnings,
    blockers,
    safeCategory: 'harmless_absurd_useless_app',
    checkedAt: new Date().toISOString()
  };
}

function isStoryModeAllowed(storyMode) {
  return !BLOCKED_STORY_MODES.has(String(storyMode || ''));
}

function filterSafeTemplates(templates) {
  return (templates || []).filter(template => !checkContentSafety(template).blocked);
}

function safeReplacementStoryMode(current) {
  if (!current || !BLOCKED_STORY_MODES.has(String(current))) return current;
  return SAFE_REPLACEMENT_STORY_MODES[Math.floor(Math.random() * SAFE_REPLACEMENT_STORY_MODES.length)];
}

module.exports = {
  BLOCKED_STORY_MODES,
  BLOCKED_TERMS,
  SAFE_REPLACEMENT_STORY_MODES,
  checkContentSafety,
  isStoryModeAllowed,
  filterSafeTemplates,
  safeReplacementStoryMode
};
