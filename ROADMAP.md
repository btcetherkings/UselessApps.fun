# UselessApps.fun MASTER ROADMAP

## Product Mission

UselessApps.fun is a safe, absurd, viral AI media factory.

It creates harmless useless apps, turns them into funny short videos, uploads privately first, learns from performance, and lets the operator approve what becomes public.

The product should feel stupid.

The platform should be serious.

```text
Content = safely ridiculous
Dashboard = powerful command centre
Backend = automated media factory
Data layer = durable and testable
Publishing = private-first and approval-gated
```

---

## Core Product Focus

Allowed content:

```text
useless calculators
pointless buttons
loading screens
fake startup demos
fake corporate nonsense
fake product launches
fake internal audits
fake scientific experiments about harmless software
fake nature documentaries about objects
fake therapy sessions for silly apps
office absurdity
pet rock / pebble / toast / button humour
```

Blocked content:

```text
government
police
politics
politicians
elections
porn/adult content
sexual content
nudity
hate/extremism
terrorism
weapons
drugs
self-harm
medical/legal/financial advice/scams
real emergency alerts
public authority impersonation
```

---

## Current Stable Foundation

Completed / mostly completed:

```text
app generation
video generation
audio engine
production-safe audio asset foundation
YouTube private upload
private review workflow
publish preflight
action queue
safe backend worker
nightly runner
job status registry
brand safety policy
safety report
full-system test runner
browser command centre dashboard
business metrics foundation
social channel registry
API connection registry
platform connector framework
publishing calendar foundation
SQLite persistence foundation
audit trail foundation
finance engine v1
backup/export scripts
repo hygiene
generated runtime ignores
GitHub push fixed
```

Recent validation:

```text
Tests passing.
Latest pushed commit: 0962b3e Ignore generated runtime state and media assets
```

---

# PHASE 1 — Foundation Lockdown

Status: Complete

Includes:

```text
brand safety policy
safety-report.sh
full-test.sh
dashboard report validation
action queue validation
JSON validation
JS syntax validation
safe worker validation
nightly runner validation
SQLite/audit/finance validation
platform/calendar validation
```

Completion criteria:

```text
./scripts/full-test.sh passes
./scripts/safety-report.sh runs
./scripts/dashboard.sh runs
git push works
```

---

# PHASE 2 — Command Centre Dashboard

Status: Good enough visually for now

Current dashboard sections:

```text
Command Center
Content Lab
Review Queue
Analytics
Learning Brain
Channels
Platform Matrix
Publishing Calendar
Finance
Safety
Action Queue
Backend Jobs
Automation
Operator Commands
```

No major redesign needed right now.

Focus now:

```text
wire more features into the existing dashboard
approval cards
typed confirmation
manual export packs
publish safety
operator workflows
```

---

# PHASE 3 — Safe Automation

Status: Built / active

Components:

```text
action queue
safe worker
nightly runner
job logs
worker logs
cron installer
dashboard automation summary
```

Rules:

```text
No public publishing via worker.
No unlisted/public publish without explicit operator command.
Restricted actions are skipped.
Failed actions are not retried unless explicitly enabled.
```

---

# PHASE 4 — SQLite + Audit + Finance

Status: Foundation built

Current DB strategy:

```text
SQLite runs alongside JSON.
JSON remains operational truth for now.
DB is durable reporting/query/audit layer.
```

Tables:

```text
audit_events
content_items
video_records
action_snapshots
job_snapshots
finance_entries
platform_accounts
system_snapshots
```

Scripts:

```text
db-init.sh
db-sync.sh
audit-report.sh
add-revenue.sh
add-cost.sh
finance-report.sh
backup-state.sh
export-state.sh
```

Later:

```text
make SQLite primary source
migrate JSON to export/backup
add audit events to every action/worker/nightly process
```

---

# PHASE 5 — Multi-Platform Connector Framework

Status: Foundation built

Current platforms:

```text
youtube: active/API
website: active/static
rumble: manual/future
tiktok: future
instagram: future
facebook: future
x: future
email: future
```

Current rule:

```text
Only YouTube is active.
Other platforms are planning/manual placeholders.
No automatic multi-platform public publishing yet.
```

---

# ACTIVE NEXT BUILD — Approval Cards + Typed Publish Confirmation + Manual Export Packs

Status: NEXT BUILD

Goal:

Finish the operator workflow from:

```text
private upload → review card → approve/reject/rerender → publish preflight → typed confirmation → public/unlisted publish OR manual export pack
```

This is the next serious product feature.

---

## Combined Scope

This build combines:

```text
dashboard approval cards
review queue wiring
typed publish confirmation
manual export packs
platform metadata packs
publish command hardening
audit logging for review/publish
calendar item helper
full-test expansion
```

---

## Why This Build Matters

We already have a powerful foundation, but the operator workflow still needs to feel complete.

The operator should be able to:

```text
see latest private videos
see safety/audio/public-safe badges
queue approve/reject/rerender
run publish preflight
generate manual export pack
publish only with typed confirmation
add content to publishing calendar
```

This is where the product starts behaving like a real content operations platform.

---

## New Files

```text
tools/export/export-pack.js
tools/export/export-report.js
scripts/export-pack.sh
scripts/export-report.sh

tools/publish/confirm-publish.js
scripts/confirm-publish.sh

tools/review/review-cards.js
scripts/review-cards.sh
```

Updated files:

```text
ROADMAP.md
tools/dashboard/report-v2.js
tools/dashboard/dashboard.html
tools/dashboard/dashboard.js
tools/publish/publish-youtube.js
tools/publish/preflight.js
tools/audit/audit-log.js
tools/calendar/calendar-lib.js
tools/testing/full-system-test.js
```

