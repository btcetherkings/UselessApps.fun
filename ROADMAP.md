# UselessApps.fun Roadmap

## Mission

UselessApps.fun is a safe viral AI media factory for absurd, harmless, ridiculous useless-app entertainment.

The product is:

```text
funny useless apps
fake tech/product drama
absurd corporate nonsense
fake startup/product launches
fake documentaries about pointless apps
safe platform-friendly viral shorts
```

The product is not:

```text
politics
government/police content
adult/porn content
hate/extremism
weapons/violence
drugs
medical/legal/financial scam content
real emergency/public authority-style deception
```

---

# Design Inspiration Reviewed

Uploaded package:

```text
command_centre.zip
├── code.html
├── screen.png
└── DESIGN.md
```

Useful ideas extracted:

```text
dark mission-control aesthetic
left sidebar navigation
top app bar with AI status
glassmorphism panels
Content Lab workspace
prompt/config panel
preview stage
generation progress overlay
previous generations strip
operator buttons
dense analytics/control-room layout
```

What we should take:

```text
serious command centre visual system
left navigation
control-room information hierarchy
large preview/approval area
pipeline/action/analytics sections
clear status pips
better typography/spacing
```

What we should not take directly:

```text
generic cinematic prompt generator
stock image placeholders
external image dependencies
unsafe broad content categories
anything that drifts from useless-app comedy
```

---

# Active Build: Command Centre UI v2 + Core Product Safety Baseline

Status: Next build

Goal:

Turn the browser dashboard into a serious control centre while locking the product back onto safe useless-app entertainment.

This build combines:

```text
dashboard visual upgrade
content lab layout
safety policy baseline
core product focus
preview/approval panels
pipeline sections
```

---

# Dashboard Direction

The dashboard should feel like:

```text
a social media command centre
a content factory control room
an approval desk
an analytics operations console
a business cockpit
```

Not like:

```text
a basic JSON report viewer
a toy dashboard
a random video generator
```

---

# Main Navigation

Left sidebar sections:

```text
Command Center
Content Lab
Review Queue
Analytics
Learning Brain
Channels
API Management
Automations
Finance
Safety
Logs
Settings
```

For now the sections can be same-page anchors/views.

Later we can split into proper routes.

---

# Core Dashboard Areas

## 1. Command Center

Purpose:

```text
overall health
backend status
action queue
next recommended actions
system warnings
```

## 2. Content Lab

Purpose:

```text
latest generated useless app
video preview area
narration/story mode
audio mode
render status
generate preview action queue
private upload action queue
previous generations
```

## 3. Review Queue

Purpose:

```text
private uploads
public-safe status
approve/reject/rerender queue actions
publish-preflight reminder
```

## 4. Analytics

Purpose:

```text
YouTube stats
advanced analytics
retention/watch-time/subscriber data
top videos
weak videos
data gaps
```

## 5. Learning Brain

Purpose:

```text
recommendations v2
preferred app types
preferred story modes
preferred audio moods
latest learning reason
why bot chose next idea
```

## 6. Channels

Purpose:

```text
YouTube
TikTok future
Instagram future
Facebook future
X future
Rumble future
website
connection status
```

## 7. Finance

Purpose:

```text
revenue
costs
profit
cost per video
ROI per video
platform ROI
```

## 8. Safety

Purpose:

```text
brand safety status
blocked content categories
blocked story modes
publish safety
public-safe videos
```

---

# Safety Baseline

Create a content safety engine before scaling.

## Blocked story modes

```text
fake_government_warning
fake_police_chase
fake_conspiracy_investigation
```

## Blocked terms/categories

```text
government
police
politics
politician
election
campaign
porn
adult
sexual
nudity
hate
extremism
terrorism
weapon
gun
knife
bomb
drug
self-harm
suicide
medical advice
legal advice
financial advice
real emergency
public authority
```

## Safe story direction

Allowed:

