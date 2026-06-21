# UselessApps.fun Roadmap

## Mission

UselessApps.fun is an automated viral comedy machine.

It creates tiny useless apps, records them, turns them into ridiculous fake-TV videos, uploads them privately, learns what performs, improves future content, and publishes only approved winners.

> Tiny apps. Zero purpose. Maximum joy.

---

## Critical Realisation

The system cannot learn properly unless it has real analytics data.

Current learning is limited because it mostly sees:

```text
views
likes
comments
review status
audio status
publish status
```

That is not enough.

For proper learning, the platform needs:

```text
watch time
average view duration
average view percentage
audience retention
subscribers gained/lost
impressions
click-through rate
shares
playlist starts
traffic source
device type
country
new vs returning viewers
channel subscriber totals
```

Important:

```text
The bot is not learning this in the background unless we explicitly run an analytics collector or schedule one.
```

This build creates that collector.

---

# Active Build: YouTube Advanced Analytics Collector + Learning Data Warehouse

Status: Next build

Goal:

Build a serious analytics data layer so the tool can actually learn.

This build should:

- call YouTube Data API for channel-level statistics
- call YouTube Analytics API for video-level metrics
- collect retention/watch-time/subscriber metrics where available
- collect impressions and CTR where available
- collect traffic source/device/country breakdowns
- store data in a structured warehouse JSON
- create a detailed analytics report
- feed advanced metrics into Learning v2
- show data gaps clearly
- prepare for scheduled collection later

Files to create/update:

```text
tools/analytics/youtube-advanced.js
tools/analytics/advanced-warehouse.json
tools/analytics/advanced-report.js
tools/analytics/learning-v2.js
tools/dashboard/report-v2.js
scripts/youtube-advanced-pull.sh
scripts/advanced-analytics-report.sh
scripts/learning-v2.sh
ROADMAP.md
```

---

# Why This Matters

A viral content engine cannot learn only from views.

Example:

```text
Video A: 100 views, 95% retention, +3 subscribers
Video B: 500 views, 5% retention, 0 subscribers
```

Views alone says Video B is better.

Real analytics says Video A is stronger.

The learning engine needs to understand:

```text
Did viewers stay?
Did they subscribe?
Did they click?
Did they share?
Where did they come from?
Which app type creates retention?
Which story mode keeps attention?
Which audio mood helps completion?
```

---

# Data Sources

## YouTube Data API

Used for:

```text
channel subscriber count
channel video count
channel view count
video public stats
video title/status metadata
```

## YouTube Analytics API

Used for:

```text
views
likes
comments
shares
subscribersGained
subscribersLost
estimatedMinutesWatched
averageViewDuration
averageViewPercentage
audienceWatchRatio
relativeRetentionPerformance
impressions
impressionsCtr
traffic source
device type
country
```

---

# Phase 1: Existing Platform

Status: Working

- [x] Generate apps
- [x] Render videos
- [x] Upload private videos
- [x] Review queue
- [x] Audio validation
- [x] Publish preflight
- [x] Learning v2
- [x] Detailed operator report

---

# Phase 2: Basic Analytics

Status: Working but limited

Current data:

```text
views
likes
comments
possibly status/review/audio data
```

Limitation:

```text
No retention, no watch-time, no subscriber conversion, no impressions, no CTR.
```

---

# Phase 3: Advanced Analytics Collector

Status: Next active build

## Required metrics

Core video metrics:

```text
views
likes
comments
shares
estimatedMinutesWatched
averageViewDuration
averageViewPercentage
subscribersGained
subscribersLost
```

Discovery metrics where available:

```text
impressions
impressionsCtr
```

Retention metrics where available:

```text
audienceWatchRatio
relativeRetentionPerformance
```

Breakdowns:

```text
trafficSourceType
deviceType
country
```

Channel stats:

```text
subscriberCount
hiddenSubscriberCount
viewCount
videoCount
```

## Warehouse shape

```json
{
  "version": 1,
  "generatedAt": "...",
  "channel": {
    "id": "...",
    "title": "...",
    "subscriberCount": 0,
    "viewCount": 0,
    "videoCount": 0
  },
  "videos": {
    "Nx2Ek9u165c": {
      "videoId": "Nx2Ek9u165c",
      "core": {
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "estimatedMinutesWatched": 0,
        "averageViewDuration": 0,
        "averageViewPercentage": 0,
        "subscribersGained": 0,
        "subscribersLost": 0,
        "impressions": 0,
        "impressionsCtr": 0
      },
      "retention": [],
      "trafficSources": [],
      "devices": [],
      "countries": [],
      "errors": []
    }
  },
  "errors": []
}
```

---

# Phase 4: Advanced Report

Status: Planned in this build

Report should show:

```text
channel subscriber count
subscriber gain/loss by video
best retention videos
worst retention videos
best watch time videos
best CTR videos
traffic source breakdown
country breakdown
device breakdown
videos with no analytics yet
API errors / unavailable metrics
```

---

# Phase 5: Learning v2 Upgrade

Status: Planned in this build

Learning score should include:

```text
views
likes
comments
shares
subscribersGained
subscribersLost
estimatedMinutesWatched
averageViewDuration
averageViewPercentage
impressionsCtr
publicSafe
review decision
publish status
```

New formula direction:

```text
views * 1
likes * 8
comments * 15
shares * 20
subscribersGained * 50
subscribersLost * -40
estimatedMinutesWatched * 1.5
averageViewPercentage * 2
impressionsCtr * 25
approved +20
published_unlisted +35
published_public +75
publicSafe +10
audio blockers negative
```

---

# Phase 6: Dashboard Upgrade

Status: Planned in this build

Detailed report should now include:

```text
Channel subscribers
Channel total views
Channel public video count
Best subscriber-converting video
Best retention video
Best watch-time video
Best CTR video
Worst retention video
Analytics data coverage percentage
```

---

# Phase 7: Scheduling

Status: Next build after this

Once the collector works manually, create:

```text
scripts/analytics-nightly.sh
systemd timer or cron example
```

Important:

```text
The system only learns in the background if scheduled.
```

---

# Immediate Next Build Tasks

1. Create `tools/analytics/youtube-advanced.js`.
2. Create `scripts/youtube-advanced-pull.sh`.
3. Create `tools/analytics/advanced-report.js`.
4. Create `scripts/advanced-analytics-report.sh`.
5. Pull channel stats using YouTube Data API.
6. Pull per-video analytics using YouTube Analytics API.
7. Store results in `advanced-warehouse.json`.
8. Patch `learning-v2.js` to read advanced warehouse.
9. Patch dashboard report to show advanced analytics summary.
10. Run collector.
11. Run learning v2.
12. Run dashboard.
13. Commit.

---

# Command Set

Pull advanced analytics:

```bash
./scripts/youtube-advanced-pull.sh
```

Show advanced report:

```bash
./scripts/advanced-analytics-report.sh
```

Run learning after advanced analytics:

```bash
./scripts/learning-v2.sh
```

Run dashboard:

```bash
./scripts/dashboard.sh
```

Future scheduled collector:

```bash
./scripts/analytics-nightly.sh
```

---

# Current Priority

1. Stop relying on shallow stats only.
2. Build a real analytics warehouse.
3. Learn from retention/watch-time/subscriber conversion.
4. Expose data gaps clearly.
5. Then schedule the analytics collector.
