# UselessApps.fun Roadmap

## Mission

UselessApps.fun is an automated viral comedy machine.

It creates tiny useless apps, records them, turns them into ridiculous fake-TV YouTube Shorts, uploads them to YouTube, tracks what has been published, and creates new content when the upload queue runs out.

> Tiny apps. Zero purpose. Maximum joy.

---

## Current Major Milestone

The YouTube upload pipeline works.

Confirmed successful uploads include:

```text
Runaway Button
https://youtu.be/zx5y4y-2CpY

Staring Pet Rock
https://youtu.be/nT6qA1pNWmU

Useless To-Do List
https://youtu.be/LgOrHXpLt8E

Unhelpful Calculator
https://youtu.be/9ev-3qhQkSs

Endless Loading Spinner
https://youtu.be/MsadFVnCvIs

The Government Calculator
https://youtu.be/roo3gALgBDA

Emotionally Unhelpful Calculator
https://youtu.be/gYpcgNaw5W0
```

This proves:

```text
App creation / app selection
→ local recording
→ video generation
→ YouTube OAuth
→ YouTube upload
→ YouTube Studio verification
→ processed-v3.json tracking
```

The project has moved from prototype to an automated content pipeline.

---

## Current Problem

The autopilot works, but the content generator is still too random and can produce similar apps, such as multiple calculator-style apps.

Current state from the latest report:

```text
Total apps: 7
Uploaded/private: 7
Preview only: 0
Failed: 0
Pending: 0
Autopilot runs: 8
```

This means the queue is empty.

The next autopilot run should create a new useless app automatically. However, the current idea generator can still repeat the same type/theme because it has no strong anti-repeat memory.

---

## New Build Direction

The next build must turn the autopilot into a proper content engine.

It needs:

- a content ledger
- anti-repeat logic
- app type rotation
- generated content history
- upload queue awareness
- daily run safety
- clear reporting
- public publishing gate
- layout safe mode

The system should not just upload files. It should behave like a content producer.

---

## Core Automation Principle

The system must not rely on manual app picking.

Correct behaviour:

```text
read apps.json
→ read processed-v3.json
→ read content-ledger.json
→ find pending app
→ if pending app exists, generate/upload it
→ if no pending app exists, create a new app
→ avoid repeating recent app types
→ add new app to apps.json
→ generate/upload video
→ record output in processed-v3.json
→ record content decision in content-ledger.json
→ produce report
→ wait for next scheduled run
```

Manual `FORCE=true` is only for debugging.

Production autopilot must use:

```text
FORCE=false
AUTO_DRY_RUN=false
AUTO_VIDEO_PRIVACY=private
```

---

## Phase 1: Core Site

Status: Completed

- [x] Static gallery
- [x] App pages
- [x] apps.json data source
- [x] GitHub Pages deployment
- [x] Basic styling
- [x] Uselessness scores

---

## Phase 2: Basic Video Automation

Status: Completed

- [x] Playwright recording
- [x] FFmpeg Shorts formatting
- [x] Intro/outro cards
- [x] Google TTS narration
- [x] Dry-run generation
- [x] processed.json tracking
- [x] Retry failed apps
- [x] MAX_PER_RUN support
- [x] FORCE mode support

---

## Phase 3: Ridiculous Brain

Status: Completed

File:

```text
tools/video-generator/useless-brain.js
```

Completed:

- [x] Fake ML scoring: UselessNet
- [x] Fake sentience measurement
- [x] Fake expert panel
- [x] Fake news ticker
- [x] Fake certificate generator
- [x] Viral titles
- [x] Video descriptions
- [x] Fake dashboard overlay
- [x] App-specific action scripts

Next:

- [ ] Add stronger per-app narration templates
- [ ] Add app-specific scene packs
- [ ] Add different voice styles where possible
- [ ] Add local audio effects by app type
- [ ] Add title uniqueness scoring
- [ ] Add joke duplication checks

---

## Phase 4: V3 Ridiculousness Machine

Status: Working, needs layout/content polish

File:

```text
tools/video-generator/generate-v3.js
```

Scenes:

- [x] Breaking useless news
- [x] Emergency sirens card
- [x] Official uselessness investigation
- [x] Live app evidence clip
- [x] Fake courtroom charge
- [x] Fake sponsor break
- [x] Certificate of absolute pointlessness
- [x] Outro CTA

Technical:

