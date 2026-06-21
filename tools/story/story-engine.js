'use strict';

const crypto = require('crypto');

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function hashText(text) {
  return crypto.createHash('sha1').update(String(text)).digest('hex').slice(0, 12);
}

const STORY_MODES = [
  'fake_emergency_broadcast',
  'fake_documentary',
  'fake_courtroom_trial',
  'fake_investor_pitch',
  'fake_government_warning',
  'fake_nature_documentary',
  'fake_product_launch_disaster',
  'fake_police_chase',
  'fake_scientific_experiment',
  'fake_therapy_session',
  'fake_corporate_audit',
  'fake_conspiracy_investigation'
];

const HOOKS = [
  'This app should not exist, but unfortunately it does.',
  'Breaking news: software has officially given up.',
  'We tested the most pointless app on the internet.',
  'A team of experts reviewed this app and immediately needed a chair.',
  'This is what happens when productivity leaves the building.',
  'The internet made a mistake, and we filmed it.'
];

const ESCALATIONS = [
  'At first, it looked harmless. Then it became administratively confusing.',
  'Within seconds, the situation had escalated to mild inconvenience.',
  'The app refused to explain itself, which experts described as bold.',
  'Nobody asked for this feature, and the app delivered it perfectly.',
  'The investigation was paused while everyone questioned their career choices.'
];

const TWISTS = [
  'Then the app achieved absolutely nothing with suspicious confidence.',
  'Suddenly, the uselessness became structural.',
  'A fake committee was formed. It also did nothing.',
  'The app was declared emotionally incompatible with productivity.',
  'The results were inconclusive, mainly because there were no results.'
];

const CTAS = [
  'Comment your worst app idea and we may legally regret building it.',
  'Follow for more apps that do nothing professionally.',
  'Submit a worse idea before common sense returns.',
  'If this helped you, something has gone terribly wrong.',
  'Like and subscribe before the app becomes self-aware.'
];

function inferAppType(app) {
  const text = `${app.name || ''} ${app.description || ''} ${app.vibe || ''} ${app.fakeCategory || ''}`.toLowerCase();

  if (text.includes('calculator') || text.includes('math')) return 'calculator';
  if (text.includes('button')) return 'button';
  if (text.includes('rock') || text.includes('pet')) return 'object';
  if (text.includes('todo') || text.includes('task') || text.includes('productivity')) return 'productivity';
  if (text.includes('spinner') || text.includes('loading')) return 'waiting';

  return 'general';
}

function createStoryPackage(app, options = {}) {
  const mode = options.mode || pick(STORY_MODES);
  const appType = inferAppType(app);

  const hook = pick(HOOKS);
  const escalation = pick(ESCALATIONS);
  const twist = pick(TWISTS);
  const cta = pick(CTAS);

  const title = app.name || 'Unnamed Useless App';
  const description = app.description || 'An app that has no clear reason to exist.';

  const narration = [
    hook,
    `Today we investigate ${title}.`,
    description,
    escalation,
    `Official story mode: ${mode.replace(/_/g, ' ')}.`,
    twist,
    cta
  ].join(' ');

  const story = {
    appName: title,
    appType,
    storyMode: mode,
    hook,
    escalation,
    twist,
    cta,
    narration,
    storyHash: hashText(`${mode}|${hook}|${escalation}|${twist}|${cta}|${title}`)
  };

  return story;
}

if (require.main === module) {
  const app = {
    name: 'Emotionally Unhelpful Calculator',
    description: 'A calculator that refuses to give a straight answer.',
    fakeCategory: 'Mathematical Sabotage'
  };

  console.log(JSON.stringify(createStoryPackage(app), null, 2));
}

module.exports = {
  STORY_MODES,
  createStoryPackage,
  inferAppType
};
