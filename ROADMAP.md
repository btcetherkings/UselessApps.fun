# UselessApps.fun Roadmap

## Mission

UselessApps.fun is an automated viral comedy machine.

It creates tiny useless apps, records them, turns them into ridiculous fake-TV videos, uploads them privately, learns what performs, improves future content, and publishes only approved winners.

> Tiny apps. Zero purpose. Maximum joy.

---

## Current Working Milestone

The generation, private upload, audio mix, production audio validation, review sync, and unlisted publish flow are now working or ready for retest.

Confirmed:

- [x] Local video generation works
- [x] YouTube private upload works
- [x] Audio engine exists
- [x] FFmpeg audio mix works
- [x] `audioMix.mode = full_mix` has been confirmed
- [x] Production-safe demo audio assets exist
- [x] `AUDIO_REQUIRE_PUBLIC_SAFE=true` can select production-safe assets
- [x] Corporate Regret Board uploaded privately with production-safe music
- [x] Review queue imports private uploaded videos
- [x] Audio validation flags older pre-audio videos as blocked for public
- [x] Review sync order fixed or in progress
- [x] Unlisted publishing has worked for at least one approved video

---

## Latest State

Review sync has been built so the correct flow is now:

```text
private upload
→ import private uploads into review DB
→ validate audio
→ update review DB
→ review report
→ approve
→ publish unlisted
→ optional public publish only after explicit gate
```

Next build:

```text
review report polish
→ approval readiness summary
→ public publish preflight
→ unlisted retest
→ public publish dry/precheck
```

---

# Active Build: Review Report Polish + Public Publish Retest

Status: Next build

Goal:

Make the review and publish workflow feel like a proper production control panel.

This build should:

- make review reports easier to read
- group videos by readiness
- show publish eligibility clearly
- show audio safety clearly
- show approved/unpublished queue clearly
- add a publish preflight command
- prevent accidental public release
- verify unlisted publishing still works
- prepare a safe public-publish retest command
- update roadmap after successful unlisted/public tests

Files to create/update:

```text
tools/publish/preflight.js
tools/publish/list-private.js
tools/publish/report.js
tools/publish/publish-youtube.js
scripts/publish-preflight.sh
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

Status: Working, public retest pending

Working:

- [x] OAuth private upload works
- [x] Private video upload works
- [x] Approval command works
- [x] Unlisted publish worked for one approved video
- [x] Public publishing gated by env var
- [x] Audio validation can block unsafe public publishing

Next:

- [ ] Add publish preflight command
- [ ] Retest unlisted publishing with Corporate Regret Board
- [ ] Retest public publish only if explicitly intended
- [ ] Confirm `processed-v3.json` and `review-db.json` stay in sync after publishing
- [ ] Fix processed file writeback if publish status is not persisted

---

# Phase 4: Review Sync

Status: Working or being finalized

Working:

- [x] Review sync imports private uploads
- [x] Audio validation updates review DB
- [x] Review reports show audio validation for imported items

Next:

- [ ] Make review-private output grouped and easier to read
- [ ] Highlight only action-needed items by default
- [ ] Add full mode for all items

---

# Phase 5: Audio Validation + Public Safety

Status: Working

Working:

- [x] `audio_missing` blocks older videos from public
- [x] `test_audio_used` blocks public
- [x] `music_not_public_safe` blocks public
- [x] `sfx_not_public_safe` blocks public
- [x] `sfx_missing` can be non-blocking if music is production-safe

Next:

- [ ] Display `publicSafe=true/false` prominently
- [ ] Display production readiness summary
- [ ] Add preflight rules for video publish

---

# Phase 6: Review Report Polish

Status: Next active build

## New review sections

Review should be grouped as:

```text
1. Ready for approval
2. Needs audio review
3. Blocked for public
4. Already approved
5. Published unlisted
6. Published public
```

Each video card should show:

```text
name
videoId
status
decision
url
audio mode
audio readiness
publicSafe
warnings
recommended action
```

## Recommended actions

Examples:

```text
READY_FOR_UNLISTED_TEST
APPROVE_IF_CONTENT_OK
RERENDER_WITH_AUDIO
DO_NOT_PUBLIC_PUBLISH
ALREADY_UNLISTED
```

Tasks:

- [ ] Patch `tools/publish/list-private.js`
- [ ] Add grouping helpers
- [ ] Add recommended actions
- [ ] Add compact/full display mode
- [ ] Confirm Corporate Regret Board appears in right group

---

# Phase 7: Publish Preflight

Status: Next active build

## Command

```bash
./scripts/publish-preflight.sh VIDEO_ID unlisted
./scripts/publish-preflight.sh VIDEO_ID public
```

## Preflight checks

For unlisted:

```text
video exists in review DB
status is private_uploaded or approved
audio validation exists
no hard blockers
warn if needs_audio_review
```

For public:

```text
video exists in review DB
video is approved
ALLOW_PUBLIC_PUBLISH=true required at actual publish time
audio publicSafe must be true
no test audio
no audio_missing
no not_public_safe warnings
prefer status published_unlisted first
```

Output should say:

```text
PASS
WARN
BLOCKED
```

Tasks:

- [ ] Create `tools/publish/preflight.js`
- [ ] Create `scripts/publish-preflight.sh`
- [ ] Integrate preflight into publish-youtube.js
- [ ] Run preflight before unlisted publish
- [ ] Run preflight before public publish

---

# Phase 8: Production Audio Pack

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

# Phase 9: YouTube Analytics + Learning Engine

Status: In progress

Next:

- [ ] Pull stats for all private/unlisted videos
- [ ] Track public-safe audio performance
- [ ] Learn which story modes and audio moods perform best
- [ ] Generate next-video recommendations

---

# Immediate Next Build Tasks

1. Create `tools/publish/preflight.js`.
2. Create `scripts/publish-preflight.sh`.
3. Patch `tools/publish/publish-youtube.js` to call preflight logic.
4. Patch `tools/publish/list-private.js` to group review items.
5. Patch `tools/publish/report.js` to show publish readiness counts.
6. Run `./scripts/sync-review.sh`.
7. Run `./scripts/review-private.sh`.
8. Run preflight for Corporate Regret Board.
9. Approve Corporate Regret Board if content is okay.
10. Publish Corporate Regret Board as unlisted.
11. Retest public preflight without actually publishing publicly first.
12. Update roadmap and commit.

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

Preflight unlisted publish:

```bash
./scripts/publish-preflight.sh VIDEO_ID unlisted
```

Preflight public publish:

```bash
./scripts/publish-preflight.sh VIDEO_ID public
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

1. Add publish preflight.
2. Polish review grouping.
3. Retest Corporate Regret Board unlisted publish.
4. Verify public publish gate.
5. Then build analytics/recommendations for choosing what to create next.
