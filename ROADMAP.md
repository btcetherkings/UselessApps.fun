# UselessApps.fun MASTER ROADMAP

## Current Reality

The project has a strong automation/backend foundation, but the product is not finished as a real command centre.

The missing pieces are:

```text
repo should be private
API/social connections need real management
dashboard needs usable management screens
dashboard needs multiple themes
business suite needs editable controls
video cleanup/delete/reset workflow must be safe and tested
final production runbook still needs polish
```

---

# Product Goal

UselessApps.fun should be:

```text
a safe, absurd AI content factory
a private-first video generation system
a proper business command centre
a dashboard-managed social/API platform
a test-backed operator console
```

The content is stupid.

The platform must be serious.

---

# Immediate Security Action

## Make GitHub Repo Private

Repository:

```text
github.com/btcetherkings/UselessApps.fun
```

Preferred:

```bash
gh repo edit btcetherkings/UselessApps.fun --visibility private --accept-visibility-change-consequences
```

Alternative via GitHub UI:

```text
Repo -> Settings -> General -> Danger Zone -> Change repository visibility -> Private
```

Reason:

```text
project contains business logic
automation workflows
YouTube/social integration code
future monetisation/IP
```

---

# Active Build: Real Control Centre Finish Build

Status: NEXT BUILD

This build combines:

```text
repo privacy
API connection setup manager
social channel setup manager
business suite controls
dashboard themes
safe video lifecycle manager
clean-start workflow
delete safety workflow
dashboard API management endpoints
full tests
```

---

# Dashboard Theme Modes

Add:

```text
dark mode
light mode
gold mode
colourful mode
```

Theme switcher should:

```text
save choice to localStorage
apply instantly
not require backend
not affect functionality
```

CSS approach:

```text
body.theme-dark
body.theme-light
body.theme-gold
body.theme-colourful
```

---

# API Connection Management

Dashboard/API should manage metadata for:

```text
youtube
youtube_analytics
tiktok
instagram
facebook
x
rumble
website
email
stripe/future
openai/future
```

Do not store secret values in JSON.

Store only:

```text
enabled
connected
status
authType
requiredEnvVars
lastCheckedAt
notes
```

Secrets stay in `.env`.

---

# Social Channel Management

Manage:

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
mode
handle
url
status
supportsUpload
supportsAnalytics
notes
```

---

# Business Suite v1.5

Editable settings:

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

Dashboard should show:

```text
finance totals
profit
budget
targets
channel status
API status
workflow health
```

---

# Video Cleanup / Delete / Reset

## Safe Delete

Command:

```bash
./scripts/delete-video.sh VIDEO_ID
```

Requires exact phrase:

```text
DELETE VIDEO_ID FROM YOUTUBE
```

No dashboard one-click delete.

## Archive Local State

```bash
./scripts/archive-video-state.sh VIDEO_ID
```

## Clean Start

```bash
./scripts/clean-start.sh
```

Requires:

```text
CLEAN START USELESSAPPS
```

It must:

```text
archive local state
reset review DB
reset processed DB
reset action queue
keep audit logs
keep finance
keep API/social/business settings
not delete YouTube videos
```

---

# Final Completion Definition

The control-centre foundation is finished when:

```text
repo is private
dashboard theme switcher works
/api/connections works
/api/channels works
/api/business works
/api/archive-video works
connection-list/set works
channel-list/set works
business-report/set works
delete-video confirmation blocks wrong phrase
clean-start archives and resets local state
full-test passes
dashboard starts
review API works
commit and push succeeds
```

---

# True Remaining Work After This Build

## Must-have before serious daily use

```text
dashboard auth/password
secrets audit
.env validation
YouTube delete real test on disposable test video
clean-start real test
one clean fresh private upload after reset
```

## Should-have next

```text
SQLite primary migration
dashboard forms instead of command copy blocks
export pack zip
finance ROI v2
production deployment/systemd
backup rotation
```

## Later

```text
real TikTok API
real Instagram/Facebook API
real X/Rumble integrations
React rewrite if needed
advanced analytics learning loop
```

---

# Current Recommended Build Order

```text
1. Make repo private
2. Fix full-test syntax
3. Add management scripts if not already committed
4. Add dashboard APIs for management
5. Add themes
6. Add dashboard management panels
7. Test clean-start/delete safety
8. Full test
9. Commit/push
10. Start fresh with clean videos
```

---

# Operating Principle

No destructive browser buttons.

For destructive actions:

```text
show command
require typed terminal confirmation
audit result
```

For API/social management:

```text
dashboard can update metadata
dashboard must not show or store secrets
```
