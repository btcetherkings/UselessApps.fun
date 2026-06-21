# UselessApps.fun Roadmap

## Mission

UselessApps.fun is an automated viral comedy machine.

It creates tiny useless apps, records them, turns them into ridiculous fake-TV videos, uploads them privately, learns what performs, improves future content, and publishes only approved winners.

> Tiny apps. Zero purpose. Maximum joy.

---

## Current Working Milestone

The automation engine, media intelligence layer, and safe-zone/audio foundation are working.

Confirmed:

- [x] Static app gallery exists
- [x] `apps.json` exists
- [x] First useless apps exist
- [x] Local video generation works
- [x] YouTube OAuth works
- [x] YouTube private upload works
- [x] YouTube Studio verification works
- [x] `processed-v3.json` tracks uploaded/private videos
- [x] Autopilot selects unpublished apps
- [x] Autopilot creates new apps when the queue is empty
- [x] Autopilot can generate and upload new generated apps
- [x] Autopilot report works
- [x] Story engine exists
- [x] Metadata engine exists
- [x] Quality engine exists
- [x] Learning engine placeholder exists
- [x] Media intelligence report works
- [x] Safe-zone report works
- [x] Music/SFX folders exist
- [x] Final-preview script exists
- [x] Quality/safe-zone/audio foundation committed

Latest status:

```text
Total apps: 10
Uploaded/private: 9
Preview only: 1
Failed: 0
Pending: 0
Autopilot runs: 16

Recent types: rock, button, spinner
Created by autopilot: 3

Next likely action:
There is a preview-only item. Upload it privately before generating another app.
```

Important rule:

```text
If preview-only exists, upload it privately or mark it skipped before creating the next app.
```

---

## Current Problem

The system now reads safe-zone flags and reports safe zones, but `generate-v3.js` still needs to actually enforce them in the scene layout.

Current safe-zone flags:

```text
SAFE_MODE=true
TEXT_DENSITY=low
TICKER_ENABLED=false
FOOTER_ENABLED=false
QUALITY_MODE=preview/final
RENDER_TARGET=shorts
```

Current safe-zone report for 720x1280:

```text
Avoid top: y 0-120
Avoid bottom: y 1000-1280
Avoid right UI area: x 613-720

Main text zone:
x 53-600
y 147-967
```

Next build must make the video renderer obey those zones.

---

# Active Build: Safe-Mode Layout Enforcement

Status: Next build

Goal:

Make `generate-v3.js` obey safe-zone and low-text-density settings.

This build should:

- disable ticker/footer when safe mode is enabled
- reduce stacked text
- keep important captions in safe areas
- make each scene use one main joke/caption
- improve readability on mobile
- keep current upload flow working
- keep dry-run and private upload working

Files to update:

```text
tools/video-generator/generate-v3.js
tools/media/safe-zone-report.js
scripts/final-preview-once.sh
ROADMAP.md
```

New optional files:

```text
scripts/upload-preview-only-private.sh
scripts/open-latest-video.sh
```

---

# Phase 1: Core Site

Status: Completed

- [x] Static gallery
- [x] App pages
- [x] `apps.json` data source
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

# Phase 3: YouTube Upload System

Status: Completed for private testing

- [x] Google Cloud OAuth app created
- [x] Refresh token generated
- [x] YouTube upload scope works
- [x] Channel auth confirmed
- [x] Private upload from generator successful
- [x] YouTube Studio verification complete

Next:

- [ ] Keep uploads private until layout and quality are fixed
- [ ] Add metadata review
- [ ] Add approval command to publish private videos later
- [ ] Add YouTube Analytics integration

---

# Phase 4: Autopilot Content Engine

Status: Working

Working:

- [x] Read `apps.json`
- [x] Read `processed-v3.json`
- [x] Select next unpublished app
- [x] Skip uploaded apps
- [x] Create new useless app if queue is empty
- [x] Add new app to `apps.json`
- [x] Start local recording server
- [x] Run `generate-v3.js`
- [x] Upload privately or dry-run depending on env
- [x] Write `autopilot-state.json`
- [x] Autopilot report works

Current queue issue:

- [x] Preview-only detection works
- [ ] Upload current preview-only item privately
- [ ] Then resume queue-empty generation

---

# Phase 5: Generator Intelligence Integration

Status: Working

Working:

- [x] Story engine exists
- [x] Metadata engine exists
- [x] Quality engine exists
- [x] Generator flags exist:
  - `USE_STORY_ENGINE`
  - `USE_METADATA_ENGINE`
  - `USE_QUALITY_ENGINE`
- [x] `storyPackage is not defined` scope bug fixed
- [x] Failed processed entry cleanup works

Next:

- [ ] Confirm every new result stores `storyPackage`
- [ ] Confirm every new result stores `metadataPackage`
- [ ] Confirm every new result stores `qualityPlan`
- [ ] Confirm YouTube title/description uses metadata package
- [ ] Add script-hash repetition checks

---

# Phase 6: Quality Engine

Status: Foundation complete, enforcement in progress

Working:

- [x] Quality profiles exist
- [x] Preview mode exists
- [x] Final mode exists
- [x] Web mode exists
- [x] Square mode exists
- [x] Music/SFX directory scan works
- [x] Media intelligence report shows music/SFX counts
- [x] Safe-zone report works
- [x] Final preview script exists

Next:

- [ ] Use quality profile for actual output size/FPS/encoding
- [ ] Add final render command that forces 1080x1920
- [ ] Add optional 16:9 web render
- [ ] Add optional square render
- [ ] Add real music files
- [ ] Add real SFX files
- [ ] Add audio normalization
- [ ] Add music ducking

---

# Phase 7: Safe-Zone Layout Enforcement

Status: Next active technical fix

Design rule:

