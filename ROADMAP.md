# UselessApps.fun Roadmap

## Mission

UselessApps.fun is an automated viral comedy machine.

It creates tiny useless apps, records them, turns them into ridiculous fake-TV videos, uploads them privately, learns what performs, improves future content, and publishes only approved winners.

> Tiny apps. Zero purpose. Maximum joy.

---

## Current Working Milestone

The automation engine, media intelligence layer, safe-zone foundation, private review workflow, FFmpeg audio mixing, and audio validation gate are now working or in progress.

Confirmed:

- [x] Static app gallery exists
- [x] `apps.json` exists
- [x] Local video generation works
- [x] YouTube OAuth upload works
- [x] YouTube private upload works
- [x] Private uploaded videos are tracked
- [x] Autopilot creates apps when queue is empty
- [x] Autopilot report works
- [x] Story engine exists
- [x] Metadata engine exists
- [x] Quality engine exists
- [x] Safe-zone report works
- [x] Safe playback helper works
- [x] Safe-mode text clutter reduction works
- [x] YouTube stats pull script exists
- [x] Analytics report script exists
- [x] Recommendations generator exists or is being integrated
- [x] Private review DB exists or is being integrated
- [x] Approve/reject/needs-rerender commands exist or are being integrated
- [x] Audio engine exists
- [x] Audio report exists
- [x] Audio manifest exists
- [x] `audioPlan` can be generated and stored
- [x] FFmpeg audio mix works
- [x] `audioMix.mode = full_mix` confirmed
- [x] Audio validation can flag test audio
- [x] Publish safety can block public release when audio is not public-safe

---

## Current State

The project can technically mix audio, but the current working audio files are generated test tones.

Current problem:

```text
The audio system works, but we need a safe production asset pipeline:
real royalty-free music/SFX, license notes, metadata, validation, and import commands.
```

Next build:

```text
real audio files
→ production manifest
→ validation
→ safe public-ready audio mix
```

---

# Active Build: Production Audio Asset Pack Support

Status: Next build

Goal:

Create a controlled asset system for real background music and SFX.

This build should:

- define production audio asset naming rules
- create production asset manifest structure
- add manifest builder/updater
- add license metadata fields
- separate test audio from production audio
- validate public-safe audio assets
- make audio engine prefer public-safe production assets
- keep test tones usable for development only
- add scripts to register new music/SFX
- update audio reports with license/public-safety info

Files to create/update:

```text
tools/media/audio-assets.js
tools/media/audio-engine.js
tools/media/audio-report.js
tools/media/audio-validate.js
tools/media/audio-manifest.json
assets/music/LICENSES.md
assets/sfx/LICENSES.md
assets/test-audio/README.md
scripts/audio-assets-refresh.sh
scripts/register-music.sh
scripts/register-sfx.sh
ROADMAP.md
```

Folders:

```text
assets/music/
assets/sfx/
assets/test-audio/
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
- [x] `FORCE` mode support

---

# Phase 3: YouTube Upload + Publish Workflow

Status: Private upload working, publish approval in progress

Working:

- [x] OAuth upload works
- [x] Private upload works
- [x] Review approval command works
- [x] Publish script exists
- [x] Audio validation can block unsafe public publishing

Next:

- [ ] Refresh OAuth token with `https://www.googleapis.com/auth/youtube`
- [ ] Confirm `videos.update` can change privacy to unlisted
- [ ] Confirm review DB status becomes `published_unlisted`
- [ ] Public publishing only with `ALLOW_PUBLIC_PUBLISH=true`
- [ ] Block public publish if test-tone audio is detected

---

# Phase 4: Autopilot Content Engine

Status: Working

Working:

- [x] Read `apps.json`
- [x] Read `processed-v3.json`
- [x] Select unpublished apps
- [x] Skip uploaded apps
- [x] Create new useless apps when queue is empty
- [x] Upload privately or dry-run depending on env
- [x] Autopilot report works
- [x] Preview-only detection works

Next:

- [ ] Store audio asset IDs in content ledger
- [ ] Track production audio use against performance
- [ ] Preserve learning-aware selection
- [ ] Preserve anti-repeat rules

---

# Phase 5: Generator Intelligence Integration

Status: Working

Working:

- [x] Story engine exists
- [x] Metadata engine exists
- [x] Quality engine exists
- [x] Audio engine exists
- [x] Generator flags exist
- [x] Safe-mode text clutter reduction works
- [x] `audioPlan` exists
- [x] `audioMix` exists
- [x] Full mix confirmed

Next:

- [ ] Use production manifest metadata in audio plan
- [ ] Store audio asset IDs in processed records
- [ ] Store audio license/public-safety metadata in processed records

---

# Phase 6: Audio Engine

Status: Full technical mix working

Working:

- [x] `tools/media/audio-engine.js`
- [x] `tools/media/audio-report.js`
- [x] `tools/media/audio-manifest.json`
- [x] `scripts/audio-report.sh`
- [x] Audio file scan
- [x] Story-mode mood mapping
- [x] SFX tag mapping
- [x] Graceful fallback when no audio assets exist
- [x] `audioPlan` generation
- [x] FFmpeg music mix
- [x] FFmpeg SFX mix
- [x] `audioMix.mode = full_mix` confirmed

Next:

