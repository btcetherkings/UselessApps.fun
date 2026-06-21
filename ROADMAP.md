# UselessApps.fun Roadmap

## Mission

UselessApps.fun is becoming a full AI media operating system.

```text
Dashboard = control centre / business OS / approval layer
Backend = automation factory / engines / workers / analytics / learning
Action Queue = safe bridge between dashboard and backend
Job Registry = operational truth for backend health
```

The goal is not just to create useless videos.

The goal is to run a complete content business from one control centre.

---

# Current State

Working / mostly working:

- [x] Browser dashboard
- [x] Console/markdown/JSON reports
- [x] Business metrics foundation
- [x] Social channel registry
- [x] API connection registry
- [x] Backend job registry
- [x] Action queue foundation
- [x] CLI action queue commands
- [x] Dashboard report action queue integration in progress

Current issue:

```text
The action queue exists, but it is not yet fully operational from the browser dashboard.
We need robust endpoints, dashboard rendering, safe queue buttons, action execution tracking, and job-status updates.
```

---

# Active Build: Fully Functional Action Queue + Backend Job Tracking

Status: Next build

Goal:

Make the action queue usable as the first proper dashboard control layer.

The dashboard should be able to:

```text
show action queue
queue safe actions
show pending/completed/failed actions
show exact command to run an action
show backend job health
refresh after actions
```

The terminal should be able to:

```text
queue action
list actions
approve/reject action
run action
show action report
update job-status.json
```

The backend should:

```text
run safe scripts
record action result
record action failure
update job-status.json
keep public publishing restricted
```

---

# Safety Rules

## Allowed via action queue

```text
sync_review
run_learning
pull_basic_stats
pull_advanced_analytics
refresh_dashboard
approve_video
reject_video
needs_rerender
```

## Not allowed via generic runner yet

```text
publish_public
publish_unlisted
delete_video
post_to_social
change_credentials
```

Public/unlisted publishing stays terminal-only until we build explicit confirmation controls.

---

# Files To Update

```text
tools/actions/action-lib.js
tools/actions/queue-action.js
tools/actions/list-actions.js
tools/actions/run-action.js
tools/actions/action-report.js

tools/jobs/job-summary.js
tools/jobs/job-status.json
tools/jobs/job-lib.js

tools/dashboard/report-v2.js
tools/dashboard/web-dashboard.js
tools/dashboard/dashboard.html
tools/dashboard/dashboard.css
tools/dashboard/dashboard.js

scripts/queue-action.sh
scripts/list-actions.sh
scripts/run-action.sh
scripts/action-report.sh
scripts/dashboard-web.sh
scripts/dashboard.sh

reports/daily-autopilot-report.md
reports/daily-autopilot-report.json
ROADMAP.md
```

---

# Phase 1: Robust Action Queue

Status: Next active build

Tasks:

- [ ] Make queue payload optional
- [ ] Make JSON payload parsing robust
- [ ] Prevent duplicate variable collisions in report-v2
- [ ] Add action queue counts to report JSON
- [ ] Add recent action list to report JSON
- [ ] Add safe terminal command per action
- [ ] Add action history/audit trail

---

# Phase 2: Job Status Updates

Status: Next active build

Create:

```text
tools/jobs/job-lib.js
```

Functions:

```text
loadJobs()
saveJobs()
markJobRunning(jobKey)
markJobSuccess(jobKey)
markJobFailure(jobKey, error)
```

Each action type maps to a job:

```text
sync_review -> sync_review
run_learning -> run_learning
pull_basic_stats -> pull_youtube_stats
pull_advanced_analytics -> pull_advanced_analytics
refresh_dashboard -> build_dashboard
approve_video -> review_action
reject_video -> review_action
needs_rerender -> review_action
```

This gives the dashboard backend health visibility.

---

# Phase 3: Dashboard Action API

Status: Next active build

Endpoints:

```text
GET /api/actions
POST /api/actions
```

For safety:

```text
POST creates queued actions only
No direct execution endpoint yet
```

Future:

```text
POST /api/actions/:id/run
```

but only after confirmation/roles.

---

# Phase 4: Browser Dashboard Controls

Status: Next active build

Add safe buttons:

```text
Queue Sync Review
Queue Learning
Queue Basic Stats
Queue Advanced Analytics
Queue Refresh Dashboard
```

Add action queue table:

```text
ID
Type
Status
Safety
Created
Command
```

Add per-action command:

```bash
./scripts/run-action.sh act_...
```

---

# Phase 5: Video-Level Queue Buttons

Status: Planned inside this build if safe

For action cards:

```text
Queue Approve
Queue Reject
Queue Needs Rerender
```

These should require a videoId and create queue items only.

No publish buttons yet.

---

# Phase 6: Dashboard Refresh

Status: Planned

Add action:

```text
refresh_dashboard
```

Runs:

```bash
./scripts/daily-report-v2.sh
```

This lets the action queue update its own dashboard data through terminal execution.

---

# Phase 7: Operator Workflow

Final workflow:

```text
open dashboard
review action cards
click queue action
terminal: ./scripts/list-actions.sh
terminal: ./scripts/run-action.sh ACTION_ID
dashboard refresh
action moves to completed/failed
job status updates
```

---

# Immediate Next Build Tasks

1. Fix action queue JSON parsing.
2. Add job status update library.
3. Patch action runner to update job status.
4. Patch report-v2 action queue integration safely.
5. Patch web-dashboard with `/api/actions`.
6. Patch dashboard UI with action queue cards/buttons.
7. Add `refresh_dashboard` action.
8. Test queue from CLI.
9. Test queue from browser.
10. Run queued safe action.
11. Confirm report updates.
12. Commit.

---

# Command Set

Queue actions:

```bash
./scripts/queue-action.sh sync_review
./scripts/queue-action.sh run_learning
./scripts/queue-action.sh pull_basic_stats
./scripts/queue-action.sh pull_advanced_analytics
./scripts/queue-action.sh refresh_dashboard
./scripts/queue-action.sh approve_video '{"videoId":"VIDEO_ID","note":"Approved from dashboard queue"}'
```

List:

```bash
./scripts/list-actions.sh
```

Run:

```bash
./scripts/run-action.sh ACTION_ID
```

Report:

```bash
./scripts/action-report.sh
```

Dashboard:

```bash
./scripts/dashboard-web.sh
```

---

# Next Build After This

## Nightly Scheduler + Backend Worker

Once the queue is working, add:

```text
nightly analytics pull
nightly learning run
daily report refresh
optional safe action worker
systemd/cron setup
```

That is when the system starts learning automatically instead of only when manually triggered.
