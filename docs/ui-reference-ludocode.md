# iVelox UI/UX Reference Decision

**Date:** 2026-05-17  
**Status:** Approved for design direction  
**Primary reference:** Ludocode  
**Reference repo:** <https://github.com/jokerhutt/ludocode>

## 1. Decision Summary

For iVelox, the strongest single open-source design reference is **Ludocode**.

It is the best fit because it combines:

- a game-like learning loop
- a structured lesson progression model
- modern React UI patterns
- animated feedback and completion states
- enough seriousness to adapt into IELTS practice

This matters because iVelox is not a casual vocabulary toy. It needs to support:

- Reading practice with long passages
- Listening drills and timed answers
- Writing submissions with AI feedback
- Speaking recording and scoring
- long-term progress tracking

Many game UIs are visually loud but structurally weak for exam prep. Ludocode is different: it offers a **gamified shell** that can wrap serious content without turning the product into a cartoon.

## 2. Why Ludocode Was Chosen

### 2.1 Product fit

Ludocode is closer to a guided learning platform than a pure arcade game. That matches iVelox better than quiz-show clones or party games.

It gives us a clean reference for:

- lesson maps
- linear and branching progression
- step-by-step learning screens
- completion rewards
- motion that supports momentum

### 2.2 Technical fit

Ludocode uses a frontend stack close to the direction of iVelox:

- React
- modern state/query patterns
- shadcn/ui style component composition
- motion libraries for progression feedback

That means its design ideas are easier to reinterpret in the current repo than a random Unity game or a mobile-only Flutter app.

### 2.3 UX fit

The key UX advantage is that Ludocode feels like:

- a system with forward motion
- a learning path with visible checkpoints
- a product that rewards completion

That is exactly the emotional layer missing from traditional IELTS sites such as `ieltsonlinetests.com`, which are strong in content volume but weak in motivation, delight, and retention.

## 3. Why Other References Were Not Selected As The Primary One

### 3.1 ClassQuiz / Kahoot-like references

Strengths:

- strong excitement
- live competition
- leaderboard energy
- fast rounds

Why not primary:

- too dependent on synchronous play
- better for mini-games than full IELTS prep
- not ideal as the main shell for reading, writing, and speaking workflows

Use later for:

- vocab battle
- live classroom mode
- timed challenge rooms

### 3.2 Wordle-style clones

Strengths:

- clean daily challenge loop
- strong replayability
- shareable results

Why not primary:

- too narrow in interaction vocabulary
- better as a side mechanic than a core product reference

Use later for:

- paraphrase challenge
- collocation puzzle
- synonym ladder

### 3.3 Brain-training mini-game repos

Strengths:

- short feedback loops
- retry-friendly
- strong “one more try” feeling

Why not primary:

- too abstract for IELTS
- weak mapping to long-form practice flows

Use later for:

- scanning drills
- speed reading warmups
- listening reaction drills

## 4. Design Goal For iVelox

The target is not “copy Ludocode”.

The target is:

> Build an IELTS product with the motivational structure of a game, while preserving the credibility and clarity of a serious exam-prep tool.

That means iVelox should feel like:

- progress is visible
- effort is rewarded quickly
- full mock tests feel meaningful
- weak skills are surfaced clearly
- practice is broken into smaller winnable units

## 5. Core UX Principles To Inherit From Ludocode

### 5.1 Forward motion is always visible

The user should always know:

- where they are
- what comes next
- what they gain after completing the current step

Application in iVelox:

- skill map for Reading / Listening / Writing / Speaking
- progress bars within drills
- “Next recommended practice” on the home screen

### 5.2 One primary action per screen

Ludocode-style interfaces work because each view has a dominant action.

Application in iVelox:

- Home: continue today’s mission
- Reading drill: answer current question
- Writing drill: submit response
- Speaking drill: start or stop recording
- Feedback screen: review and continue

### 5.3 Completion must feel rewarding

A serious product still needs payoff. The user should feel closure after effort.

Application in iVelox:

- XP gain after each drill
- streak confirmation
- band-impact summary after practice
- celebratory completion card after daily mission

### 5.4 Large goals must be decomposed

IELTS is intimidating when shown as one giant exam. Game-like UX reduces anxiety by splitting it into smaller units.

Application in iVelox:

- “Reading inference drill”
- “Matching headings sprint”
- “Speaking part 2 challenge”
- “Writing cohesion fix session”

### 5.5 Feedback should be immediate and structured

Do not make users wait for value.

Application in iVelox:

- instant correctness for objective questions
- immediate transcript preview for speaking
- AI feedback blocks with:
  - score
  - why
  - example
  - next action

## 6. What To Translate Into iVelox

## 6.1 Home screen

Inspired by Ludocode’s progression shell, the iVelox home should prioritize:

