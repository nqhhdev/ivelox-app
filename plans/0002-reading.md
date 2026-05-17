# Phase 1 — Reading Feature ❌

## Goal
Full IELTS reading practice flow: browse exams → start session → read passage →
answer questions → review results. Includes hover-translate feature.

## Depends On
- BE Phase 2 (exam endpoints)
- BE Phase 3 (practice sessions)

## Pages
```
/exams                    → ExamListPage
/exams/:id                → ExamDetailPage (sections overview)
/practice/reading/:id     → ReadingPracticePage (main practice UI)
/practice/sessions/:id    → SessionResultPage (shared with other skills)
```

## Feature Structure
```
src/features/reading/
  components/
    TranslatablePassage.tsx   # passage with hover-translate
    MCQQuestion.tsx           # multiple choice
    FillBlankQuestion.tsx     # fill in the blank
    TrueFalseQuestion.tsx     # true/false/not given
    MatchingQuestion.tsx      # matching headings
    QuestionPanel.tsx         # right panel: question list
    ReadingTimer.tsx          # countdown timer
    ResultCard.tsx            # per-answer result display
  hooks/
    useReading.ts             # session state, submit answer, auto-score display
    useTranslation.ts         # hover → call GET /exams/:id/sections/:sid?lang=vi
```

## Hover-Translate Behaviour
- User selects text in passage → floating tooltip appears
- Tooltip calls `GET /api/v1/exams/:examID/sections/:sectionID?lang=vi`
- Response includes full translated passage — client highlights matching sentence
- No per-sentence API call: translate entire section once, cache in TanStack Query
- Both original and translated sentences highlighted simultaneously

## Key Components

### TranslatablePassage
```tsx
// Props: content (original), translation (translated | null), lang
// On text select: show TranslateTooltip
// When translation loaded: highlight matching sentence pair
```

### useTranslation hook
```tsx
const { translation, requestTranslation } = useTranslation(examID, sectionID)
// requestTranslation(lang) → calls apiClient.get(...)
// result cached by TanStack Query key [examID, sectionID, lang]
```

## State Management
- Session state in `useReading` hook (TanStack Query mutation for submit)
- Timer state local to `ReadingTimer` component
- No Zustand — only auth session uses Zustand

## Pages to Create
```
src/pages/Exam/ExamListPage.tsx
src/pages/Exam/ExamDetailPage.tsx
src/pages/Practice/ReadingPracticePage.tsx
src/pages/Practice/SessionResultPage.tsx
```

## Tasks
- [ ] Create `src/features/reading/` folder structure
- [ ] Implement `useReading` hook (start session, submit answer, get results)
- [ ] Implement `useTranslation` hook
- [ ] Implement `TranslatablePassage` component
- [ ] Implement question type components (MCQ, FillBlank, TrueFalse, Matching)
- [ ] Implement `ReadingPracticePage` layout (split: passage | questions)
- [ ] Implement `ExamListPage` + `ExamDetailPage`
- [ ] Implement `SessionResultPage`
- [ ] Add routes to `src/app/Router.tsx`
- [ ] `npx tsc --noEmit` clean