- [ ] Replace generated test tones with proper royalty-free assets
- [ ] Move test tones to `assets/test-audio/`
- [ ] Add production asset manifest metadata
- [ ] Add public-safe asset validation
- [ ] Prefer production assets over test assets

---

# Phase 7: Audio Review + Asset Validation

Status: In progress

Working:

- [x] Test audio can be detected
- [x] Audio readiness can be reported
- [x] Public-safe flag exists
- [x] Publish flow can block public publishing if audio is unsafe

Next:

- [ ] Validate production manifest entries
- [ ] Validate missing license fields
- [ ] Validate assets not marked safe by accident
- [ ] Show audio asset IDs in review report
- [ ] Mark videos with test assets as not public-safe

---

# Phase 8: Production Audio Asset Pack

Status: Next active build

## Asset types

Music:

```text
background loop
fake-news bed
documentary bed
corporate bed
mystery bed
emergency bed
chaotic comedy bed
```

SFX:

```text
intro sting
outro sting
alert beep
whoosh
fail buzzer
ding
glitch
gavel
typing
static
loading hum
applause
record scratch
```

## Naming rules

Music:

```text
assets/music/<mood>-<description>-<number>.<ext>
```

Examples:

```text
assets/music/fake-news-bed-01.mp3
assets/music/documentary-bed-01.mp3
assets/music/chaotic-comedy-bed-01.mp3
```

SFX:

```text
assets/sfx/<tag>-<description>-<number>.<ext>
```

Examples:

```text
assets/sfx/alert-beep-01.wav
assets/sfx/whoosh-fast-01.wav
assets/sfx/gavel-hit-01.wav
```

Test assets:

```text
assets/test-audio/default-test-bed.wav
assets/test-audio/intro-ding-test.wav
assets/test-audio/fail-beep-test.wav
```

## Manifest item shape

```json
{
  "id": "music_fake_news_bed_01",
  "kind": "music",
  "file": "assets/music/fake-news-bed-01.mp3",
  "mood": "fake-news",
  "tags": ["fake-news", "background", "loop"],
  "license": "royalty-free",
  "source": "manual",
  "safeForPublic": true,
  "notes": "Owned or royalty-free asset."
}
```

## Validation rules

Production asset is public-safe only if:

```text
safeForPublic = true
license is not empty
source is not empty
file exists
file is not test audio
file is inside assets/music or assets/sfx
```

Tasks:

- [ ] Create `tools/media/audio-assets.js`
- [ ] Create manifest refresh command
- [ ] Create register music command
- [ ] Create register SFX command
- [ ] Update audio engine to read manifest metadata
- [ ] Update audio validation to check manifest public safety
- [ ] Update audio report to show production readiness
- [ ] Move or ignore test assets separately
- [ ] Add license docs
- [ ] Add example manifest entries

---

# Phase 9: Review + Publish Approval

Status: In progress

Next:

- [ ] Show audio asset IDs in review report
- [ ] Show license/public-safety status
- [ ] Reject public publish if production asset validation fails
- [ ] Mark bad audio as `needs_rerender`
- [ ] Publish unlisted first

---

# Phase 10: YouTube Analytics + Learning Engine

Status: In progress

Next:

- [ ] Track audio mood performance
- [ ] Track SFX tag performance
- [ ] Learn which music/SFX styles perform best
- [ ] Recommend audio mood by story mode

---

# Phase 11: Multi-Platform Render Engine

Status: Planned

Variants:

```text
9:16 vertical short
16:9 horizontal web video
1:1 square social feed
thumbnail frame
preview GIF
```

Next:

- [ ] Store render variants in ledger
- [ ] Upload correct variant to each platform
- [ ] Keep audio mix consistent across variants
- [ ] Avoid duplicate same-platform uploads unless meaningfully different

---

# Immediate Next Build Tasks

1. Create `tools/media/audio-assets.js`.
2. Create `scripts/audio-assets-refresh.sh`.
3. Create `scripts/register-music.sh`.
4. Create `scripts/register-sfx.sh`.
5. Add `assets/test-audio/README.md`.
6. Add/expand `assets/music/LICENSES.md`.
7. Add/expand `assets/sfx/LICENSES.md`.
8. Update `audio-engine.js` to include manifest metadata.
9. Update `audio-report.js` to show public-safe status.
10. Update `audio-validate.js` to use manifest public-safety.
11. Run audio asset refresh.
12. Run audio report and validation.
13. Commit production audio asset support.

---

# Current Command Set

Refresh audio asset manifest:

```bash
./scripts/audio-assets-refresh.sh
```

Register music:

```bash
./scripts/register-music.sh assets/music/fake-news-bed-01.mp3 fake-news "royalty-free" "manual" true
```

Register SFX:

```bash
./scripts/register-sfx.sh assets/sfx/alert-beep-01.wav alert "royalty-free" "manual" true
```

Audio report:

```bash
./scripts/audio-report.sh
```

Audio validation:

```bash
./scripts/audio-validate.sh
```

Preview full mix:

```bash
USE_AUDIO_ENGINE=true USE_BACKGROUND_MUSIC=true USE_SFX=true AUTO_DRY_RUN=true ./scripts/autopilot-preview-once.sh
```

---

# Current Priority

1. Add production audio asset manifest tooling.
2. Keep test audio separate and public-blocked.
3. Prepare real royalty-free music/SFX import.
4. Make audio reports show public safety.
5. Use production-safe audio before public publishing.
