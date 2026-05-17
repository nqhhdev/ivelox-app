# Phase 3 — Listening Feature ❌

## Goal
IELTS listening practice with audio player. Questions answered while audio plays.
Audio files stored in Supabase Storage, streamed via signed URL from Go backend.

## Depends On
- BE Phase 2 (exam endpoints — section with audio_url)
- BE Phase 3 (practice sessions)

## Pages
```
/practice/listening/:examID  → ListeningPracticePage
```

## Feature Structure
```
src/features/listening/
  components/
    AudioPlayer.tsx           # custom player: play/pause, progress bar, speed control
    ListeningQuestion.tsx     # question during/after audio (same types as reading)
    TranscriptView.tsx        # show transcript after session completed
  hooks/
    useListening.ts           # session state, submit answers
    useAudioPlayer.ts         # audio element control (play/pause/seek/speed)
```

## Audio Player Requirements
- Play / Pause
- Scrub progress bar
- Playback speed: 0.75x, 1x, 1.25x
- Time display: current / total
- IELTS rule: audio plays once by default (can allow replay for practice)
- No volume slider needed (device volume)

## Listening Flow
```
1. Load section → get audio_url (signed URL from backend)
2. User presses Play
3. Questions displayed below player (or side panel)
4. User answers while listening (or pauses to answer)
5. Submit all → auto-scored → result page
```

## Tasks
- [ ] Create `src/features/listening/` folder structure
- [ ] Implement `useAudioPlayer` hook (HTMLAudioElement wrapper)
- [ ] Implement `AudioPlayer` component
- [ ] Implement `useListening` hook
- [ ] Implement `ListeningPracticePage`
- [ ] Add route to `Router.tsx`
- [ ] `npx tsc --noEmit` clean
