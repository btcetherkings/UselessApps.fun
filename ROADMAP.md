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
SQLite persistence foundation
audit trail foundation
finance engine v1
backup/export scripts
```

Recent validation:

```text
All tests passed apart from Git staging/path issues.
```

---

## Immediate Repo Hygiene Fix

Problem:

```text
git add package.json package-lock.json failed because root package.json does not exist.
```

Decision:

```text
Do not blindly add package.json at repo root unless we intentionally create root package metadata.
Keep node_modules out of Git.
Ignore backups, exports, logs, DB runtime files, and .before backup files.
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
```

Completion criteria:

```text
./scripts/full-test.sh passes
./scripts/safety-report.sh runs
./scripts/dashboard.sh runs
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
Finance
Safety
Action Queue
Backend Jobs
Automation
Operator Commands
```

No major redesign needed right now.

Future dashboard improvements:

```text
video preview cards
approve/reject/rerender cards
publishing calendar
multi-platform status
finance charts
database-backed views
```

---

# PHASE 3 — Safe Automation

Status: Active / mostly built

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

Status: Active / foundation built

Current DB goal:

```text
SQLite runs alongside JSON.
JSON remains source of operational truth for now.
DB becomes durable reporting/query layer.
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

Next for DB later:

```text
make SQLite primary source
migrate JSON to export/backup
add audit events to every action/worker/nightly process
```

---

# PHASE 5 — Active Next Build

## Multi-Platform Connector Framework + Publishing Calendar + Repo Hygiene

Status: NEXT BUILD

Goal:

Finish another large chunk by adding:

```text
repo cleanup
master roadmap consolidation
platform connector framework
publishing calendar foundation
content distribution matrix
platform-specific metadata placeholders
dashboard platform/calendar summary
test expansion
```

This moves the product toward managing multiple social channels without actually connecting risky APIs yet.

---

## Why This Build Matters

We already have:

```text
YouTube private upload
dashboard
analytics
safety
worker
database
finance
```

Now we need the structure for:

```text
YouTube
TikTok
Instagram Reels
Facebook Reels
X
Rumble
Website
Email list
```

But only YouTube should be active now.

Other platforms should be placeholders/manual/future so we stay safe and do not overbuild.

---

## New Files

```text
tools/platforms/platform-registry.json
tools/platforms/platform-lib.js
tools/platforms/platform-report.js
tools/calendar/publishing-calendar.json
tools/calendar/calendar-lib.js
tools/calendar/calendar-report.js

scripts/platform-report.sh
scripts/calendar-report.sh
scripts/add-calendar-item.sh
```

Updated files:

```text
ROADMAP.md
.gitignore
tools/dashboard/report-v2.js
tools/dashboard/dashboard.html
tools/dashboard/dashboard.js
tools/testing/full-system-test.js
```

---

## Platform Registry

Track:

```text
youtube
tiktok
instagram
facebook
x
rumble
website
email
```

Fields:

```text
enabled
connected
mode: api | manual | future
status
supportsUpload
supportsAnalytics
supportsScheduling
notes
```

---

## Publishing Calendar

Calendar item fields:

```text
id
title
videoId
platform
status: idea | ready | scheduled | published | skipped
plannedAt
actualPublishedAt
notes
createdAt
updatedAt
```

Allowed statuses:

```text
idea
ready
scheduled
published
skipped
blocked
```

No actual publishing automation in this build.

This is planning only.

---

## Content Distribution Matrix

Dashboard/report should show:

```text
platform readiness
which channels are connected
which are manual
which are future
how many calendar items exist
how many scheduled
how many published
how many blocked
```

---

## Safety Rules For This Build

No automatic public publishing.

No TikTok/Instagram/Facebook API upload yet.

No public publish button.

Only planning, tracking, reporting, and placeholders.

---

# PHASE 6 — Multi-Platform Publishing Later

Status: Future

Build later:

```text
YouTube public/unlisted confirmation
TikTok manual export helper
Instagram/Facebook metadata export
X post template
Rumble manual export
website publishing integration
```

---

# PHASE 7 — Dashboard Approval Panels

Status: Future

Add:

```text
video approval cards
queue approve/reject/rerender
typed confirmation for publish
preflight result per video
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

We should now maintain this single `ROADMAP.md`.

No more fragmented roadmap files unless exporting a copy for download.

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
