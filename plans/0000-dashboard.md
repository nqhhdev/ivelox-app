# iVelox Frontend — Implementation Roadmap

## Status Legend
- ✅ Done
- 🔄 In progress
- ❌ Not started

## Phases

| Phase | Name | Depends on BE phase | Status |
|---|---|---|---|
| 0 | Foundation | — | ✅ |
| 1 | Reading Feature | BE Phase 2 + 3 | ❌ |
| 2 | Writing Feature | BE Phase 3 + 4 | ❌ |
| 3 | Listening Feature | BE Phase 2 + 3 | ❌ |
| 4 | Speaking Feature | BE Phase 3 + 4 | ❌ |
| 5 | Dashboard & Progress | BE Phase 5 | ❌ |
| 6 | Tips | BE Phase 6 | ❌ |
| 7 | Polish & PWA | All features | ❌ |

## Phase Files
- [0001 — Foundation](0001-foundation.md)
- [0002 — Reading](0002-reading.md)
- [0003 — Writing](0003-writing.md)
- [0004 — Listening](0004-listening.md)
- [0005 — Speaking](0005-speaking.md)
- [0006 — Dashboard](0006-dashboard.md)
- [0007 — Tips](0007-tips.md)
- [0008 — Polish & PWA](0008-polish-pwa.md)

## Architecture Reminder
- MVVM: Component → Hook → apiClient → Go Backend
- Feature folder: `src/features/<skill>/components/` + `hooks/`
- Page folder: `src/pages/` — thin wrappers only, no logic
- Shared code only in `src/shared/`
- No cross-feature imports
