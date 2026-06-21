# UselessApps.fun Roadmap

## Mission

UselessApps.fun is an automated viral comedy machine.

It creates tiny useless apps, records them, turns them into ridiculous fake-TV videos, uploads them privately, learns what performs, improves future content, and publishes only approved winners.

> Tiny apps. Zero purpose. Maximum joy.

---

## Current Reality

The dashboard/reporting now works as:

```text
console output
markdown report
JSON report
```

It does not yet open as a proper browser dashboard unless we build a local dashboard server/static HTML viewer.

Current files:

```text
reports/daily-autopilot-report.md
reports/daily-autopilot-report.json
tools/dashboard/report-v2.js
scripts/dashboard.sh
```

Next build:

```text
reports/daily-autopilot-report.json
→ browser dashboard HTML
→ local server
→ open in browser
→ refresh from latest report
```

---

# Active Build: Browser Dashboard UI

Status: Next build

Goal:

Create a proper browser dashboard for UselessApps.fun.

The browser dashboard should show:

```text
system health
content totals
upload/publish funnel
audio safety
advanced YouTube analytics
learning recommendations
latest autopilot decision
action cards
rerender candidates
top/worst videos
public-safe queue
blocked videos
commands to run next
```

---

# Why This Build Matters

The console report is useful but not enough for operating the content factory.

We need:

```text
visual cards
tables
clear colours
operator actions
browser refresh
links to YouTube videos
links to local generated videos
markdown/json report links
```

This becomes the control centre for the useless app machine.

---

# Files To Create / Update

```text
tools/dashboard/web-dashboard.js
tools/dashboard/dashboard.html
tools/dashboard/dashboard.css
tools/dashboard/dashboard.js
scripts/dashboard-web.sh
scripts/open-dashboard.sh
scripts/dashboard.sh
reports/daily-autopilot-report.json
ROADMAP.md
```

Optional later:

```text
tools/dashboard/server.js
```

---

# Phase 1: Existing Reporting

Status: Working

- [x] Console dashboard
- [x] Markdown report
- [x] JSON report
- [x] Health score
- [x] Action cards
- [x] Rerender candidates
- [x] Learning recommendations
- [x] Advanced analytics hooks

Limitation:

```text
No browser UI yet.
```

---

# Phase 2: Browser Dashboard UI

Status: Next active build

## Dashboard sections

The page should include:

```text
1. Header / status bar
2. Health score
3. Content totals
4. Upload/publish funnel
5. Audio safety
6. YouTube advanced analytics
7. Learning v2 recommendations
8. Latest autopilot decision
9. Action cards
10. Rerender candidates
11. Top videos
12. Weak videos
13. Commands panel
```

## Visual style

The dashboard should feel like:

```text
chaotic but professional
dark mode
neon highlights
fun but usable
operator/control-room style
```

Colours:

```text
green = safe / ready
orange = warning / needs review
red = blocked
blue = learning / analytics
purple = autopilot
```

## Data source

Use:

```text
reports/daily-autopilot-report.json
```

Dashboard flow:

```text
./scripts/dashboard-web.sh
→ sync-review
→ learning-v2
→ report-v2
→ serve dashboard on localhost
```

---

# Phase 3: Local Browser Server

Status: Planned in this build

Command:

```bash
./scripts/dashboard-web.sh
```

Expected output:

```text
Dashboard running at http://127.0.0.1:8787
```

Open manually:

```bash
xdg-open http://127.0.0.1:8787
```

or:

```bash
./scripts/open-dashboard.sh
```

Server should serve:

```text
/dashboard.html
/dashboard.css
/dashboard.js
/report.json
/report.md
```

---

# Phase 4: Dashboard API

Status: Planned in this build

Endpoints:

```text
GET /
GET /dashboard.css
GET /dashboard.js
GET /api/report
GET /api/report-md
GET /api/health
```

Optional command endpoint later:

```text
POST /api/run/sync-review
POST /api/run/learning
POST /api/run/autopilot-preview
```

For now, keep it read-only for safety.

---

# Phase 5: Dashboard Cards

Status: Planned in this build

## Health card

Show:

```text
Health score
Label
Notes
```

## Content card

Show:

```text
apps
records
uploaded
dry-run
failed
with learning reason
```

## Publishing card

Show:

```text
private
unlisted
public
ready for approval
ready for unlisted
blocked
```

## Audio safety card

Show:

```text
public-safe videos
blocked videos
test audio warnings
audio missing
production audio in use
```

## Learning card

Show:

```text
confidence
preferred app types
preferred story modes
preferred audio moods
next ideas
```

## Analytics card

Show:

```text
channel subscribers
channel total views
videos pulled
CTR/watch-time/retention where available
data gaps
```

---

# Phase 6: Action Tables

Status: Planned in this build

Tables:

```text
Action cards
Rerender candidates
Top videos
Weak videos
Latest audit/events
```

Each row should include command suggestions.

---

# Phase 7: Safety

Status: Planned

For now the browser dashboard should be read-only.

No publish buttons yet.

Reason:

```text
Publishing needs explicit terminal command confirmation.
```

Later we can add buttons behind confirmation.

---

# Immediate Next Build Tasks

1. Create `tools/dashboard/web-dashboard.js`.
2. Create `tools/dashboard/dashboard.html`.
3. Create `tools/dashboard/dashboard.css`.
4. Create `tools/dashboard/dashboard.js`.
5. Create `scripts/dashboard-web.sh`.
6. Create `scripts/open-dashboard.sh`.
7. Patch `scripts/dashboard.sh` to show both console report and browser hint.
8. Run dashboard web server.
9. Open browser at `http://127.0.0.1:8787`.
10. Commit.

---

# Command Set

Generate reports:

```bash
./scripts/daily-report-v2.sh
```

Start browser dashboard:

```bash
./scripts/dashboard-web.sh
```

Open browser dashboard:

```bash
./scripts/open-dashboard.sh
```

Manual browser open:

```bash
xdg-open http://127.0.0.1:8787
```

If on a headless machine:

```bash
python3 -m webbrowser http://127.0.0.1:8787
```

---

# Current Priority

1. Make the dashboard visible in browser.
2. Keep it read-only and safe.
3. Use the existing JSON report as source of truth.
4. Make the operator experience much clearer.
5. Later add buttons/command runner only after safety gates.
