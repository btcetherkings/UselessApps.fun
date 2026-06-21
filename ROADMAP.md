# UselessApps.fun Roadmap

## Mission

UselessApps.fun is an automated viral comedy machine.

It creates tiny useless apps, records them, turns them into ridiculous fake-TV videos, uploads them privately, learns what performs, improves future content, and publishes only approved winners.

> Tiny apps. Zero purpose. Maximum joy.

---

## Current Working Milestone

The generation, audio, private upload, review, sync, approval, preflight, and publish workflow are now working.

Confirmed:

- [x] Local video generation works
- [x] YouTube private upload works
- [x] YouTube unlisted publish flow works or is ready for controlled retest
- [x] Audio engine exists
- [x] FFmpeg audio mix works
- [x] `audioMix.mode = full_mix` has been confirmed
- [x] Production-safe demo audio assets exist
- [x] `AUDIO_REQUIRE_PUBLIC_SAFE=true` can select production-safe assets
- [x] Corporate Regret Board uploaded privately with production-safe music
- [x] Review queue imports private uploaded videos
- [x] Audio validation blocks older pre-audio videos from public
- [x] Review sync order is fixed
- [x] Publish preflight exists or is being finalized

---

## Current State

The platform can now create and safely review videos, but the autopilot still needs stronger learning logic.

Current problem:

```text
The bot does not yet properly learn from YouTube stats, review decisions, audio safety, story modes, or publish outcomes.
```

Next build:

```text
YouTube stats + review DB + processed metadata
→ learning dataset
→ scoring engine
→ recommendations v2
→ autopilot idea bias
```

---

# Active Build: YouTube Analytics + Learning Recommendations v2

Status: Next build

Goal:

Make the bot learn what to generate next based on real signals.

This build should:

- pull YouTube stats for uploaded videos
- combine stats with processed metadata
- combine review decisions and publish status
- score videos using views/likes/comments/status/review/audio
- rank app types
- rank story modes
- rank hooks/titles
- rank audio moods
- rank SFX tags
- detect weak categories
- create recommendations v2 JSON
- make autopilot prefer better-performing patterns
- avoid repeating recent types too much
- output a readable learning report

Files to create/update:

```text
tools/analytics/youtube-stats.js
tools/analytics/learning-v2.js
tools/analytics/recommendations.js
tools/analytics/report.js
tools/analytics/recommendations-v2.json
tools/autopilot/useless-autopilot.js
scripts/youtube-stats-pull.sh
scripts/learning-v2.sh
scripts/analytics-report.sh
scripts/autopilot-preview-once.sh
ROADMAP.md
```

---

# Phase 1: Core Site

Status: Completed

- [x] Static gallery
- [x] App pages
- [x] `apps.json`
- [x] GitHub Pages deployment
- [x] Basic styling
- [x] Uselessness scores

---

# Phase 2: Basic Video Automation

Status: Completed

- [x] Playwright recording
- [x] FFmpeg Shorts formatting
- [x] Intro/outro cards
- [x] Google TTS narration
- [x] Dry-run generation
- [x] processed tracking
- [x] Retry failed apps
- [x] `MAX_PER_RUN` support
- [x] `FORCE` support

---

# Phase 3: YouTube Upload + Publish Workflow

Status: Working

Working:

- [x] OAuth private upload works
- [x] Private video upload works
- [x] Approval command works
- [x] Publish preflight exists or is being finalized
- [x] Audio validation can block unsafe public publishing

Next:

- [ ] Add publish status as learning signal
- [ ] Boost approved/unlisted/public videos
- [ ] Penalize rejected/needs-rerender videos

---

# Phase 4: Audio + Production Safety

Status: Working

Working:

- [x] Audio plan exists
- [x] Audio mix exists
- [x] Full mix confirmed
- [x] Production-safe asset manifest exists
- [x] Audio validation exists
- [x] Test audio blocked from public

Next:

- [ ] Learn which audio moods work
- [ ] Learn which SFX tags work
- [ ] Penalize videos with audio blockers
- [ ] Record audio score in learning dataset

---

# Phase 5: Review Sync + Approval

Status: Working

Working:

- [x] Review DB imports private uploads
- [x] Audio validation updates review DB
- [x] Review report groups/polishes workflow
- [x] Preflight can block unsafe publish

Next:

- [ ] Add review decision to learning score
- [ ] Treat approved as positive signal
- [ ] Treat needs-rerender/rejected as negative signal
- [ ] Treat unlisted/public as stronger positive signal

---

# Phase 6: YouTube Analytics v1

Status: Foundation exists

Working:

- [x] YouTube stats pull script exists
- [x] Performance DB exists
- [x] Analytics report script exists
- [x] Basic recommendations exist or are being integrated