- [x] Default 720x1280 local render
- [x] Optional 1080x1920 final render
- [x] No heavy blur by default
- [x] Synthetic background music
- [x] Chaos SFX
- [x] FFmpeg percent warning fixed with drawtext expansion=none
- [x] YouTube upload supported
- [x] RECORD_BASE_URL support
- [x] PUBLIC_BASE_URL support
- [x] Local recording server support through autopilot

Known issues:

- [ ] Too much text on some scenes
- [ ] Double text/overlap in evidence clip
- [ ] Ticker competes with footer text
- [ ] Need one main joke caption at a time
- [ ] Need YouTube Shorts safe-zone redesign
- [ ] Same Google TTS voice used for all videos

---

## Phase 5: YouTube Upload System

Status: Completed for private testing

Files:

```text
.env
tools/youtube/get-refresh-token.js
tools/youtube/test-youtube-auth.js
tools/youtube/upload-existing-video.js
```

Completed:

- [x] Google Cloud OAuth app created
- [x] Test user issue solved
- [x] Refresh token generated
- [x] youtube.upload scope added
- [x] youtube.readonly scope added
- [x] Channel auth confirmed
- [x] Channel found: UselessApps
- [x] Channel linked and eligible for long uploads
- [x] Private upload from generator successful
- [x] YouTube Studio verification complete

Next:

- [ ] Keep uploads private until layout is fixed
- [ ] Add upload report
- [ ] Add title/description review before public publishing
- [ ] Add approval command to change private to public/unlisted later

---

## Phase 6: Autopilot Content Engine

Status: Working, now being upgraded

File:

```text
tools/autopilot/useless-autopilot.js
```

Working:

- [x] Read apps.json
- [x] Read processed-v3.json
- [x] Select next unpublished app
- [x] Skip uploaded apps
- [x] Create new useless app if queue is empty
- [x] Add new app to apps.json
- [x] Start local recording server
- [x] Run generate-v3.js
- [x] Upload privately or dry-run depending on env
- [x] Write autopilot-state.json
- [x] Verify local autogenerated app recording works
- [x] Verify uploaded/private tracking works

Problem found:

- [x] Repetition risk identified
- [ ] Content type rotation not yet strong enough
- [ ] Calculator-type apps can repeat
- [ ] No content-ledger.json yet
- [ ] No recent-type avoidance yet
- [ ] No daily production report yet

Next build:

- [ ] Add content-ledger.json
- [ ] Add recent template/type avoidance
- [ ] Add banned recent names check
- [ ] Add queue-empty generation test command
- [ ] Add autopilot report with next action
- [ ] Add run limit safety
- [ ] Add failed-run handling
- [ ] Add automatic Git commit/push option for new apps
- [ ] Add public publishing approval stage

---

## Phase 7: Content Ledger

Status: Next active build

New file:

```text
tools/autopilot/content-ledger.json
```

Purpose:

Track generated content decisions, not just video uploads.

It should record:

- app name
- slug
- app type
- source template
- file path
- generatedAt
- previewedAt
- uploadedAt
- YouTube video ID
- YouTube URL
- privacy status
- title used
- recent type history
- failure count
- whether public approval is pending

This prevents the system from making the same kind of app repeatedly.

Required behaviour:

```text
If last 3 generated apps include calculator,
do not generate calculator again.

If all templates recently used,
choose the least recently used type.

If name already exists,
generate a new name.

If app was preview-only,
do not create a new app until that app is uploaded or marked skipped.
```

---

## Phase 8: Production Workflow

Status: In progress

Correct workflow:

```text
Autopilot selects or creates app
→ generates video
→ uploads private
→ records result
→ human reviews
→ public publish only after approval
```

Important rule:

```text
Private first. Public only after review.
```

Needed:

- [ ] Review dashboard/report
- [ ] Private upload list
- [ ] Publish approval command
- [ ] Metadata improvement command
- [ ] Failed upload retry command
- [ ] Public/unlisted update script

---

## Phase 9: YouTube Shorts Layout Fix

Priority: Highest after autopilot content ledger

Goal:

Make videos readable on phones and avoid YouTube UI covering text.

Tasks:

- [ ] Add SAFE_MODE=true
- [ ] Add TICKER_ENABLED=false
- [ ] Add FOOTER_ENABLED=false
- [ ] Add TEXT_DENSITY=low/medium/chaos
- [ ] Remove duplicate lower caption stack
- [ ] Use one big punchline caption at a time
- [ ] Move CTA above YouTube UI
- [ ] Keep important text between y=220 and y=1500 on 1080x1920
- [ ] Keep app footage clear and central
- [ ] Create safe-zone test render
- [ ] Re-upload private test version

