# UselessApps.fun MASTER ROADMAP

## Current Issue

The dashboard still shows an unsafe/banned generated item in the centre:

```text
Runaway Button
fake_government_warning · full_mix

> USELESSNESS CORE ONLINE
> APP: Runaway Button
> STORY: fake_government_warning
> AUDIO: full_mix
> SAFETY: CHECK REQUIRED
```

This should not be shown as a hero/feature item.

Decision:

```text
Remove unsafe story modes from active display.
Replace central hero with Safe Operator Action Centre.
Archive/remove banned generated content from active state.
Keep delete/cleanup workflow typed and audited.
```

---

# Current Real Product Status

We are not fully done yet.

Strong foundation exists:

```text
generation engine
private upload
review cards
typed publish confirmation
manual export packs
safe worker
nightly runner
SQLite/audit/finance foundation
platform registry
publishing calendar
dashboard server APIs
GitHub push workflow
```

Still weak / unfinished:

```text
dashboard management functionality
API/social connection setup workflow
business suite depth
video lifecycle controls
dashboard auth/password
theme modes
safe reset/delete testing
banned content cleanup
```

---

# Active Build: Control Centre Completion + Banned Content Cleanup

Status: NEXT BUILD

Goal:

Make dashboard useful and safe.

This build combines:

```text
remove unsafe central hero card
add Safe Operator Action Centre
add banned-content cleanup tool
add API/social/business management checks
add dashboard theme modes if missing
add dashboard auth/password next
update tests
commit and push
```

---

# Safety Fixes

Blocked story modes:

```text
fake_government_warning
fake_police_chase
fake_conspiracy_investigation
```

Blocked content terms:

```text
government
police
politics
election
adult
porn
weapon
drug
self-harm
real emergency
public authority
```

Active generated content containing these should be:

```text
removed from apps.json active list
marked needs_rerender or blocked in review DB
marked cleanup_candidate in processed DB
archived before deletion/reset
```

---

# Dashboard Centre Panel Replacement

Replace old hero/current app block with:

```text
Safe Operator Action Centre
```

It should show:

```text
Health check command
Safe preview command
Private upload command
Review cards command
Clean start command
Delete video command warning
```

No banned generated story should be shown in the centre.

---

# Repo Privacy

Repo should be private:

```bash
gh repo edit btcetherkings/UselessApps.fun --visibility private --accept-visibility-change-consequences
```

Or GitHub UI:

```text
Repo Settings -> General -> Danger Zone -> Change visibility -> Private
```

---

# API/Social Setup Still Needed

Connections should track:

```text
youtube
youtube_analytics
website
tiktok future
instagram future
facebook future
x future
rumble manual
email future
```

Secrets stay only in `.env`.

Dashboard should not show secret values.

---

# Theme Modes

Dashboard must support:

```text
dark
light
gold
colourful
```

Stored in localStorage.

---

# Remaining Finish Items

## Must complete now

```text
1. Remove unsafe dashboard hero/current app display.
2. Cleanup banned generated items.
3. Confirm review API only shows safe/reviewable cards or blocked/rerender cards.
4. Add/verify dashboard API/social/business panels.
5. Add/verify dashboard themes.
6. Fix full-test if still broken.
7. Run full tests.
8. Commit/push.
```

## Next after this

```text
dashboard auth/password protection
SQLite primary migration
proper editable forms
export pack zip
finance ROI v2
production deployment
```

---

# Completion Definition

This build is complete when:

```text
fake_government_warning is no longer visible as active dashboard hero
banned content cleanup script works
review-cards shows unsafe videos only as rerender/delete candidates
dashboard has Safe Operator Action Centre
dashboard theme buttons work
connection/social/business reports work
full-test passes
commit and push succeeds
```
