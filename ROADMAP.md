# UselessApps.fun MASTER ROADMAP

## Current Reality Check

The technical foundation is strong, but the product is not finished.

Current weaknesses:

```text
dashboard is still mostly read-only
API connections cannot be managed properly from dashboard
social channels cannot be managed properly from dashboard
business management suite is too basic
review desk is not enough as a business control centre
old/generated videos need safe cleanup and reset workflow
delete video workflow is missing
```

Decision:

```text
Next build is not another small feature.
Next build is a real management-suite build.
```

---

# Product Mission

UselessApps.fun is a safe, absurd, viral AI media factory.

```text
Content = safely ridiculous
Dashboard = real business command centre
Backend = automated media factory
Data layer = durable and testable
Publishing = private-first and approval-gated
```

---

# New Finish Line

MVP foundation is not enough.

The real working product needs:

```text
1. Manage API connections
2. Manage social channels
3. Manage business metrics
4. Manage video lifecycle
5. Clean/reset videos safely
6. Delete YouTube videos safely
7. Start fresh with clean state
8. Dashboard actions must actually do useful work
```

---

# Active Build: Management Suite + API/Social Manager + Clean Video Reset

Status: NEXT BUILD

Goal:

Turn the dashboard from a basic monitor into an actual control centre.

This build adds:

```text
API connection manager
social channel manager
business settings manager
safe YouTube delete workflow
local video archive/cleanup workflow
dashboard management APIs
dashboard management panels
clean-start workflow
full-system tests
```

---

# Core Safety Rule

Deleting videos is destructive.

Therefore:

```text
No bulk delete without typed confirmation.
No dashboard one-click public delete.
No worker delete.
No social/API credential display in dashboard.
No secret values stored in JSON.
```

Delete must require exact terminal confirmation:

```text
DELETE VIDEO_ID FROM YOUTUBE
```

Bulk cleanup must archive local state first.

---

# Files To Add

```text
tools/connections/manage-connection.js
tools/social/manage-channel.js
tools/business/manage-business.js

tools/publish/delete-youtube.js
tools/publish/archive-video-state.js
tools/publish/cleanup-videos.js

scripts/connection-list.sh
scripts/connection-set.sh
scripts/channel-list.sh
scripts/channel-set.sh
scripts/business-report.sh
scripts/business-set.sh

scripts/delete-video.sh
scripts/archive-video-state.sh
scripts/cleanup-videos.sh
scripts/clean-start.sh
```

Updated:

```text
ROADMAP.md
tools/dashboard/web-dashboard.js
tools/dashboard/dashboard.html
tools/dashboard/dashboard.js
tools/dashboard/dashboard.css
tools/testing/full-system-test.js
.gitignore
```

---

# API Connection Manager

Store only non-secret metadata:

```text
provider
enabled
connected
status
authType
requiredEnvVars
lastCheckedAt
notes
```

Secret values remain in `.env`.

Examples:

```bash
./scripts/connection-list.sh
./scripts/connection-set.sh youtube enabled true
./scripts/connection-set.sh youtube status working
./scripts/connection-set.sh tiktok status future
```

Dashboard should show:

```text
provider
enabled
connected
status
required env vars
last checked
notes
```

---

# Social Channel Manager

Store:

```text
platform
enabled
connected
mode
handle
url
status
supportsUpload
supportsAnalytics
notes
```

Examples:

```bash
./scripts/channel-list.sh
./scripts/channel-set.sh youtube enabled true
./scripts/channel-set.sh youtube handle "@uselessapps"
./scripts/channel-set.sh website url "https://uselessapps.fun"
```

Dashboard should show editable channel management.

---

# Business Management Suite v1.5

Add editable settings:

```text
brandName
siteUrl
currency
monthlyBudget
targetVideosPerDay
targetPrivateUploadsPerDay
targetPublicPostsPerWeek
notes
```

Commands:

```bash
./scripts/business-report.sh
./scripts/business-set.sh monthlyBudget 100
./scripts/business-set.sh targetVideosPerDay 3
```

Dashboard should show:

```text
business settings
finance totals
revenue
cost
profit
production targets
```

---

# Video Lifecycle Manager

Statuses:

```text
local_preview
private_uploaded
approved
rejected
needs_rerender
published_unlisted
published_public
archived_local
deleted_youtube
cleanup_candidate
```

---

# Safe Delete Workflow

Command:

```bash
./scripts/delete-video.sh VIDEO_ID
```

Requires exact typed confirmation:

```text
DELETE VIDEO_ID FROM YOUTUBE
```

Then:

```text
calls YouTube API videos.delete
updates review DB
updates processed DB
writes audit event
does not delete local files unless cleanup requested
```

Required OAuth scope:

```text
https://www.googleapis.com/auth/youtube
```

---

# Local Archive Workflow

Command:

```bash
./scripts/archive-video-state.sh VIDEO_ID
```

Should:

```text
mark review status archived_local
mark processed status archived_local
write audit event
not touch YouTube
```

---

# Clean Start Workflow

Command:

```bash
./scripts/clean-start.sh
```

Should:

```text
archive existing review state
archive existing processed state
archive existing generated local videos
reset review DB to empty
reset action queue optional
keep apps/templates unless CLEAN_APPS=true
keep audit logs
keep finance
keep platform/social/API settings
```

Requires typed confirmation:

```text
CLEAN START USELESSAPPS
```

No YouTube deletion in clean-start.

YouTube deletion remains per-video typed command.

---

# Dashboard Management APIs

Add:

```text
GET  /api/connections
POST /api/connections

GET  /api/channels
POST /api/channels

GET  /api/business
POST /api/business

POST /api/archive-video
```

No dashboard YouTube delete endpoint in this build.

Dashboard can show delete command only.

---

# Dashboard Panels

Add/strengthen:

```text
API Connection Manager
Social Channel Manager
Business Suite
Video Lifecycle Manager
Clean Start / Reset Panel
```

Each panel should show:

```text
current config
copyable commands
safe action buttons where allowed
terminal-only commands where destructive
```

---

# Tests

Full test must check:

```text
connection manager exists
channel manager exists
business manager exists
delete-youtube exists
archive-video-state exists
cleanup-videos exists
clean-start exists
dashboard APIs exist
delete command requires confirmation
node --check passes
scripts executable
```

---

# Completion Definition

This build is complete when:

```text
connection-list works
connection-set works
channel-list works
channel-set works
business-report works
business-set works
archive-video-state works
clean-start confirmation works
delete-video confirmation blocks wrong phrase
dashboard shows API/social/business manager panels
full-test passes
commit and push succeeds
```

---

# After This Build

We will have a usable command centre.

Next builds become:

```text
1. Dashboard auth + roles
2. SQLite primary migration
3. Export pack v2
4. Finance ROI v2
5. Production deployment
```

---

# Operating Principle

The system must never hide destructive actions.

For destructive operations:

```text
show command
require typed terminal confirmation
audit everything
```