- current streak
- total XP
- current league or tier
- target band
- next mission
- weak skill alert
- recent score trend

Recommended home sections:

1. Hero panel
   - “Today’s mission”
   - CTA: `Continue practice`
2. Skill path cards
   - Reading
   - Listening
   - Writing
   - Speaking
3. Weekly progress
   - heatmap
   - band trend
4. Unlockables
   - new challenge
   - new mock test
   - new badge

## 6.2 Reading UX

Traditional IELTS sites often overload the user with text. The Ludocode lesson model suggests a cleaner flow.

Recommended reading modes:

- `Drill mode`
  - one focused task type
  - short session
  - high tempo
- `Exam mode`
  - full passage
  - timed
  - minimal distraction

Recommended drill examples:

- heading match sprint
- T/F/NG burst
- inference check
- synonym hunt

Layout direction:

- desktop: two-column layout
  - left = passage
  - right = questions
- mobile: stacked cards with sticky question navigator

Gamified additions:

- combo streak for correct answers
- speed bonus for fast correct answers
- reveal animations that confirm progress, not fireworks overload

## 6.3 Listening UX

Listening works well with game rhythms because it naturally supports timed rounds.

Recommended loop:

1. preview task
2. play clip
3. answer
4. immediate review
5. reward and continue

Useful mechanics:

- section progress meter
- limited replay rules depending on mode
- milestone checkpoint after each part

Game-inspired layer:

- “perfect section” badge
- speed and accuracy summary
- daily listening streak

## 6.4 Writing UX

Writing cannot be reduced to arcade mechanics. The game layer should sit around the serious task, not replace it.

Recommended structure:

- clean writing workspace
- task prompt card
- timer
- word count
- rubric tracker
- submission payoff

Gamified elements should be subtle:

- mission framing:
  - “Task 2 argument challenge”
  - “Cohesion repair session”
- progress tracker by rubric dimension:
  - task response
  - coherence
  - lexical resource
  - grammar
- unlock band milestones over time

Do not add noisy animations while the user is writing.

## 6.5 Speaking UX

Speaking is the strongest opportunity for a game-like loop after vocabulary.

Recommended flow:

1. prompt reveal
2. prep countdown
3. recording state
4. transcript review
5. AI score breakdown
6. retry or continue

Game-inspired mechanics:

- confidence meter
- pronunciation streak
- “clean response” badge
- character-like coach reactions

This is the closest area to ELSA-style engagement, but the outer shell can still follow Ludocode’s progression model.

## 7. Recommended Information Architecture

Suggested product structure for the current frontend:

```text
/
  dashboard
  mission
  skills
    /reading
    /listening
    /writing
    /speaking
  drills
    /reading/:type
    /listening/:type
    /writing/:type
    /speaking/:type
  mock-tests
  progress
  rewards
  profile
```

Current routes in the repo are minimal:

- `/login`
- `/auth/callback`
- `/`

This is enough for the foundation phase, but the product should expand toward the structure above rather than staying as a single post-login page.

## 8. Visual Direction

Ludocode is the behavioral reference, not the final art direction.

For iVelox, the visual style should be:

- more premium than playful
- energetic but not childish
- sharp and modern
- easy to read for long study sessions

Recommended visual characteristics:

- strong card hierarchy
- clear CTA colors
- restrained animation
- section backgrounds with subtle identity colors
- expressive typography for headings
- highly legible body text

Recommended theme direction:

- background: warm light neutral
- primary text: deep navy
- accent: teal or blue
- skill colors:
  - Reading: blue
  - Listening: amber
  - Writing: coral or rose
  - Speaking: teal

Avoid:

- generic SaaS dashboard appearance
- too many gradients
- neon game visuals
- heavy glassmorphism
- excessive dark-first design for study content

## 9. Interaction Patterns To Reuse

The following patterns should be treated as first-class design targets:

### 9.1 Mission cards

Each day, surface 2 to 4 actionable tasks:

- 1 reading drill
- 1 listening drill
- 1 speaking attempt
- 1 writing revision or vocabulary challenge

### 9.2 Skill map

Instead of showing only “practice history”, provide a visible track:

- foundation
- skill builders
- timed drills
- mock tests
- mastery checkpoints

### 9.3 Reward loop

After any completed activity, display:

- XP earned
- streak status
- skill impact
- next recommendation

### 9.4 Recovery loop

When the user fails or performs poorly, the system should not feel punitive.

Recommended response:

- short correction
- practice tip
- retry CTA
- easier recovery drill

### 9.5 Progress economy

Use a simple progression economy:

- XP for every completed action
- streak for daily consistency
- badges for milestones
- tiers or leagues for weekly motivation

Do not add too many currencies.

## 10. Mechanics That Fit IELTS Best