```text
One scene = one main joke.
No scene should have ticker + footer + lower caption + CTA competing.
```

Tasks:

- [ ] Add layout helper functions inside `generate-v3.js`
- [ ] Add `safeY()` helper
- [ ] Add `safeX()` helper
- [ ] Add safe headline zone
- [ ] Add safe punchline zone
- [ ] Add safe CTA zone
- [ ] Disable ticker if `TICKER_ENABLED=false`
- [ ] Disable footer if `FOOTER_ENABLED=false`
- [ ] Disable lowerLine2/lowerLine3 if `TEXT_DENSITY=low`
- [ ] Keep evidence clip app footage clear
- [ ] Keep CTA above YouTube bottom UI
- [ ] Test with 720x1280 preview
- [ ] Test with 1080x1920 final preview
- [ ] Upload one private safe-mode final test

Safe placements for 720x1280:

```text
Headline y: 147
App frame y: 260
Punchline y: 813
CTA y: 933
Max bottom text y: 967
```

Safe placements for 1080x1920:

```text
Headline y: 220
App frame y: 390
Punchline y: 1220
CTA y: 1400
Max bottom text y: 1450
```

---

# Phase 8: Audio and Music Foundation

Status: Folder foundation complete

Folders:

```text
assets/music/
assets/sfx/
```

Working:

- [x] `assets/music/README.md`
- [x] `assets/sfx/README.md`

Next:

- [ ] Add real background music
- [ ] Add real SFX
- [ ] Add music manifest
- [ ] Add SFX manifest
- [ ] Add music rotation
- [ ] Add SFX by scene type
- [ ] Add music ducking
- [ ] Add audio normalization
- [ ] Add final loudness target

Suggested env defaults:

```text
USE_SYNTH_MUSIC=true
MUSIC_VOLUME=0.035
CHAOS_SFX_VOLUME=0.09
NARRATION_VOLUME=1.25
```

---

# Phase 9: SEO / GEO / Algorithm Packaging Engine

Status: Created, partially integrated

Working:

- [x] YouTube metadata package exists
- [x] TikTok caption package exists
- [x] Instagram/Facebook Reels caption package exists
- [x] Rumble package exists
- [x] X/Twitter post exists
- [x] AI-readable summary exists
- [x] Pinned comment exists

Next:

- [ ] Confirm metadata package is used in real YouTube upload
- [ ] Store metadata package in `processed-v3.json`
- [ ] Add metadata ledger
- [ ] Add title repetition detection
- [ ] Add hashtag rotation
- [ ] Add platform metadata export files

---

# Phase 10: Analytics and Learning Engine

Status: Placeholder created

Working:

- [x] Performance DB exists
- [x] Learning report reads uploaded videos
- [x] Scoring function exists
- [x] Media intelligence report shows uploaded count

Next:

- [ ] Add YouTube Analytics API pull
- [ ] Import YouTube video stats
- [ ] Store stats by video ID
- [ ] Score videos
- [ ] Recommend best app types
- [ ] Recommend best story modes
- [ ] Recommend best title patterns
- [ ] Feed recommendations into autopilot

---

# Phase 11: Multi-Platform Render Engine

Status: Planned

Do not upload the exact same video twice to the same platform as mobile/web.

Instead generate proper platform variants:

```text
9:16 vertical short
16:9 horizontal web/standard video
1:1 square social feed
thumbnail frame
preview GIF
```

Tasks:

- [ ] Add `RENDER_TARGET=shorts/web/square/all`
- [ ] Add `platform-renders/`
- [ ] Store render variants in ledger
- [ ] Upload correct variant to each platform
- [ ] Avoid duplicate same-platform uploads unless meaningfully different

---

# Phase 12: Publish Approval System

Status: Required before public publishing

Files to add:

```text
tools/publish/list-private.js
tools/publish/approve.js
tools/publish/publish-youtube.js
```

Workflow:

```text
autopilot uploads private
→ review quality/story/metadata
→ approve
→ publish script changes privacy to public/unlisted
→ ledger records publishedAt
```

Tasks:

- [ ] List private uploaded videos
- [ ] Show metadata
- [ ] Show local file
- [ ] Show YouTube URL
- [ ] Mark approved
- [ ] Publish to public
- [ ] Mark rejected
- [ ] Mark needs re-render
- [ ] Keep audit log

---

# Immediate Next Build Tasks

1. Upload current preview-only item privately.
2. Add helper script for uploading preview-only queue item.
3. Patch safe-mode layout flags in `generate-v3.js`.
4. Add low-density text rules.
5. Disable ticker/footer in scene generation when env says false.
6. Add latest-video opener script.
7. Run fast safe preview.
8. Run final safe preview.
9. Upload one final safe private test.
10. Update report and commit.

---

# Current Command Set

Upload preview-only item privately:

```bash
AUTO_DRY_RUN=false ./scripts/autopilot-upload-once-private.sh
```

Autopilot report:

```bash
./scripts/autopilot-report.sh
```

Media intelligence report:

```bash
./scripts/media-intelligence-report.sh
```

Safe-zone report:

```bash
./scripts/safe-zone-report.sh
```

Fast safe preview:

```bash
USE_STORY_ENGINE=true USE_METADATA_ENGINE=true USE_QUALITY_ENGINE=true SAFE_MODE=true TEXT_DENSITY=low TICKER_ENABLED=false FOOTER_ENABLED=false ./scripts/autopilot-preview-once.sh
```

Final safe preview:

```bash
./scripts/final-preview-once.sh
```

---

# Current Priority

1. Upload preview-only item privately.
2. Enforce safe-mode layout in generator.
3. Verify readable 720x1280 preview.
4. Verify readable 1080x1920 final preview.
5. Upload one private final-quality test.
6. Then start YouTube analytics pull.
