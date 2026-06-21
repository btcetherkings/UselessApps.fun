# UselessApps.fun Roadmap

## Mission

UselessApps.fun is an automated viral comedy machine.

It creates tiny useless apps, records them, turns them into ridiculous fake-TV videos, uploads them privately, learns what performs, improves future content, and publishes only approved winners.

> Tiny apps. Zero purpose. Maximum joy.

---

## Current Working Milestone

The automation engine, media intelligence layer, safe-zone foundation, private review workflow, FFmpeg audio mixing, audio validation gate, and production audio asset manifest are working or in progress.

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
- [x] Production audio manifest tooling exists or is being integrated

---

## Current State

The audio system can mix music and SFX, and validation can block test audio from public release.

Current problem:

```text
We still need real production-safe assets and a repeatable way to test that a video using them becomes public-safe.
```

Next build:

```text
production audio asset
→ register metadata
→ require public-safe audio
→ generate private test
→ validate public-safe audio
→ review report shows ready_for_review
```

---

# Active Build: Production Audio Pack Import + Public-Safe Audio Test

Status: Next build

Goal:

Add a production-safe audio test workflow and prepare the project to accept real royalty-free music/SFX assets.

This build should:

- create placeholder production asset folders and docs
- create a production audio import checklist
- add scripts to copy/import music and SFX safely
- add a generated non-test placeholder option for private testing
- force audio engine to prefer only public-safe assets
- run a private preview using public-safe registered assets
- validate audio as public-safe
- show readiness in review reports
- keep test tones blocked for public publishing

Files to create/update:

```text
tools/media/audio-assets.js
tools/media/audio-engine.js
tools/media/audio-report.js
tools/media/audio-validate.js
scripts/audio-assets-refresh.sh
scripts/register-music.sh
scripts/register-sfx.sh
scripts/create-demo-production-audio.sh
scripts/public-safe-audio-preview.sh
assets/music/LICENSES.md
assets/sfx/LICENSES.md
assets/audio-import-checklist.md
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
- [ ] Confirm public-safe production audio allows public publishing

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

- [ ] Store production audio asset IDs in `audioPlan`
- [ ] Store license/public-safety status in processed records
- [ ] Use public-safe assets for final/private review renders

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
- [x] Production manifest system exists or is being integrated

Next:

- [ ] Generate/import production-safe demo assets
- [ ] Register assets with safeForPublic=true
- [ ] Force `AUDIO_REQUIRE_PUBLIC_SAFE=true`
- [ ] Confirm selected assets are public-safe
- [ ] Confirm validation returns `publicSafe=true`

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
- [ ] Mark videos with registered production assets as public-safe

---

# Phase 8: Production Audio Asset Pack

Status: Active

## Production asset rule

A production asset must have:

```text
file exists
license is present
source is present
safeForPublic=true
not detected as test audio
inside assets/music or assets/sfx
```

## Test asset rule

Test assets are allowed for development but must remain public-blocked:

```text
default-test-bed.wav
intro-ding-test.wav
fail-beep-test.wav
test-tone
sine
beep-test
```

## Public-safe preview requirement

Run generation with:

```text
AUDIO_REQUIRE_PUBLIC_SAFE=true
USE_AUDIO_ENGINE=true
USE_BACKGROUND_MUSIC=true
USE_SFX=true
```

Expected result:

```text
audioMix.mode = full_mix
publicSafe = true
warnings = none or non-blocking only
```

Tasks:

- [ ] Add demo production audio generation script
- [ ] Register demo production audio as public-safe
- [ ] Run public-safe audio report
- [ ] Run public-safe preview
- [ ] Validate processed record
- [ ] Upload one private public-safe audio video
- [ ] Confirm review report shows publicSafe=true

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

1. Add `assets/audio-import-checklist.md`.
2. Expand `assets/music/LICENSES.md`.
3. Expand `assets/sfx/LICENSES.md`.
4. Create `scripts/create-demo-production-audio.sh`.
5. Generate demo production-safe music/SFX files.
6. Register them as `safeForPublic=true`.
7. Run `AUDIO_REQUIRE_PUBLIC_SAFE=true ./scripts/audio-report.sh`.
8. Run public-safe audio preview.
9. Run audio validation.
10. Confirm publicSafe=true.
11. Upload one private production-audio test.
12. Commit docs/scripts, decide whether to commit demo audio.

---

# Current Command Set

Create demo production audio:

```bash
./scripts/create-demo-production-audio.sh
```

Refresh audio asset manifest:

```bash
./scripts/audio-assets-refresh.sh
```

Register music:

```bash
./scripts/register-music.sh assets/music/fake-news-bed-01.wav fake-news "self-generated" "ffmpeg-generated-original" true "Generated original simple production demo bed."
```

Register SFX:

```bash
./scripts/register-sfx.sh assets/sfx/alert-beep-01.wav alert "self-generated" "ffmpeg-generated-original" true "Generated original simple production demo SFX."
```

Public-safe audio report:

```bash
AUDIO_REQUIRE_PUBLIC_SAFE=true ./scripts/audio-report.sh
```

Public-safe preview:

```bash
./scripts/public-safe-audio-preview.sh
```

Audio validation:

```bash
./scripts/audio-validate.sh
```

Review private uploads:

```bash
./scripts/review-private.sh
```

---

# Current Priority

1. Add public-safe demo audio workflow.
2. Prove validation can pass with production-safe registered audio.
3. Upload one private public-safe audio test.
4. Then move to review report polish and public publish retest.
