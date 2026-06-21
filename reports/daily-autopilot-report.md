# UselessApps.fun Operator Report v2

Generated: 2026-06-21T15:24:29.240Z

## Executive Summary

- System health: **90/100 (excellent)**
- Apps: 14
- Processed records: 14
- Uploaded: 13
- Dry-run previews: 1
- Failed: 0
- Public-safe: 1
- Blocked for public: 12
- With learning reason: 1

## Health Score Notes

- +20 processed records exist
- +15 uploads exist
- +15 review DB has items
- +15 audio mix exists
- +15 public-safe item exists
- +10 learning v2 exists
- +10 learning reason exists
- -10 many blocked videos

## Upload / Publish Funnel

```json
{
  "private_uploaded": 11,
  "published_unlisted": 2,
  "preview_only": 1
}
```

## Audio Safety Breakdown

```json
{
  "blocked_for_public": 12,
  "needs_audio_review": 1,
  "not_validated": 1
}
```

## Action Counts

```json
{
  "RERENDER_WITH_AUDIO": 11,
  "PRIVATE_UPLOAD_IF_GOOD": 1
}
```

## Action Cards

| Action                 | Video                                   | Video ID    | Public Safe | Warnings      |
| ---------------------- | --------------------------------------- | ----------- | ----------- | ------------- |
| RERENDER_WITH_AUDIO    | Runaway Button                          | zx5y4y-2CpY | false       | audio_missing |
| RERENDER_WITH_AUDIO    | Staring Pet Rock                        | nT6qA1pNWmU | false       | audio_missing |
| RERENDER_WITH_AUDIO    | Useless To-Do List                      | LgOrHXpLt8E | false       | audio_missing |
| RERENDER_WITH_AUDIO    | Unhelpful Calculator                    | 9ev-3qhQkSs | false       | audio_missing |
| RERENDER_WITH_AUDIO    | Endless Loading Spinner                 | MsadFVnCvIs | false       | audio_missing |
| RERENDER_WITH_AUDIO    | The Government Calculator               | roo3gALgBDA | false       | audio_missing |
| RERENDER_WITH_AUDIO    | Emotionally Unhelpful Calculator        | gYpcgNaw5W0 | false       | audio_missing |
| RERENDER_WITH_AUDIO    | Infinite Loading Ceremony               | -YoBkyPZlAE | false       | audio_missing |
| RERENDER_WITH_AUDIO    | Emotionally Unavailable Button          | 9wbRVRevKX0 | false       | audio_missing |
| RERENDER_WITH_AUDIO    | Emotionally Distant Mineral             | q6p8OXa9DSs | false       | audio_missing |
| RERENDER_WITH_AUDIO    | Emotionally Unhelpful Calculator WZZPKG | s-nlrJBNRiM | false       | audio_missing |
| PRIVATE_UPLOAD_IF_GOOD | Staring Pebble Supreme                  |             | false       | none          |

## Rerender Candidates

| Video                                   | Video ID    | Readiness          | Warnings      |
| --------------------------------------- | ----------- | ------------------ | ------------- |
| Runaway Button                          | zx5y4y-2CpY | blocked_for_public | audio_missing |
| Staring Pet Rock                        | nT6qA1pNWmU | blocked_for_public | audio_missing |
| Useless To-Do List                      | LgOrHXpLt8E | blocked_for_public | audio_missing |
| Unhelpful Calculator                    | 9ev-3qhQkSs | blocked_for_public | audio_missing |
| Endless Loading Spinner                 | MsadFVnCvIs | blocked_for_public | audio_missing |
| The Government Calculator               | roo3gALgBDA | blocked_for_public | audio_missing |
| Emotionally Unhelpful Calculator        | gYpcgNaw5W0 | blocked_for_public | audio_missing |
| Infinite Loading Ceremony               | -YoBkyPZlAE | blocked_for_public | audio_missing |
| Emotionally Unavailable Button          | 9wbRVRevKX0 | blocked_for_public | audio_missing |
| Emotionally Distant Mineral             | q6p8OXa9DSs | blocked_for_public | audio_missing |
| Emotionally Unhelpful Calculator WZZPKG | s-nlrJBNRiM | blocked_for_public | audio_missing |
| Loading Screen With No Exit             | FpQOm5Qa82c | blocked_for_public | audio_missing |

## Advanced YouTube Analytics

- Exists: true
- Generated: 2026-06-21T13:51:03.631Z
- Videos pulled: 13
- Channel title: UselessApps
- Subscribers: 1
- Channel total views: 0
- Public videos: 0

## Business Metrics

- Currency: GBP
- Revenue total: 0
- Cost total: 0
- Profit: 0
- Revenue entries: 0
- Cost entries: 0

## Social Channels

- Total: 7
- Enabled: 2
- Connected: 2
- Not connected: 5

| Channel   | Enabled | Connected | Status        |
| --------- | ------- | --------- | ------------- |
| youtube   | true    | true      | working       |
| tiktok    | false   | false     | not_connected |
| instagram | false   | false     | not_connected |
| facebook  | false   | false     | not_connected |
| x         | false   | false     | not_connected |
| rumble    | false   | false     | manual_later  |
| website   | true    | true      | static_site   |