```text
fake corporate audit
fake startup demo
fake product launch disaster
fake nature documentary about objects
fake scientific experiment about harmless software
fake therapy session for silly apps
fake investor pitch for nonsense
fake office memo
fake bug report
fake customer support ticket
```

---

# Files To Create / Update

```text
tools/safety/content-policy.js
tools/safety/safety-report.js
scripts/safety-report.sh

tools/dashboard/dashboard.html
tools/dashboard/dashboard.css
tools/dashboard/dashboard.js
tools/dashboard/report-v2.js

tools/story/story-engine.js
tools/video-generator/generate-v3.js
tools/autopilot/useless-autopilot.js

ROADMAP.md
reports/daily-autopilot-report.md
reports/daily-autopilot-report.json
```

---

# Build A: Safety Engine

Create:

```text
tools/safety/content-policy.js
```

Exports:

```text
checkContentSafety()
filterSafeTemplates()
isStoryModeAllowed()
safeReplacementStoryMode()
```

Safety result:

```json
{
  "status": "pass",
  "riskScore": 0,
  "blocked": false,
  "warnings": [],
  "blockers": [],
  "safeCategory": "harmless_absurd_useless_app"
}
```

---

# Build B: Dashboard UI v2

Replace the current dashboard layout with a more serious control centre:

```text
fixed left sidebar
sticky top bar
glass panels
mission-control colours
large preview stage
content lab controls
pipeline cards
action queue table
safety card
business/finance card
analytics card
learning card
channels card
```

Design system from uploaded file:

```text
background: #0a1325
panels: rgba(15, 23, 42, 0.6)
primary: #2563eb
tertiary: #38bdf8 / #7bd0ff
text: #dae2fc
muted: #94a3b8
font: Inter style
mono labels: JetBrains Mono style
```

No external dependencies needed for now.

---

# Build C: Preview/Approval Area

Dashboard should include:

```text
latest video preview metadata
local video path
YouTube link
app name
story mode
audio mode
safety status
learning reason
queue approve/reject/rerender buttons
```

No one-click public publish yet.

---

# Build D: Pipeline Overview

Content pipeline should show:

```text
apps total
processed records
preview only
uploaded private
approved
unlisted
public
blocked
rerender candidates
```

---

# Build E: Previous Generations Strip

Use current processed records to render:

```text
latest 10 generated videos
name
status
audio mode
safety
open link if YouTube URL exists
```

---

# Immediate Next Build Tasks

1. Add safety engine.
2. Add safety report command.
3. Remove/disable risky story modes.
4. Add safety check into generator/autopilot where safe.
5. Replace dashboard HTML structure with control-centre layout.
6. Replace dashboard CSS with command-centre style.
7. Patch dashboard JS to render sections from existing report JSON.
8. Add safety summary into report-v2 JSON.
9. Run safety report.
10. Run dashboard.
11. Open browser dashboard.
12. Commit.

---

# Command Set

Safety report:

```bash
./scripts/safety-report.sh
```

Dashboard report:

```bash
./scripts/dashboard.sh
```

Browser dashboard:

```bash
./scripts/stop-dashboard.sh || true
./scripts/dashboard-web.sh
./scripts/open-dashboard.sh
```

Safe preview:

```bash
USE_LEARNING_ENGINE=true SAFE_CONTENT_ONLY=true AUTO_DRY_RUN=true AUTO_MAX_PER_RUN=1 ./scripts/autopilot-preview-once.sh
```

Safe private upload:

```bash
USE_LEARNING_ENGINE=true SAFE_CONTENT_ONLY=true AUDIO_REQUIRE_PUBLIC_SAFE=true AUTO_DRY_RUN=false AUTO_MAX_PER_RUN=1 ./scripts/autopilot-upload-once-private.sh
```

---

# Product Focus Reminder

The dashboard must be powerful.

The videos must remain ridiculous and harmless.

The business must become serious.

The content must stay safe.

The backend must become stronger.

The product must not drift.
