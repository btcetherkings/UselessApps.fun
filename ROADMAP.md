# UselessApps.fun Roadmap

## Mission

UselessApps.fun is an automated viral comedy machine.

It creates tiny useless apps, records them, turns them into ridiculous fake-TV videos, uploads them privately, learns what performs, improves future content, and publishes only approved winners.

> Tiny apps. Zero purpose. Maximum joy.

---

## Current Working Milestone

The automation engine, media intelligence layer, safe-zone foundation, YouTube private upload, private review workflow, FFmpeg audio mixing, production audio manifest, and public-safe audio upload test are working.

Confirmed:

- [x] Local video generation works
- [x] YouTube private upload works
- [x] Audio engine exists
- [x] FFmpeg audio mix works
- [x] `audioMix.mode = full_mix` previously confirmed
- [x] Production-safe demo audio assets exist
- [x] `AUDIO_REQUIRE_PUBLIC_SAFE=true` can select production-safe assets
- [x] Corporate Regret Board uploaded privately with production-safe music
- [x] Review queue imports uploaded private videos
- [x] Audio validation flags older pre-audio videos as blocked for public
- [x] Unlisted publishing has worked for at least one approved video

---

## Latest Observed State

Corporate Regret Board was successfully rendered and privately uploaded:

```text
Uploading to YouTube as private: Corporate Regret Board
Uploaded: Corporate Regret Board
https://youtu.be/Nx2Ek9u165c
Done. Attempted 1, completed 1.
```

Audio validation then showed:

```text
Corporate Regret Board
uploaded: true
mode: narration_music
readiness: needs_audio_review
publicSafe: true
music: assets/music/documentary-bed-01.wav
warnings: sfx_missing
```

Review queue later showed Corporate Regret Board as:

```text
audio: not validated yet
```

Cause:

```text
audio-validate ran before review-private imported the new uploaded video into review-db.json.
```

Next build:

```text
review import → audio validation → review report
```

must become one clean command.

---

# Active Build: Review Sync + Audio Validation Automation

Status: Next build

Goal:

Make review reports always show current audio validation after new private uploads.

This build should:

- import private uploads before audio validation
- validate every uploaded video after import
- update review DB automatically
- make `review-private.sh` auto-run validation
- make `publish-report.sh` auto-run validation
- treat `sfx_missing` as a warning, not a public blocker
- show Corporate Regret Board as publicSafe=true in review queue
- keep older pre-audio videos blocked for public
- add a single review sync command

Files to create/update:

