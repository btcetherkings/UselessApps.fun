# UselessApps.fun Roadmap

## Current Priority

We need to finish the foundation quickly without drifting.

The dashboard design is good enough for now. The next priority is wiring the backend properly and adding a full test system.

This build combines smaller roadmap items into one go:

```text
Backend Safety Integration
Publish Preflight Safety
Dashboard Safety Wiring
Action Queue Hardening
Full System Test Runner
Bug Finder / Self Check
```

---

# Active Build: Foundation Lockdown + Full System Test Suite

Status: Next build

Goal:

Make the system safer, testable, and wired end-to-end.

This build is about functionality, not dashboard design.

---

# Product Focus

UselessApps.fun must stay focused on:

```text
safe absurd useless apps
harmless viral comedy
fake product/corporate/startup nonsense
platform-friendly content
private-first publishing
approval-before-public workflow
```

It must avoid:

```text
government
police
politics
porn/adult
hate/extremism
weapons
drugs
self-harm
medical/legal/financial advice/scams
real emergency or public authority impersonation
```

---

# Combined Build Scope

## 1. Backend safety enforcement

Add safety checks to:

```text
autopilot
story selection
video generator
metadata/reporting
publish preflight
```

Minimum for this build:

```text
safety engine exists
unsafe content blocks generation
unsafe content appears in reports
publish preflight blocks unsafe videos
dashboard shows safety count
```

## 2. Full system test runner

Create:

```text
tools/testing/full-system-test.js
scripts/full-test.sh
```

The test should check:

```text
required files exist
JSON files parse correctly
JS files pass node --check
safety engine blocks banned content
safety engine allows safe useless-app content
action queue can queue/update safely
dashboard report can generate
browser dashboard files exist
scripts are executable
publish preflight module exists
audio validation module exists
learning output exists or warns
```

## 3. Dashboard wiring

Do not redesign UI now.

Just make sure it receives:

```text
safety
actionQueue
business
social
connections
jobs
advancedAnalytics
learning
```

## 4. Safety report

Command:

```bash
./scripts/safety-report.sh
```

## 5. Full test command

Command:

```bash
./scripts/full-test.sh
```

Output should show:

```text
PASS / WARN / FAIL
summary
bug list
next fixes
```

---

# New / Updated Files

```text
tools/safety/content-policy.js
tools/safety/safety-report.js
scripts/safety-report.sh

tools/testing/full-system-test.js
scripts/full-test.sh

tools/dashboard/report-v2.js
tools/dashboard/dashboard.js
tools/dashboard/web-dashboard.js

tools/video-generator/generate-v3.js
tools/autopilot/useless-autopilot.js
tools/publish/preflight.js

ROADMAP.md
```

---

# Full Test Categories

## Static checks

```text
node --check key JS files
JSON parse key data files
required scripts executable
required directories exist
```

## Safety checks

```text
government content must block
police content must block
politics content must block
porn/adult content must block
safe useless calculator must pass
fake corporate nonsense must pass
blocked story modes must block
```

## Queue checks

```text
queue action created
queue action has terminal command
queue action can be updated
queue snapshot restored after test
```

## Dashboard checks

```text
report-v2 generates JSON
dashboard HTML/CSS/JS exist
web-dashboard has /api/report
web-dashboard has /api/actions
```

## Backend checks

```text
generator file exists
autopilot file exists
processed-v3.json parseable
review-db.json parseable
recommendations-v2.json parseable if present
advanced-warehouse.json parseable if present
```

## Publish safety

```text
preflight file exists
public publishing remains protected
unsafe content should not pass preflight once wired
```

---

# Completion Definition

This build is done when:

```text
./scripts/full-test.sh runs
tests show pass/warn/fail summary
safety-report runs
dashboard report runs
unsafe categories are blocked by policy
dashboard receives safety/action/job/business data
```

Warnings are acceptable for missing optional APIs or analytics data.

Fails are not acceptable for syntax, JSON parse, missing core files, or safety blocking.

---

# Immediate Build Commands

1. Copy roadmap.
2. Create safety engine if missing.
3. Create safety report if missing.
4. Create full system tester.
5. Patch dashboard report safely.
6. Patch publish preflight safety check.
7. Run tests.
8. Fix failures.
9. Commit.

---

# Next Build After This

## Nightly Scheduler + Safe Backend Worker

After the foundation passes tests:

```text
nightly analytics
nightly learning
daily report refresh
safe action worker
systemd/cron setup
```

This will make the system start operating like a real media factory.

---

# Later Builds

## Database migration

```text
SQLite for content/jobs/actions/analytics/finance/audit
```

## Multi-platform connectors

```text
TikTok
Instagram
Facebook
X
Rumble
```

## Finance engine v2

```text
real cost/revenue entries
ROI per video/platform
profit forecasts
```

## Dashboard approval panels

```text
preview cards
approve/reject/rerender actions
public publish typed confirmation
```

---

# Important Reminder

The dashboard can become powerful.

The backend can become clever.

The content must remain safely stupid.
