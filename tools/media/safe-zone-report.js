'use strict';

const SHORTS_WIDTH = Number(process.env.SHORTS_WIDTH || 720);
const SHORTS_HEIGHT = Number(process.env.SHORTS_HEIGHT || 1280);

function scaleY(value1080x1920) {
  return Math.round((value1080x1920 / 1920) * SHORTS_HEIGHT);
}

function scaleX(value1080x1920) {
  return Math.round((value1080x1920 / 1080) * SHORTS_WIDTH);
}

const safe = {
  size: `${SHORTS_WIDTH}x${SHORTS_HEIGHT}`,
  avoidTop: [0, scaleY(180)],
  avoidBottom: [scaleY(1500), SHORTS_HEIGHT],
  avoidRight: [scaleX(920), SHORTS_WIDTH],
  mainTextZone: {
    x: [scaleX(80), scaleX(900)],
    y: [scaleY(220), scaleY(1450)]
  },
  recommended: {
    headlineY: scaleY(220),
    appFrameY: scaleY(390),
    punchlineY: scaleY(1220),
    ctaY: scaleY(1400),
    maxBottomTextY: scaleY(1450)
  }
};

console.log('');
console.log('UselessApps.fun Safe-Zone Report');
console.log('================================');
console.log('');
console.log(`Video size: ${safe.size}`);
console.log('');
console.log('Avoid zones');
console.log('-----------');
console.log(`Top: y ${safe.avoidTop[0]}-${safe.avoidTop[1]}`);
console.log(`Bottom: y ${safe.avoidBottom[0]}-${safe.avoidBottom[1]}`);
console.log(`Right UI area: x ${safe.avoidRight[0]}-${safe.avoidRight[1]}`);
console.log('');
console.log('Main text zone');
console.log('--------------');
console.log(`x ${safe.mainTextZone.x[0]}-${safe.mainTextZone.x[1]}`);
console.log(`y ${safe.mainTextZone.y[0]}-${safe.mainTextZone.y[1]}`);
console.log('');
console.log('Recommended placements');
console.log('----------------------');
console.log(`Headline y: ${safe.recommended.headlineY}`);
console.log(`App frame y: ${safe.recommended.appFrameY}`);
console.log(`Punchline y: ${safe.recommended.punchlineY}`);
console.log(`CTA y: ${safe.recommended.ctaY}`);
console.log(`Max bottom text y: ${safe.recommended.maxBottomTextY}`);
console.log('');
console.log('Design rule');
console.log('-----------');
console.log('One scene = one main joke. Avoid ticker + footer + captions all competing.');
console.log('');
