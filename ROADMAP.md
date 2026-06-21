# UselessApps.fun Roadmap

## Mission

UselessApps.fun is an automated viral comedy machine.

It creates tiny useless apps, records them, turns them into ridiculous fake-TV videos, uploads them privately, learns what performs, improves future content, and publishes only approved winners.

> Tiny apps. Zero purpose. Maximum joy.

---

## Current Working Milestone

The generation, audio, private upload, review, sync, approval, preflight, publish workflow, learning recommendations v2, and learning reason persistence are now working.

Confirmed:

- [x] Local video generation works
- [x] YouTube private upload works
- [x] YouTube unlisted publish flow works or is ready for controlled retest
- [x] Audio engine exists
- [x] FFmpeg audio mix works
- [x] Production-safe demo audio assets exist
- [x] `AUDIO_REQUIRE_PUBLIC_SAFE=true` can select production-safe assets
- [x] Review queue imports private uploaded videos
- [x] Audio validation blocks unsafe public publishing
- [x] Review sync order is fixed
- [x] Publish preflight exists
- [x] Learning v2 recommendations exist
- [x] Autopilot can use v2 recommendations
- [x] `learningReason` is now persisted in generated app records

---

## Current State

The system can now create, upload, review, preflight, and learn.

Current problem:

```text
The learning output is still spread across multiple commands and JSON files.
We need a single daily command that tells us:
what happened, what learned, what is blocked, what should be made next, and why.
```

Next build:

```text
stats + review + validation + recommendations + latest app
→ daily autopilot report
→ human-readable dashboard output
→ optional markdown report file
```

---

# Active Build: Learning Dashboard + Daily Autopilot Report

Status: Next build

Goal:

Create a single reporting layer that summarises the whole machine.

This build should answer:

```text
How many apps exist?
How many videos uploaded?
How many are private/unlisted/public?
Which videos are blocked?
Which videos are public-safe?
What did learning v2 recommend?
What did the autopilot pick and why?
What should we approve, rerender, or publish next?
```

Files to create/update:

```text
tools/dashboard/daily-report.js
tools/dashboard/learning-summary.js
tools/dashboard/review-summary.js
tools/dashboard/content-summary.js
scripts/daily-report.sh
scripts/dashboard.sh
ROADMAP.md
```

Optional output file:

```text
reports/daily-autopilot-report.md
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

# Phase 3: Audio + Production Safety

Status: Working

Working:

- [x] Audio plan exists
- [x] Audio mix exists
- [x] Production-safe asset manifest exists
- [x] Test audio blocked from public
- [x] Public-safe production music works
- [x] Full audio mix works

Next:

- [ ] Dashboard summary of audio health
- [ ] Count test-audio videos
- [ ] Count public-safe videos
- [ ] Count blocked videos
- [ ] Show recommended audio improvements

---

# Phase 4: Review + Publish Workflow

Status: Working

Working:

- [x] Review DB imports private uploads
- [x] Audio validation updates review DB
- [x] Review reports are synced
- [x] Publish preflight exists
- [x] Public publishing is gated

Next:

- [ ] Dashboard summary of review status
- [ ] Show videos needing approval
- [ ] Show videos ready for unlisted
- [ ] Show blocked videos
- [ ] Show recommended action per video

---

# Phase 5: YouTube Analytics + Learning v2

Status: Working

Working:

- [x] YouTube stats pull script exists
- [x] Performance DB exists
- [x] Learning v2 exists
- [x] Recommendations v2 file exists
- [x] Autopilot can prefer v2
- [x] `learningReason` persists

Next:

- [ ] Dashboard summary of learning v2
- [ ] Show top/worst videos
- [ ] Show preferred app types
- [ ] Show preferred story modes
- [ ] Show preferred audio moods
- [ ] Show next ideas
- [ ] Show latest learning reason

---

# Phase 6: Daily Autopilot Report

Status: Next active build

## Report sections

The report should include:

```text
1. System status
2. Content totals
3. Upload/publish status
4. Review queue status
5. Audio safety status
6. Learning recommendations v2
7. Latest generated app and learning reason
8. Next recommended actions
```

## Console report example

```text
UselessApps.fun Daily Autopilot Report
=====================================

Content:
- Apps: 15
- Uploaded: 13
- Preview only: 2
- Failed: 0

Publishing:
- Private: 12
- Unlisted: 1
- Public: 0

Audio:
- Public-safe: 2
- Blocked: 11
- Needs audio review: 1

Learning:
- Prefer app types: productivity, object
- Prefer story modes: fake_corporate_audit, fake_nature_documentary
- Prefer audio moods: documentary, fake-news

Latest autopilot decision:
- App: Staring Pebble Supreme
- Type: object
- Learning reason: selected by recommendations v2
```

## Markdown output

The dashboard should optionally write:

```text
reports/daily-autopilot-report.md
```

Tasks:

- [ ] Create dashboard folder
- [ ] Create content summary helper
- [ ] Create review summary helper
- [ ] Create learning summary helper
- [ ] Create daily report command
- [ ] Add script aliases
- [ ] Run report after learning v2
- [ ] Commit

---

# Phase 7: Autopilot Decision Logging

Status: Planned after dashboard

Next:

- [ ] Log every autopilot decision to a decision ledger
- [ ] Store why a type/story mode was selected
- [ ] Store rejected candidate templates
- [ ] Store anti-repeat decisions
- [ ] Store learning score used

---

# Phase 8: Real Production Audio Pack

Status: Planned

Next:

- [ ] Replace generated sine tones with better royalty-free music/SFX
- [ ] Register license/source/public safety
- [ ] Add more story-mode-specific stings
- [ ] Rerender promising old videos with production audio

---

# Immediate Next Build Tasks

1. Create `tools/dashboard/content-summary.js`.
2. Create `tools/dashboard/review-summary.js`.
3. Create `tools/dashboard/learning-summary.js`.
4. Create `tools/dashboard/daily-report.js`.
5. Create `scripts/daily-report.sh`.
6. Create `scripts/dashboard.sh`.
7. Run sync-review and learning-v2 before reporting.
8. Output console report.
9. Output `reports/daily-autopilot-report.md`.
10. Commit.

---

# Current Command Set

Run daily dashboard:

```bash
./scripts/daily-report.sh
```

Alias:

```bash
./scripts/dashboard.sh
```

Run full learning refresh first:

```bash
./scripts/youtube-stats-pull.sh || true
./scripts/learning-v2.sh
./scripts/daily-report.sh
```

Autopilot preview with learning:

```bash
USE_LEARNING_ENGINE=true AUTO_DRY_RUN=true ./scripts/autopilot-preview-once.sh
```

Private upload with learning and public-safe audio:

```bash
USE_LEARNING_ENGINE=true AUDIO_REQUIRE_PUBLIC_SAFE=true AUTO_DRY_RUN=false ./scripts/autopilot-upload-once-private.sh
```

---

# Current Priority

1. Create a single daily report.
2. Make learning/review/audio status easy to understand.
3. Show the latest autopilot decision and learning reason.
4. Then build a decision ledger and richer dashboard.