```text
tools/publish/sync-review.js
tools/media/audio-validate.js
tools/publish/list-private.js
tools/publish/report.js
scripts/sync-review.sh
scripts/review-private.sh
scripts/publish-report.sh
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

Status: Working with private uploads and unlisted publishing

Working:

- [x] OAuth upload works
- [x] Private upload works
- [x] Review approval command works
- [x] Publish script exists
- [x] One video reached `published_unlisted`
- [x] Audio validation blocks unsafe public publishing

Next:

- [ ] Retest public publish only after production-safe audio validation is visible in review DB
- [ ] Public publishing remains gated by `ALLOW_PUBLIC_PUBLISH=true`

---

# Phase 4: Autopilot Content Engine

Status: Working

Working:

- [x] Select unpublished apps
- [x] Skip uploaded apps
- [x] Create new useless apps when queue is empty
- [x] Upload privately or dry-run
- [x] Autopilot report works
- [x] Preview-only detection works

Next:

- [ ] After each successful private upload, run review sync
- [ ] Store audio validation result in content ledger later

---

# Phase 5: Generator Intelligence + Audio

Status: Working

Working:

- [x] Story engine exists
- [x] Metadata engine exists
- [x] Quality engine exists
- [x] Audio engine exists
- [x] `audioPlan` exists
- [x] `audioMix` exists
- [x] Production-safe music can be used
- [x] Private upload can complete after audio mix

Next:

- [ ] Store production audio asset IDs in `audioPlan`
- [ ] Improve SFX selection so `sfx_missing` is less common
- [ ] Later: add more production-safe SFX tags for every story mode

---

# Phase 6: Audio Validation

Status: Working, needs workflow sync

Working:

- [x] `audio_missing` blocks older pre-audio videos from public
- [x] `test_audio_used` blocks public publishing
- [x] production-safe music can pass public safety
- [x] `sfx_missing` is detected

Change now:

```text
sfx_missing should mean needs_audio_review, but publicSafe can still be true.
```

Reason:

```text
A video with production-safe music and no SFX can still be okay to publish.
Missing SFX is a quality warning, not a rights/safety blocker.
```

Tasks:

- [ ] Keep `audio_missing` as public-blocking
- [ ] Keep `test_audio_used` as public-blocking
- [ ] Keep `music_not_public_safe` as public-blocking
- [ ] Keep `sfx_not_public_safe` as public-blocking
- [ ] Treat `sfx_missing` as non-blocking warning
- [ ] Show `needs_audio_review` but `publicSafe=true` where appropriate

---

# Phase 7: Review Sync

Status: Next active build

Problem:

```text
review-private imports new videos after audio-validate has already run.
```

Fix:

```text
sync-review = import private uploads + validate audio + refresh review DB
```

Tasks:

- [ ] Create `tools/publish/sync-review.js`
- [ ] Add `scripts/sync-review.sh`
- [ ] Patch `review-private.sh` to run sync first
- [ ] Patch `publish-report.sh` to run sync first
- [ ] Confirm Corporate Regret Board shows audio validation in review list
- [ ] Confirm older videos remain blocked_for_public due audio_missing

---

# Phase 8: Review + Publish Approval

Status: In progress

Next:

- [ ] Show audio mode/readiness/publicSafe consistently
- [ ] Approve Corporate Regret Board if quality is acceptable
- [ ] Publish Corporate Regret Board as unlisted first
- [ ] Public publish only after final review and `ALLOW_PUBLIC_PUBLISH=true`

---

# Phase 9: Production Audio Pack

Status: In progress

Working:

- [x] Production demo music assets generated
- [x] Production demo SFX assets generated
- [x] Manifest registration exists
- [x] Public-safe selection exists

Next:

- [ ] Add more production-safe SFX so every story mode can find a match
- [ ] Replace simple demo tones with better royalty-free audio later
- [ ] Track audio style against performance

---

# Immediate Next Build Tasks

1. Create `tools/publish/sync-review.js`.
2. Patch `audio-validate.js` to export validation runner.
3. Patch `review-private.sh` to run sync first.
4. Patch `publish-report.sh` to run sync first.
5. Treat `sfx_missing` as quality warning, not public blocker.
6. Run `./scripts/sync-review.sh`.
7. Run `./scripts/review-private.sh`.
8. Confirm Corporate Regret Board shows audio validation.
9. Approve Corporate Regret Board.
10. Publish it unlisted first.
11. Update roadmap and commit.

---

# Current Command Set

Sync review DB:

```bash
./scripts/sync-review.sh
```

Review private uploads:

```bash
./scripts/review-private.sh
```

Publish report:

```bash
./scripts/publish-report.sh
```

Approve video:

```bash
./scripts/approve-video.sh VIDEO_ID "Looks good for unlisted test"
```

Publish approved as unlisted:

```bash
./scripts/publish-approved.sh VIDEO_ID unlisted
```

Public publish, only when safe and intentional:

```bash
ALLOW_PUBLIC_PUBLISH=true ./scripts/publish-approved.sh VIDEO_ID public
```

---

# Current Priority

1. Fix review sync order.
2. Make audio validation always appear in review queue.
3. Approve and publish Corporate Regret Board as unlisted.
4. Then move to review report polish and public publish retest.
