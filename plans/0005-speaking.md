# Phase 4 — Speaking Feature ❌

## Goal
IELTS speaking practice with audio recording, Groq Whisper transcription,
and Gemini AI feedback.

## Depends On
- BE Phase 3 (practice sessions)
- BE Phase 4 (AI scoring — Groq + Gemini)

## Pages
```
/practice/speaking/:examID   → SpeakingPracticePage
```

## Feature Structure
```
src/features/speaking/
  components/
    SpeakingPrompt.tsx        # display question / cue card
    SpeakingRecorder.tsx      # record audio: start/stop, waveform visualization
    RecordingTimer.tsx        # countdown (Part 1: ~30s, Part 2: 2min, Part 3: ~1min)
    TranscriptView.tsx        # show Whisper transcript after submission
    SpeakingFeedback.tsx      # AI score + criteria (fluency, lexical, grammar)
  hooks/
    useSpeaking.ts            # session state, submit audio, poll for score
    useRecorder.ts            # MediaRecorder API wrapper
    useAIFeedback.ts          # same polling pattern as writing
```

## Recording Flow
```
1. Display speaking prompt / cue card
2. User presses Record → MediaRecorder captures audio (webm/opus)
3. Timer counts down
4. User stops → audio preview
5. Submit → POST /api/v1/practice/speaking (multipart)
6. Poll GET /api/v1/practice/sessions/:id every 3s until transcript + score ready
7. Show TranscriptView + SpeakingFeedback
```

## useRecorder Hook
```tsx
// Wraps MediaRecorder API
// Returns: { isRecording, start, stop, audioBlob, audioURL }
// Format: audio/webm;codecs=opus (supported in all modern browsers)
// Fallback: audio/mp4 for Safari
```

## Browser Permissions
- Request `getUserMedia({ audio: true })` on component mount
- Show permission denied message if blocked
- No video permission needed

## Waveform Visualization
- Use Web Audio API `AnalyserNode` for real-time amplitude bars during recording
- Simple canvas or CSS bar animation — no heavy library needed

## Tasks
- [ ] Create `src/features/speaking/` folder structure
- [ ] Implement `useRecorder` hook (MediaRecorder + Web Audio API)
- [ ] Implement `SpeakingRecorder` component with waveform
- [ ] Implement `RecordingTimer`
- [ ] Implement `useSpeaking` hook
- [ ] Implement `SpeakingFeedback` component (reuse `FeedbackPanel` pattern from writing)
- [ ] Implement `SpeakingPracticePage`
- [ ] Add route to `Router.tsx`
- [ ] Test on Safari (audio/mp4 fallback)
- [ ] `npx tsc --noEmit` clean