These mechanics are worth implementing.

### 10.1 Daily mission

Best for:

- retention
- habit formation
- home screen clarity

### 10.2 XP

Best for:

- visible reward after every session
- leveling lightweight actions, not just mock tests

### 10.3 Streak

Best for:

- daily return behavior

### 10.4 Skill badges

Best for:

- celebrating milestones by domain

Examples:

- `Listening Clean Run`
- `Reading 10 Combo`
- `Writing Task 2 Finisher`
- `Speaking Comeback`

### 10.5 Weekly league

Best for:

- small-group motivation
- friend competition

This should be phase 2, not MVP.

## 11. Mechanics That Should Be Used Carefully

### 11.1 Leaderboards

Risk:

- can feel fake in small communities
- can demotivate serious learners if too noisy

Use only when:

- there is enough active participation
- weekly reset is clear

### 11.2 Character mascots

Risk:

- can cheapen the brand
- can feel childish for exam prep

If used, keep them minimal and coach-like.

### 11.3 Over-animation

Risk:

- breaks concentration
- makes long-form study tiring

Animation should celebrate transitions, not invade study time.

## 12. Mapping To Current Repo

Current repo already contains:

- auth flow
- protected home route
- shadcn button foundation
- Tailwind setup

Relevant files:

- `src/app/Router.tsx`
- `src/pages/Home/HomePage.tsx`
- `src/pages/Auth/LoginPage.tsx`
- `src/index.css`

Recommended next structure:

```text
src/
  features/
    dashboard/
    missions/
    reading/
    listening/
    writing/
    speaking/
    rewards/
  shared/
    ui/
    hooks/
    api/
  pages/
    Dashboard/
    Reading/
    Listening/
    Writing/
    Speaking/
    Rewards/
```

## 13. Component Inventory

The following components should be planned early:

- `DailyMissionPanel`
- `SkillProgressCard`
- `XPBadge`
- `StreakChip`
- `LeagueCard`
- `QuestionStepper`
- `PracticeResultCard`
- `WeaknessInsightCard`
- `BandScorePill`
- `RewardModal`
- `SkillPathMap`
- `SpeakingRecorderCard`
- `TranscriptReviewPanel`
- `WritingRubricPanel`

## 14. Motion Guidelines

Motion should be added deliberately.

Allowed:

- route transition fades
- progress fill animations
- completion card reveal
- small score count-up
- hover emphasis on interactive cards

Avoid:

- bouncing layouts
- constant pulsing buttons
- distracting particle effects during study

Rule:

> Motion should reinforce progress, not compete with concentration.

## 15. Content Strategy Layer

`ieltsonlinetests.com` is useful as a content structure reference, but not as the product experience reference.

Use that source mainly for:

- section breakdown
- question type taxonomy
- exam simulation logic

Do not copy:

- dense information layout
- weak emotional feedback
- low retention interaction patterns

The right model is:

- content structure from IELTS prep sites
- engagement shell from Ludocode

## 16. MVP Recommendation

For the first strong visual milestone, build these 5 screens:

1. `Dashboard`
   - streak
   - XP
   - daily mission
   - skill cards
2. `Reading Drill`
   - short focused drill
   - progress and combo
3. `Speaking Drill`
   - prompt, recording, transcript, result
4. `Writing Result`
   - rubric breakdown and next actions
5. `Reward Modal`
   - XP, streak, unlock, continue CTA

This set is enough to prove the product direction before full mock-test coverage.

## 17. Phase Plan

### Phase 1: Gamified shell

Build:

- dashboard
- missions
- XP/streak model
- reward modal
- skill cards

### Phase 2: High-retention drills

Build:

- reading mini-drills
- listening mini-drills
- vocab and paraphrase challenges
- speaking drill loop

### Phase 3: Serious exam workflows

Build:

- full reading practice
- full listening practice
- writing exam mode
- speaking mock test mode

### Phase 4: Social layer

Build:

- leagues
- friend comparisons
- shared challenges

## 18. Final Recommendation

Use **Ludocode** as the primary open-source reference for iVelox.

Treat it as the blueprint for:

- progression
- motivation
- lesson framing
- reward cadence

Then combine it with:

- IELTS-specific exam structure from `ieltsonlinetests.com`
- stronger speaking feedback ideas from ELSA-style products
- optional mini-game mechanics later from quiz and word-game references

This is the most defensible direction if the product goal is:

- attractive UI/UX
- game-like retention
- serious IELTS usefulness

## 19. External References

- Ludocode repo: <https://github.com/jokerhutt/ludocode>
- Ludocode showcase post: <https://www.reddit.com/r/react/comments/1rrvabi/i_built_an_opensource_duolingostyle_code_learning/>
- IELTS Online Tests: <https://ieltsonlinetests.com/>
