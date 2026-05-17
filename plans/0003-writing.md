# Phase 2 — Writing Feature ❌

## Goal
IELTS writing practice with AI feedback from Gemini 2.0 Flash.
Task 1 (graph/diagram description) and Task 2 (essay).

## Depends On
- BE Phase 3 (practice sessions)
- BE Phase 4 (AI scoring)

## Pages
```
/practice/writing/:examID    → WritingPracticePage
```

## Feature Structure
```
src/features/writing/
  components/
    WritingPrompt.tsx         # display task prompt + image (Task 1)
    WritingEditor.tsx         # textarea with word count
    WritingTimer.tsx          # countdown (Task 1: 20min, Task 2: 40min)
    FeedbackPanel.tsx         # AI score + breakdown by criteria
    BandBadge.tsx             # display band score (e.g. "Band 6.5")
  hooks/
    useWriting.ts             # submit essay, poll for AI score, display feedback
    useAIFeedback.ts          # TanStack Query: GET session result (poll until scored)
```

## Writing Flow
```
1. Display prompt (Task 1 or Task 2)
2. User writes in WritingEditor (word count shown)
3. Submit → POST /api/v1/practice/answers → { submitted: true }
4. Poll GET /api/v1/practice/sessions/:id every 3s until ai_score is populated
5. Show FeedbackPanel with band score + criteria breakdown
```

## Polling Strategy
```tsx
// useAIFeedback.ts
useQuery({
  queryKey: ['session', sessionID],
  queryFn: () => apiClient.get(`/practice/sessions/${sessionID}`),
  refetchInterval: (data) => data?.answers[0]?.ai_score ? false : 3000,
})
```

## FeedbackPanel Display
- Overall band score (large)
- 4 criteria scores: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range
- Overall feedback paragraph
- "Try again" button

## Tasks
- [ ] Create `src/features/writing/` folder structure
- [ ] Implement `WritingEditor` with word count
- [ ] Implement `WritingTimer`
- [ ] Implement `useWriting` hook
- [ ] Implement `useAIFeedback` hook (polling)
- [ ] Implement `FeedbackPanel`
- [ ] Implement `WritingPracticePage`
- [ ] Add route to `Router.tsx`
- [ ] `npx tsc --noEmit` clean