Design rule:

```text
One scene = one main joke.
No scene should have five competing text boxes.
```

---

## Phase 10: Per-App Comedy Modes

Priority: High

Each app should feel like its own ridiculous mini-show.

### Button Apps

- [ ] Fake police chase
- [ ] Cursor bodycam
- [ ] Wanted poster
- [ ] Failed arrest report
- [ ] Do not approach the button warning

### Rock / Object Apps

- [ ] Fake wildlife documentary
- [ ] Object refuses interview
- [ ] Awkward silence counter
- [ ] Expert loses staring contest
- [ ] Emotional support certificate

### To-Do / Productivity Apps

- [ ] Productivity audit
- [ ] Corporate meltdown
- [ ] Efficiency destroyed report
- [ ] CEO resignation joke
- [ ] Task deletion emergency

### Calculator / Maths Apps

- [ ] Maths emergency
- [ ] Numbers union strike
- [ ] 2+2 under review
- [ ] Calculator courtroom testimony
- [ ] Government-classified answer

### Spinner / Waiting Apps

- [ ] Existential horror documentary
- [ ] Time dilation warning
- [ ] Still loading since 2023
- [ ] Fake spiritual awakening
- [ ] Loading support group

---

## Phase 11: Content Scale

Priority: Medium

Tasks:

- [ ] Generate all current apps privately
- [ ] Select best video
- [ ] Publish first public Short
- [ ] Track views/retention
- [ ] Improve hook based on retention
- [ ] Publish 1 Short per day
- [ ] Add 10 more useless apps
- [ ] Build weekly compilation

Current uploaded/private queue:

- [x] Runaway Button
- [x] Staring Pet Rock
- [x] Useless To-Do List
- [x] Unhelpful Calculator
- [x] Endless Loading Spinner
- [x] The Government Calculator
- [x] Emotionally Unhelpful Calculator

---

## Phase 12: Viral Loop

Priority: Medium

Goal:

Turn viewers into idea submitters.

Tasks:

- [ ] Submit your worst app idea form
- [ ] Store submissions
- [ ] Credit submitter
- [ ] Generate app from idea
- [ ] Generate video from app
- [ ] Publish as Short
- [ ] Add leaderboard
- [ ] Add voting

Loop:

```text
Viewer watches stupid video
→ submits worse idea
→ app/video gets made
→ viewer gets credited
→ viewer shares
→ more submissions
```

---

## Phase 13: Scheduled Operation

Status: Planned

Goal:

Run the machine automatically.

Cron target:

```cron
0 10 * * * cd /home/uadmin/useless-apps-fun && /home/uadmin/useless-apps-fun/scripts/autopilot-upload-once-private.sh >> /home/uadmin/useless-apps-fun/tools/autopilot/cron.log 2>&1
```

Before enabling cron:

- [ ] Content ledger works
- [ ] Repetition protection works
- [ ] Queue-empty generation works
- [ ] Private upload works reliably
- [ ] Safe-zone layout acceptable
- [ ] Logs are readable
- [ ] Failures do not create infinite loops

---

## Immediate Next Build

Build content-ledger and anti-repeat autopilot.

Tasks:

1. Create `tools/autopilot/content-ledger.json`.
2. Update `tools/autopilot/useless-autopilot.js`.
3. Add app type rotation.
4. Avoid last 3 generated types.
5. Improve report to show next action.
6. Run autopilot with empty queue.
7. Confirm it creates a new non-calculator app.
8. Upload that new app privately.
9. Confirm report shows no pending apps.
10. Then move to Shorts safe-zone layout fix.

---

## Current Command Set

Report:

```bash
./scripts/autopilot-report.sh
```

Preview next app or create one if queue is empty:

```bash
./scripts/autopilot-preview-once.sh
```

Upload next app privately or create one if queue is empty:

```bash
./scripts/autopilot-upload-once-private.sh
```

Check generated videos:

```bash
ls -lh generated-videos/*-v3.mp4
```

Check processed status:

```bash
cat tools/video-generator/processed-v3.json
```

Check autopilot state:

```bash
cat tools/autopilot/autopilot-state.json
```

Check future content ledger:

```bash
cat tools/autopilot/content-ledger.json
```

---

## Current Priority

1. Add content-ledger anti-repeat engine.
2. Confirm next queue-empty run creates a fresh non-repeated app type.
3. Upload it privately.
4. Fix Shorts visual safe-zone.
5. Create public publishing approval script.