## API Connections

- Total: 6
- Enabled: 2
- Connected: 1
- Failing: 0

| Connection            | Enabled | Connected | Status           |
| --------------------- | ------- | --------- | ---------------- |
| youtube_data_api      | true    | true      | working          |
| youtube_analytics_api | true    | false     | needs_scope_test |
| tiktok_api            | false   | false     | future           |
| instagram_graph_api   | false   | false     | future           |
| facebook_graph_api    | false   | false     | future           |
| x_api                 | false   | false     | future           |

## Action Queue

- Total: 8
- Pending: 7
- Approved: 0
- Running: 0
- Completed: 1
- Failed: 0
- Rejected: 0

| ID                       | Type                    | Status    | Safety |
| ------------------------ | ----------------------- | --------- | ------ |
| act_1782055352107_588480 | pull_advanced_analytics | pending   | safe   |
| act_1782055342686_b561aa | sync_review             | pending   | safe   |
| act_1782055303921_4df070 | refresh_dashboard       | completed | safe   |
| act_1782055303885_c71abc | sync_review             | pending   | safe   |
| act_1782054196665_28d324 | sync_review             | pending   | safe   |
| act_1782052477255_6618ff | sync_review             | pending   | safe   |
| act_1782052034117_ecc40e | approve_video           | pending   | safe   |
| act_1782052027357_5ee23c | sync_review             | pending   | safe   |

## Backend Jobs

- Total: 8
- Enabled: 8
- Working: 7
- Testing: 1
- Failing: 0

| Job                     | Enabled | Status  | Last Success             | Last Error |
| ----------------------- | ------- | ------- | ------------------------ | ---------- |
| generate_app            | true    | working |                          |            |
| render_video            | true    | working |                          |            |
| upload_private          | true    | working |                          |            |
| sync_review             | true    | working |                          |            |
| validate_audio          | true    | working |                          |            |
| pull_advanced_analytics | true    | testing |                          |            |
| run_learning            | true    | working |                          |            |
| build_dashboard         | true    | working | 2026-06-21T15:24:09.944Z |            |

## Learning v2

- Exists: true
- Generated: 2026-06-21T15:24:29.185Z
- Confidence: low
- Videos with meaningful stats: 0

### Prefer

- App types: productivity (70.0)
- Story modes: fake_corporate_audit (70.0)
- Audio moods: corporate (70.0)

### Avoid

- App types: calculator (-70.0), button (-70.0), unknown (-70.0), object (-50.0), waiting (-15.0)
- Story modes: fake_courtroom_trial (-70.0), fake_scientific_experiment (-70.0), fake_nature_documentary (-70.0), unknown (-70.0), fake_police_chase (-30.0)
- Audio moods: unknown (-65.4), chaotic (-30.0)

## Top Videos

| Video                       | Score | Status             | Public Safe |
| --------------------------- | ----- | ------------------ | ----------- |
| Corporate Regret Board      | 70    | published_unlisted | true        |
| Loading Screen With No Exit | -15   | published_unlisted | false       |
| Staring Pebble Supreme      | -30   | local              | false       |
| Runaway Button              | -70   | private_uploaded   | false       |
| Staring Pet Rock            | -70   | private_uploaded   | false       |
| Useless To-Do List          | -70   | private_uploaded   | false       |
| Unhelpful Calculator        | -70   | private_uploaded   | false       |
| Endless Loading Spinner     | -70   | private_uploaded   | false       |

## Weak Videos

| Video                            | Score | Readiness          | Warnings      |
| -------------------------------- | ----- | ------------------ | ------------- |
| Runaway Button                   | -70   | blocked_for_public | audio_missing |
| Staring Pet Rock                 | -70   | blocked_for_public | audio_missing |
| Useless To-Do List               | -70   | blocked_for_public | audio_missing |
| Unhelpful Calculator             | -70   | blocked_for_public | audio_missing |
| Endless Loading Spinner          | -70   | blocked_for_public | audio_missing |
| The Government Calculator        | -70   | blocked_for_public | audio_missing |
| Emotionally Unhelpful Calculator | -70   | blocked_for_public | audio_missing |
| Infinite Loading Ceremony        | -70   | blocked_for_public | audio_missing |

## Next Ideas

- productivity + fake_corporate_audit + corporate: High learning score: appType=70.0

## Latest Autopilot Decision

- App: Staring Pebble Supreme
- File: apps/auto-staring-pebble-supreme.html
- App type: object
- Story mode: fake_police_chase
- Audio mode: full_mix
- Uploaded: false
- Dry run: true

### Learning Reason

```json
{
  "useLearningEngine": true,
  "selectedType": "rock",
  "learningScore": 0,
  "preferredTypes": [],
  "avoidedTypes": [],
  "note": "No videos tracked yet. Run youtube-stats-pull first."
}
```

## Next 10 Actions

- Rerender Runaway Button with production-safe audio.
- Rerender Staring Pet Rock with production-safe audio.
- Rerender Useless To-Do List with production-safe audio.
- Rerender Unhelpful Calculator with production-safe audio.
- Rerender Endless Loading Spinner with production-safe audio.


