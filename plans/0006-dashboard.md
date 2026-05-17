# Phase 5 — Dashboard & Progress ❌

## Goal
User dashboard: band score trends, accuracy charts, activity heatmap,
and smart exam recommendations.

## Depends On
- BE Phase 5 (progress & recommendations)

## Pages
```
/dashboard    → DashboardPage
```

## Feature Structure
```
src/features/dashboard/
  components/
    BandChart.tsx             # line chart: band score over time per skill
    AccuracyChart.tsx         # bar chart: accuracy per skill
    ProgressHeatmap.tsx       # GitHub-style activity heatmap (practice days)
    SkillRadar.tsx            # radar/spider chart: 4 skills comparison
    RecommendCard.tsx         # suggested next exam card
    StreakBadge.tsx           # current practice streak (days)
    BandSummary.tsx           # current band estimate per skill
  hooks/
    useDashboard.ts           # fetch all dashboard data
    useRecommendations.ts     # fetch recommended exams
```

## Chart Library
Use `recharts` (lightweight, React-native, tree-shakeable):
```bash
npm install recharts
```
- `LineChart` → BandChart
- `BarChart` → AccuracyChart
- `RadarChart` → SkillRadar
- Heatmap: custom CSS grid (no library needed — 7×52 grid)

## Data Fetched
```
GET /api/v1/progress?limit=30       → band + accuracy snapshots
GET /api/v1/progress/recommendations → suggested exams
```

## Dashboard Layout
```
┌─────────────────────────────────────────────┐
│  BandSummary (4 skill cards: R/W/L/S)        │
├──────────────────────┬──────────────────────┤
│  BandChart           │  SkillRadar           │
├──────────────────────┴──────────────────────┤
│  ProgressHeatmap (12-week activity)          │
├──────────────────────────────────────────────┤
│  Recommendations (3 cards)                   │
└──────────────────────────────────────────────┘
```

## Tasks
- [ ] Install `recharts`
- [ ] Create `src/features/dashboard/` folder structure
- [ ] Implement `useDashboard` hook
- [ ] Implement `useRecommendations` hook
- [ ] Implement `BandChart`
- [ ] Implement `SkillRadar`
- [ ] Implement `ProgressHeatmap` (custom CSS grid)
- [ ] Implement `RecommendCard`
- [ ] Implement `BandSummary`
- [ ] Compose `DashboardPage`
- [ ] Add `/dashboard` route to `Router.tsx`
- [ ] `npx tsc --noEmit` clean
