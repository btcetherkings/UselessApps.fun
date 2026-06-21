# UselessApps.fun MASTER ROADMAP

## Current Position

Latest pushed build:

```text
27514a6 Add review cards export packs and typed publish confirmation
```

Current issue:

```text
Review Desk V2 loads in the browser, but shows:
"No review cards found."
```

Meaning:

```text
Dashboard UI is working.
Review API is working enough to return an empty state.
The review-card data source is too narrow.
```

Root likely cause:

```text
tools/publish/review-db.json may be empty/untracked/not synced
or its shape differs from what review-summary.js expects
or private uploaded videos exist in processed-v3.json but not review-db.json
```

Fix:

```text
Review cards must read from BOTH:
1. tools/publish/review-db.json
2. tools/video-generator/processed-v3.json

Then deduplicate by videoId.
```

---

# Product Mission

UselessApps.fun is a safe, absurd, viral AI media factory.

```text
Content = safely ridiculous
Dashboard = powerful command centre
Backend = automated media factory
Data layer = durable and testable
Publishing = private-first and approval-gated
```

---

# Finish Line Status

We are approximately:

```text
75% to MVP control-centre finish line
```

## Already built

```text
app/video generation
private YouTube upload
audio engine
production-safe audio assets
brand safety policy
safety report
action queue
safe worker
nightly runner
browser command centre
review/export CLI tools
typed publish confirmation
platform registry
publishing calendar
SQLite/audit/finance foundation
full-system tests
GitHub push workflow
```

## Still needed for MVP finish

```text
Review Desk must always show real cards
dashboard buttons must create queue/export/calendar items reliably
publish preflight panel must be visible
review sync must be robust
final test must cover review cards from processed-v3 fallback
final operator runbook
```

## Future, after MVP

```text
SQLite primary migration
multi-platform API integrations
finance ROI v2
React dashboard rewrite if needed
deployment packaging
```

---

# Active Build: Finish Review Desk + Preflight Wiring + Final Test Coverage

Status: NEXT BUILD

Goal:

Complete the dashboard operator workflow.

The dashboard must show review cards even when review DB is empty by falling back to processed video records.

---

## This Build Fixes

```text
No review cards found
review-db empty/mismatch
processed-v3 fallback missing
dashboard review API too narrow
review card test missing
export pack test missing
calendar endpoint test missing
```

---

# Required Behaviour

Review Desk should show cards from:

```text
private uploaded videos
approved videos
unlisted videos
processed dry-run videos if useful
failed/blocked videos as rerender candidates
```

Each card should show:

```text
videoId or local key
title/name
status
YouTube URL if available
public safe badge
audio readiness
safety status
learning score
recommended action
queue approve/reject/rerender buttons
export pack button
calendar button
typed publish command
```

No direct public publishing from browser.

---

# Files To Update

```text
ROADMAP.md
tools/review/review-summary.js
tools/review/review-cards.js
tools/dashboard/dashboard.js
tools/dashboard/web-dashboard.js
tools/testing/full-system-test.js
```

Optional:

```text
tools/publish/lib.js
scripts/sync-review.sh
```

---

# Review Card Source Strategy

## Source 1: review DB

```text
tools/publish/review-db.json
```

Use when available.

## Source 2: processed DB fallback

```text
tools/video-generator/processed-v3.json
```

Use records with:

```text
youtube.videoId
youtube.url
videoId
url
videoPath
name
```

## Source 3: dry run/local preview fallback

Use records without YouTube ID only as local preview cards.

These cannot be approved/published until uploaded, but can still show:

```text
export local data
rerender recommendation
safety/audio status
```

---

# Review Card Recommended Action Logic

```text
safety block -> needs_rerender
audio not public safe -> needs_rerender
failed/error -> needs_rerender
private uploaded + public safe -> approve or reject
approved -> publish preflight
published_unlisted -> monitor
published_public -> monitor
dry run -> upload private first
no video id -> upload/private review not ready
```

---

# Test Expansion

Full test must check:

```text
review-summary module exists
review cards function returns object with cards array
review cards can fallback from processed-v3
dashboard has reviewDeskCards
web dashboard has /api/review-cards
export-pack tool exists
confirm-publish tool exists
calendar endpoint exists
```

---

# Commands

```bash
./scripts/review-cards.sh
./scripts/dashboard.sh
./scripts/full-test.sh
./scripts/dashboard-web.sh
./scripts/open-dashboard.sh
```

If review cards still empty:

```bash
node -e "const {getReviewCards}=require('./tools/review/review-summary'); console.log(JSON.stringify(getReviewCards(), null, 2))"
node -e "const fs=require('fs'); const p='tools/video-generator/processed-v3.json'; const j=JSON.parse(fs.readFileSync(p)); console.log(Object.keys(j).length, Object.values(j).slice(0,2))"
```

---

# Completion Definition

This build is complete when:

```text
Review Desk V2 shows cards
review-cards.sh shows cards
dashboard API returns cards
export pack works for a card
calendar item can be added
full-test passes
commit and push succeeds
```

---

# Remaining Big Builds After This

## 1. Final Operator Runbook + MVP Freeze

```text
README
operator runbook
daily workflow
safe publish workflow
troubleshooting guide
env example
```

## 2. SQLite Primary Migration

```text
move action/review/video state into SQLite
JSON becomes backup/export only
```

## 3. Production Deployment Polish

```text
systemd services
cron hardening
health check endpoint
backup policy
dashboard auth later
```

---

# Current Finish Line

To finish MVP:

```text
1. Fix Review Desk fallback
2. Add final test coverage
3. Build runbook
4. Freeze current architecture
5. Continue content generation safely
```