---

## Export Pack

Purpose:

Create a manual platform export folder for a video.

Command:

```bash
./scripts/export-pack.sh VIDEO_ID
```

Output:

```text
exports/manual-pack-VIDEO_ID-YYYY-MM-DD-HHMMSS/
├── metadata.json
├── youtube.txt
├── tiktok.txt
├── instagram.txt
├── facebook.txt
├── x.txt
├── rumble.txt
├── checklist.md
└── source-video.txt
```

No automatic upload.

This lets us manually post safely to other platforms later.

---

## Review Cards

Purpose:

Summarise videos that need operator review.

Command:

```bash
./scripts/review-cards.sh
```

Each card should show:

```text
video ID
title
YouTube URL
status
audio readiness
public safe
safety status
learning score
recommended action
commands
```

---

## Typed Publish Confirmation

Purpose:

Prevent accidental public publishing.

Command:

```bash
./scripts/confirm-publish.sh VIDEO_ID unlisted
./scripts/confirm-publish.sh VIDEO_ID public
```

The tool must require exact typed confirmation:

```text
PUBLISH VIDEO_ID AS public
```

or:

```text
PUBLISH VIDEO_ID AS unlisted
```

Rules:

```text
public publish requires ALLOW_PUBLIC_PUBLISH=true
preflight must pass
brand safety must pass
audio public-safe must pass
operator must type exact phrase
```

---

## Dashboard Additions

Add/strengthen:

```text
review cards table
publish preflight hints
export pack command per video
confirm publish command per video
calendar add command per video
```

No redesign.

Just wire more operational commands into the existing UI.

---

## Calendar Integration

When export pack is created, optionally add a publishing calendar item:

```text
platform: manual_export
status: ready
title: video title
notes: export folder path
```

---

## Audit Integration

Audit events should log:

```text
review_card_generated
export_pack_created
confirm_publish_started
publish_confirmed
publish_blocked
calendar_item_created
```

---

## Safety Rules

Still no automatic public publishing.

No worker/public publish.

Public publish must be manual typed confirmation only.

Manual export pack is safe because it does not upload anywhere.

---

## Completion Definition

This build is complete when:

```text
./scripts/review-cards.sh works
./scripts/export-pack.sh VIDEO_ID works for existing video
./scripts/export-report.sh works
./scripts/confirm-publish.sh VIDEO_ID unlisted requires exact typed phrase
publish command refuses without correct confirmation
dashboard report shows review/export commands
full-test passes
```

---

## Commands After Build

Review:

```bash
./scripts/review-cards.sh
```

Export pack:

```bash
./scripts/export-pack.sh VIDEO_ID
./scripts/export-report.sh
```

Safe publish confirmation:

```bash
ALLOW_PUBLIC_PUBLISH=true ./scripts/confirm-publish.sh VIDEO_ID unlisted
ALLOW_PUBLIC_PUBLISH=true ./scripts/confirm-publish.sh VIDEO_ID public
```

Calendar:

```bash
./scripts/add-calendar-item.sh "Video title" youtube "2026-06-22T10:00:00+01:00" "Ready for manual post"
./scripts/calendar-report.sh
```

Tests:

```bash
./scripts/full-test.sh
```

---

# PHASE 6 — Multi-Platform Publishing Later

Status: Future

Build later:

```text
YouTube public/unlisted confirmation polishing
TikTok manual export helper refinement
Instagram/Facebook metadata export
X post template
Rumble manual export
website publishing integration
```

No automatic multi-platform publishing until safety, API terms, and account readiness are confirmed.

---

# PHASE 7 — Dashboard Approval Panels v2

Status: Future

Add:

```text
visual video cards
queue approve/reject/rerender from dashboard
typed confirmation modal
preflight result panel
audio/safety badge per video
```

---

# PHASE 8 — Finance Engine v2

Status: Future

Add:

```text
ROI by video
ROI by platform
cost per video
revenue per 1,000 views
subscriber value
monthly profit/loss
forecasting
```

---

# PHASE 9 — Database Primary Migration

Status: Future

Move from:

```text
JSON primary + SQLite reporting
```

To:

```text
SQLite primary + JSON export/backup
```

---

# PHASE 10 — Production Hardening

Status: Future

Add:

```text
role-based dashboard controls
typed confirmations
better secrets handling
rate-limit handling
API retry/backoff
error dashboard
test coverage expansion
packaging/deployment docs
```

---

## Current Commands

Core tests:

```bash
./scripts/full-test.sh
./scripts/safety-report.sh
./scripts/dashboard.sh
```

Automation:

```bash
./scripts/safe-worker.sh
./scripts/nightly-run.sh
./scripts/install-nightly-cron.sh
./scripts/show-schedule.sh
```

Database:

```bash
./scripts/db-init.sh
./scripts/db-sync.sh
./scripts/audit-report.sh
```

Finance:

```bash
./scripts/add-revenue.sh 12.50 youtube "Revenue note"
./scripts/add-cost.sh 5.00 api "Cost note"
./scripts/finance-report.sh
```

Platforms/calendar:

```bash
./scripts/platform-report.sh
./scripts/calendar-report.sh
./scripts/add-calendar-item.sh "Title" youtube "" "Notes"
```

State:

```bash
./scripts/backup-state.sh
./scripts/export-state.sh
```

Dashboard:

```bash
./scripts/stop-dashboard.sh || true
./scripts/dashboard-web.sh
./scripts/open-dashboard.sh
```

---

## Final Direction

Maintain this single `ROADMAP.md`.

The platform direction is:

```text
serious business/control platform
safe absurd media content
multi-channel eventually
database-backed gradually
test everything
private-first publishing
approval-gated public release
```