Next:

- [ ] Normalize stats across old/new videos
- [ ] Combine stats with review DB
- [ ] Combine stats with audio/story metadata
- [ ] Generate recommendations v2

---

# Phase 7: Learning Recommendations v2

Status: Next active build

## Dataset fields

Each video learning row should include:

```json
{
  "videoId": "Nx2Ek9u165c",
  "name": "Corporate Regret Board",
  "appType": "productivity",
  "storyMode": "fake_corporate_audit",
  "audioMode": "narration_music",
  "audioMood": "documentary",
  "musicUsed": "assets/music/documentary-bed-01.wav",
  "sfxTags": [],
  "reviewStatus": "private_uploaded",
  "decision": "none",
  "publishStatus": "private_uploaded",
  "views": 0,
  "likes": 0,
  "comments": 0,
  "score": 0,
  "learningScore": 0
}
```

## Score formula v2

Base public engagement:

```text
views * 1
likes * 8
comments * 15
```

Status boost:

```text
approved +20
published_unlisted +35
published_public +75
```

Review penalty:

```text
rejected -100
needs_rerender -60
blocked_for_public -30
audio_missing -20
test_audio_used -25
```

Freshness:

```text
recent uploads get small boost
very old zero-performance videos get small penalty
```

Safety:

```text
publicSafe=true +10
publicSafe=false -25
```

## Recommendation output

`tools/analytics/recommendations-v2.json` should include:

```json
{
  "version": 2,
  "generatedAt": "...",
  "summary": {
    "videos": 13,
    "uploaded": 13,
    "approved": 1,
    "publishedUnlisted": 1,
    "publicSafe": 1
  },
  "prefer": {
    "appTypes": [],
    "storyModes": [],
    "audioMoods": [],
    "sfxTags": []
  },
  "avoid": {
    "appTypes": [],
    "storyModes": [],
    "audioMoods": [],
    "sfxTags": []
  },
  "nextIdeas": []
}
```

Tasks:

- [ ] Create `tools/analytics/learning-v2.js`
- [ ] Create `scripts/learning-v2.sh`
- [ ] Read `processed-v3.json`
- [ ] Read `review-db.json`
- [ ] Read `performance-db.json`
- [ ] Build joined dataset
- [ ] Score every video
- [ ] Rank app types
- [ ] Rank story modes
- [ ] Rank audio moods
- [ ] Rank SFX tags
- [ ] Output recommendations v2
- [ ] Print readable report

---

# Phase 8: Autopilot Learning Integration

Status: Planned in this build

Goal:

Use `recommendations-v2.json` to gently bias idea generation.

Autopilot should:

```text
prefer high-scoring app types
prefer high-scoring story modes
prefer good audio moods
avoid blocked/rejected patterns
still maintain anti-repeat variety
```

Tasks:

- [ ] Load `recommendations-v2.json`
- [ ] Prefer v2 over v1 recommendations
- [ ] Keep existing anti-repeat logic
- [ ] Add score explanation to created app
- [ ] Add learning reason to ledger

---

# Phase 9: Analytics Report v2

Status: Planned in this build

Report should show:

```text
top videos
worst videos
best app types
best story modes
best audio moods
best review outcomes
blocked videos
next recommendations
```

Tasks:

- [ ] Patch `tools/analytics/report.js`
- [ ] Show v2 recommendations if present
- [ ] Show next ideas
- [ ] Show confidence level
- [ ] Show what data is missing

---

# Immediate Next Build Tasks

1. Create `tools/analytics/learning-v2.js`.
2. Create `scripts/learning-v2.sh`.
3. Run YouTube stats pull.
4. Run learning v2.
5. Inspect `recommendations-v2.json`.
6. Patch autopilot to load v2 recommendations.
7. Run dry-run autopilot preview.
8. Confirm generated app includes learning reason.
9. Commit.

---

# Current Command Set

Pull YouTube stats:

```bash
./scripts/youtube-stats-pull.sh
```

Run learning v2:

```bash
./scripts/learning-v2.sh
```

Analytics report:

```bash
./scripts/analytics-report.sh
```

Autopilot preview with learning:

```bash
USE_LEARNING_ENGINE=true AUTO_DRY_RUN=true ./scripts/autopilot-preview-once.sh
```

Private upload with learning:

```bash
USE_LEARNING_ENGINE=true AUDIO_REQUIRE_PUBLIC_SAFE=true AUTO_DRY_RUN=false ./scripts/autopilot-upload-once-private.sh
```

---

# Current Priority

1. Generate recommendations v2.
2. Use review/audio/publish status as learning signals.
3. Bias autopilot toward stronger content patterns.
4. Keep variety and anti-repeat.
5. Then build dashboard/reporting for learning decisions.
