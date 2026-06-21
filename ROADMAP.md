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
typed publish confirmation
manual export packs
review cards CLI
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

Latest pushed commit:

```text
27514a6 Add review cards export packs and typed publish confirmation
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
review/export/publish confirmation validation
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
wire more operational tools into the dashboard
make review/export/publish actions visible
add dashboard API endpoints
turn command-line workflow into dashboard workflow
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

# PHASE 6 — Review / Export / Typed Publish Workflow

Status: CLI built

Completed:

```text
review-cards.sh
export-pack.sh
export-report.sh
confirm-publish.sh
typed confirmation gate
manual platform export packs
```

Next step:

```text
wire review/export/publish status into dashboard and local API
```

---

# ACTIVE NEXT BUILD — Dashboard Approval Cards v2 + Review API + Preflight Panel

Status: NEXT BUILD

Goal:

Turn the existing review/export/publish CLI tools into a proper dashboard operator workflow.

This build should create:

```text
dashboard review cards
dashboard action buttons
review API endpoints
preflight preview panel
export pack button
calendar add button
command copy buttons
publish confirmation instructions
```

No public publish should happen directly from a dashboard click.

The dashboard can queue safe actions and show terminal commands.

Typed publish remains terminal-only for now.

---

## Combined Scope

This build combines:

```text
review card API
dashboard review cards
preflight result reader
export pack API endpoint
calendar item helper endpoint
copyable terminal commands
dashboard table improvements
full-test expansion
audit events for review/export/dashboard actions
```

---

## Why This Build Matters

We now have the tools, but they still feel separate.

The operator should not need to remember commands.

The dashboard should show:

```text
video needing review
safety status
audio status
public-safe status
YouTube link
recommended action
approve command
reject command
rerender command
export pack command
confirm publish command
calendar command
```

This gives the control centre a real review desk.

---

## New Files

```text
tools/review/review-summary.js
tools/review/review-api-data.js
```

Possible new scripts:

```text
scripts/review-summary.sh
```

Updated files:

```text
ROADMAP.md
tools/dashboard/web-dashboard.js
tools/dashboard/dashboard.html
tools/dashboard/dashboard.js
tools/dashboard/dashboard.css
tools/dashboard/report-v2.js
tools/testing/full-system-test.js
tools/audit/audit-log.js
```

---

## Dashboard API Endpoints

Add:

```text
GET /api/review-cards
POST /api/export-pack
POST /api/calendar-item
```

Safety:

```text
/api/export-pack only creates local export folder
/api/calendar-item only creates planning item
no public publish endpoint
no direct YouTube public publish from dashboard
```

---

## Review Card Data Shape

Each dashboard card:

```json
{
  "videoId": "abc123",
  "title": "Emotionally Unhelpful Calculator",
  "url": "https://youtu.be/abc123",
  "status": "private_uploaded",
  "publicSafe": true,
  "audioReadiness": "ready",
  "safetyStatus": "pass",
  "learningScore": 42,
  "recommendedAction": "approve or reject",
  "commands": {
    "approve": "./scripts/approve-video.sh abc123 ...",
    "reject": "./scripts/reject-video.sh abc123 ...",
    "rerender": "./scripts/needs-rerender.sh abc123 ...",
    "exportPack": "./scripts/export-pack.sh abc123",
    "publishUnlisted": "ALLOW_PUBLIC_PUBLISH=true ./scripts/confirm-publish.sh abc123 unlisted",
    "publishPublic": "ALLOW_PUBLIC_PUBLISH=true ./scripts/confirm-publish.sh abc123 public"
  }
}
```

---

## Dashboard Review UI

Add a section:

```text
Review Desk
```

Each card should show:

```text
title
video id
status badge
public-safe badge
audio badge
safety badge
YouTube link
recommended action
buttons:
  queue approve
  queue reject
  queue rerender
  create export pack
  add to calendar
copyable commands:
  confirm unlisted
  confirm public
```

For this build, buttons can use simple API calls or copy commands.

Public publish must remain typed terminal confirmation.

---

## Preflight Panel

Add to each review card:

```text
preflight status if known
public-safe check
audio check
safety check
ALLOW_PUBLIC_PUBLISH reminder
```

If not available, show:

```text
Run confirm-publish command to execute preflight.
```

---

## Test Expansion

Full test should check:

```text
review-summary JS exists
review API data module exists
web-dashboard has /api/review-cards
web-dashboard has /api/export-pack
web-dashboard has /api/calendar-item
dashboard JS references reviewCards
export-pack still passes node --check
confirm-publish still passes node --check
```

---

## Completion Definition

This build is complete when:

```text
dashboard shows review cards
/api/review-cards returns JSON
export pack can be created from dashboard API
calendar item can be added from dashboard API
full-test passes
review cards still work from CLI
public publish remains terminal typed confirmation only
```

---

## Commands After Build

```bash
./scripts/review-cards.sh
./scripts/export-report.sh
./scripts/calendar-report.sh
./scripts/dashboard.sh
./scripts/full-test.sh
./scripts/dashboard-web.sh
```

---

# PHASE 7 — Manual Multi-Platform Export v2

Status: Future

Build later:

```text
platform-specific title length checks
TikTok/Instagram/Reels hashtag variants
thumbnail/export images
manual posting checklist per platform
export pack zip
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

Review/export/publish:

```bash
./scripts/review-cards.sh
./scripts/export-pack.sh VIDEO_ID
./scripts/export-report.sh
ALLOW_PUBLIC_PUBLISH=true ./scripts/confirm-publish.sh VIDEO_ID unlisted
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
