'use strict';

const fs = require('fs');
const path = require('path');

const RULES = require('./platform-rules.json');

function clean(input) {
  return String(input || '').replace(/\s+/g, ' ').trim();
}

function truncate(input, max) {
  const text = clean(input);
  if (text.length <= max) return text;
  return text.slice(0, Math.max(0, max - 1)).trim() + '…';
}

function makeHook(app, story) {
  const name = app.name || 'This useless app';
  const hooks = [
    `${name} should not exist`,
    `I built ${name} and productivity collapsed`,
    `${name} is dangerously pointless`,
    `This app does nothing with confidence`,
    `The internet was a mistake, so I built this`
  ];

  if (story?.hook) hooks.unshift(story.hook);

  return truncate(hooks[Math.floor(Math.random() * hooks.length)], 95);
}

function makeAiSummary(app, story) {
  return clean([
    `This video features ${app.name}.`,
    app.description || '',
    `It is part of UselessApps.fun, a comedy project about deliberately pointless web apps.`,
    story?.storyMode ? `The video format is ${story.storyMode.replace(/_/g, ' ')}.` : '',
    `The target audience is viewers interested in tech comedy, coding humour, absurd apps, and internet culture.`
  ].join(' '));
}

function createMetadataPackage(app, story = {}, appUrl = '') {
  const hook = makeHook(app, story);
  const aiSummary = makeAiSummary(app, story);

  const youtubeTitle = truncate(hook, RULES.youtube_shorts.titleMax);

  const youtubeDescription = [
    `${app.name}`,
    '',
    app.description || '',
    '',
    story?.hook ? `Hook: ${story.hook}` : '',
    story?.storyMode ? `Story mode: ${story.storyMode.replace(/_/g, ' ')}` : '',
    app.uselessness ? `Uselessness score: ${app.uselessness}%` : '',
    app.fakeCategory ? `Fake category: ${app.fakeCategory}` : '',
    '',
    appUrl ? `Try it here: ${appUrl}` : '',
    '',
    'UselessApps.fun makes tiny apps that do almost nothing, then treats them like world-changing technology.',
    '',
    'Comment your most useless app idea and we might build it next.',
    '',
    RULES.youtube_shorts.hashtags.join(' ')
  ].filter(Boolean).join('\n');

  const shortCaption = truncate(`${hook}. ${RULES.tiktok.hashtags.join(' ')}`, RULES.tiktok.captionMax);

  return {
    appName: app.name,
    aiSummary,
    youtube_shorts: {
      title: youtubeTitle,
      description: truncate(youtubeDescription, RULES.youtube_shorts.descriptionMax),
      tags: ['useless apps', 'funny apps', 'coding', 'webdev', 'tech comedy', 'pointless app'],
      categoryId: RULES.youtube_shorts.categoryId,
      pinnedComment: 'What useless app should we build next?',
      hashtags: RULES.youtube_shorts.hashtags
    },
    tiktok: {
      caption: shortCaption,
      hashtags: RULES.tiktok.hashtags
    },
    instagram_reels: {
      caption: truncate(`${hook}\n\n${RULES.instagram_reels.hashtags.join(' ')}`, RULES.instagram_reels.captionMax),
      hashtags: RULES.instagram_reels.hashtags
    },
    facebook_reels: {
      caption: truncate(`${hook}\n\n${RULES.facebook_reels.hashtags.join(' ')}`, RULES.facebook_reels.captionMax),
      hashtags: RULES.facebook_reels.hashtags
    },
    rumble: {
      title: truncate(hook, RULES.rumble.titleMax),
      description: truncate(youtubeDescription, RULES.rumble.descriptionMax),
      tags: RULES.rumble.hashtags
    },
    x: {
      post: truncate(`${hook} ${appUrl || ''} ${RULES.x.hashtags.join(' ')}`, RULES.x.captionMax)
    }
  };
}

if (require.main === module) {
  const app = {
    name: 'Emotionally Unhelpful Calculator',
    description: 'A calculator that refuses to give a straight answer.',
    fakeCategory: 'Mathematical Sabotage',
    uselessness: 96
  };

  console.log(JSON.stringify(createMetadataPackage(app, {}, 'https://example.com/app'), null, 2));
}

module.exports = {
  createMetadataPackage
};
