# UselessApps.fun Roadmap

## Mission

UselessApps.fun is an automated viral comedy machine.

It creates tiny useless apps, records them, turns them into ridiculous fake-TV videos, uploads them privately, learns what performs, improves future content, and publishes only approved winners.

> Tiny apps. Zero purpose. Maximum joy.

---

## Current Working Milestone

The generation, audio, private upload, review, sync, approval, preflight, publish workflow, learning recommendations v2, learning reason persistence, and basic dashboard are working.

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
- [x] `learningReason` persists
- [x] Basic daily dashboard exists

---

## Current State

The dashboard/reporting is working, but it is still too basic.

Current problem:

```text
The report tells us totals, but not enough operational detail.
It needs ranked tables, action cards, blockers, per-video recommendations, scoring, and richer learning insight.
```

Next build:

```text
basic dashboard
→ detailed executive report
→ per-video action plan
→ learning decision analysis
→ health scoring
→ markdown + JSON report
```

---

# Active Build: Detailed Reporting v2

Status: Next build

Goal:

Upgrade the dashboard into a proper operator report.

This build should answer:

```text
What happened?
What is safe?
What is blocked?
What should be approved?
What should be rerendered?
What is the bot learning?
Which story/audio/app patterns are winning?
Which videos are wasting space?
What is the next best action?
```

Files to create/update:

```text
tools/dashboard/report-v2.js
tools/dashboard/report-utils.js
tools/dashboard/daily-report.js
scripts/daily-report-v2.sh
scripts/dashboard.sh
reports/daily-autopilot-report.md
reports/daily-autopilot-report.json
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

# Phase 2: Generation + Upload

Status: Working

- [x] App generation
- [x] Recording
- [x] FFmpeg render
- [x] Narration
- [x] Audio mix
- [x] Private upload
- [x] Dry-run preview
- [x] Public-safe audio mode

---

# Phase 3: Review + Publish

Status: Working

- [x] Review DB
- [x] Review sync
- [x] Audio validation
- [x] Approval flow
- [x] Publish preflight
- [x] Unlisted/public gate

Next:

- [ ] Show approval queue as detailed cards
- [ ] Show publish queue as detailed cards
- [ ] Show blocked videos with exact fix
- [ ] Show old videos needing rerender with audio

---

# Phase 4: Analytics + Learning

Status: Working

- [x] YouTube stats pull exists
- [x] Learning v2 exists
- [x] Recommendations v2 exists
- [x] Learning reason persists

Next:

- [ ] Show ranked app types
- [ ] Show ranked story modes
- [ ] Show ranked audio moods
- [ ] Show top/worst videos
- [ ] Show score formula explanation
- [ ] Show latest autopilot decision and why
- [ ] Show confidence level based on data quality

---

# Phase 5: Detailed Reporting v2

Status: Next active build

## Report outputs

Console:

```text
UselessApps.fun Operator Report v2
```

Markdown:

```text
reports/daily-autopilot-report.md
```

JSON:

```text
reports/daily-autopilot-report.json
```

## New sections

The detailed report should include:

```text
1. Executive summary
2. System health score
3. Content inventory
4. Upload/publish funnel
5. Review queue action cards
6. Audio safety breakdown
7. Public publishing blockers
8. Learning recommendations v2
9. Top/worst videos
10. Latest autopilot decision
11. Next 10 actions
12. Rerender candidates
13. Data quality warnings
```

## Health score

Example:

```text
System health: 78/100
```

Score components:

```text
+20 if generation works
+15 if uploads exist
+15 if review sync works
+15 if audio validation exists
+15 if public-safe video exists
+10 if learning v2 exists
+10 if latest app has learningReason
-20 if failed records exist
-10 if no public-safe videos exist
-10 if many videos blocked
```

## Action cards

Each action card should show:

```text
ACTION: APPROVE_FOR_UNLISTED
Video: Corporate Regret Board
Why: publicSafe=true, private_uploaded, production music
Command: ./scripts/approve-video.sh Nx2Ek9u165c "Approved for unlisted test"
Next: ./scripts/publish-approved.sh Nx2Ek9u165c unlisted
```

## Blocker cards

Each blocker card should show:

```text
BLOCKED: Runaway Button
Reason: audio_missing
Fix: rerender with AUDIO_REQUIRE_PUBLIC_SAFE=true
Command: FORCE=true TARGET_APP="apps/runaway-button.html" ...
```

## Learning confidence

Confidence levels:

```text
low: fewer than 5 videos with stats
medium: 5-25 videos
high: 25+ videos with meaningful views
```

For now, likely confidence is low because most stats are zero.

Tasks:

- [ ] Create `tools/dashboard/report-utils.js`
- [ ] Create `tools/dashboard/report-v2.js`
- [ ] Add JSON report output
- [ ] Add markdown table helpers
- [ ] Add health score
- [ ] Add action cards
- [ ] Add blocker cards
- [ ] Add learning confidence
- [ ] Add rerender candidates
- [ ] Patch dashboard script to use v2
- [ ] Commit

---

# Phase 6: Rerender Candidates

Status: Planned inside report v2

Rerender candidate conditions:

```text
audio_missing
not public-safe
old uploaded video without audioMix
strong idea but weak technical quality
published_private but blocked_for_public
```

The report should suggest:

```text
rerender with production-safe audio
private upload only
then review again
```

---

# Phase 7: Operator Commands

Status: Planned inside report v2

The report should print commands for:

```text
sync review
run learning
preview next idea
upload next private
approve video
publish unlisted
rerender old video
```

---

# Immediate Next Build Tasks

1. Create `tools/dashboard/report-utils.js`.
2. Create `tools/dashboard/report-v2.js`.
3. Add markdown + JSON output.
4. Add health scoring.
5. Add action cards.
6. Add blocker/rerender cards.
7. Add learning insight section.
8. Add data quality warnings.
9. Create `scripts/daily-report-v2.sh`.
10. Patch `scripts/dashboard.sh` to call v2.
11. Run report.
12. Commit.

---

# Current Command Set

Detailed dashboard:

```bash
./scripts/daily-report-v2.sh
```

Alias:

```bash
./scripts/dashboard.sh
```

Refresh learning and dashboard:

```bash
./scripts/youtube-stats-pull.sh || true
./scripts/learning-v2.sh
./scripts/daily-report-v2.sh
```

Open markdown report:

```bash
cat reports/daily-autopilot-report.md
```

Open JSON report:

```bash
cat reports/daily-autopilot-report.json
```

---

# Current Priority

1. Make reports operationally useful.
2. Show exactly what to approve/rerender/publish.
3. Show why the bot is choosing ideas.
4. Then build an autopilot decision ledger.
