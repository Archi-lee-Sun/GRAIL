# GRAIL — AI Coding Agent Context

## What This Project Is

GRAIL is a Duolingo-style desktop application that teaches prompt engineering through active, gamified learning. Users progress through structured lessons, earn XP, maintain streaks, and level up from complete beginner to expert prompt engineer. The core philosophy: users must **produce**, not just recognize. Every lesson forces the user to write real prompts and get graded by AI.

The name reflects the product's thesis: mastering how to talk to AI is the skill most people search for but few actually find.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | PostgreSQL via Supabase |
| AI Engine | Groq API (llama models) — may migrate to Anthropic Claude later |
| Desktop wrapper | Browser for now, Electron post-launch |
| Frontend | To be built after backend is complete |
| Auth | JWT + bcrypt |
| Validation | Zod |
| DB Client | node-postgres (pg) |

---

## Project Structure

```
/backend
  /src
    /config
      db.js              # Supabase/pg connection pool — exports { pool }
      graph.js           # Skill graph singleton built at startup from DB
      constants.js       # XP values, SM-2 defaults, score thresholds
    /middleware
      auth.js            # JWT verify, attaches req.user
      errorHandler.js    # Global error catcher, returns clean JSON errors
      validate.js        # Zod request body validation
    /routes
      auth.routes.js
      tracks.routes.js
      lessons.routes.js
      sessions.routes.js
      users.routes.js
      vault.routes.js
      arena.routes.js
      index.js           # Mounts all routers on /api/*
    /controllers
      auth.controller.js
      tracks.controller.js
      lessons.controller.js
      sessions.controller.js    # Most complex — handles task submission and AI grading
      users.controller.js
      vault.controller.js
      arena.controller.js
    /queries
      auth.queries.js
      tracks.queries.js
      lessons.queries.js
      sessions.queries.js
      users.queries.js
      vault.queries.js
      arena.queries.js
      srs.queries.js     # Spaced repetition reads/writes, used by multiple controllers
    /services
      ai.service.js      # ALL Groq API calls live here and only here
      srs.service.js     # SM-2 algorithm logic
      graph.service.js   # BFS/DFS on skill graph
      wilson.service.js  # Wilson Score for arena leaderboard
      streak.service.js  # Streak check and update logic
    /seed
      /data
        tracks.json
        lessons.json
        tasks.json
        vault.json
      seed.js
  app.js                 # Express setup, middleware stack, route mounting
  server.js              # http.listen, graph singleton initialization
  .env
```

---

## Database Schema Overview

### Core Tables

**users** — auth, XP, level, streak, streak_freeze_count, last_active_date

**tracks** — learning tracks (foundation, code-assistant, email-writing, image-generation, decision-making). Fields: slug, title, is_foundation, unlock_after_lesson_count, display_order

**lessons** — each lesson belongs to a track. Fields: slug, title, concept_markdown (Stage 1 content), xp_reward, display_order, track_id

**lesson_dependencies** — skill graph edges. Two columns: lesson_id and depends_on_id. BFS/DFS run on this data to determine unlock order.

**tasks** — all interactive tasks across all lessons. Fields: lesson_id, stage (2/3/4), task_type, display_order, payload (JSONB), xp_reward

**vault_entries** — named prompt library entries. Fields: slug, title, category, theory_markdown, prompt_template, example_input, example_output, unlocks_after_lesson_id

### Progress Tables

**user_lesson_progress** — status per user per lesson: locked / unlocked / in_progress / complete

**user_concept_srs** — SM-2 spaced repetition state per user per lesson: ease_factor, interval_days, repetitions, next_review_at, last_score

**task_attempts** — raw log of every task submission. Fields: user_id, task_id, session_id, stage, response_data (JSONB), score, ai_feedback (JSONB), xp_earned

**user_vault_unlocks** — which vault entries each user has unlocked

### Arena Tables

**arena_challenges** — weekly challenge: scenario, rubric_hints, week_start, is_active

**arena_submissions** — user submissions with clarity_score, context_score, specificity_score, composite_score (Wilson Score adjusted)

---

## Lesson Structure

Every lesson has exactly 4 stages:

**Stage 1 — Concept** (markdown, no tasks)
Short theory. One principle only. Lives in `lessons.concept_markdown`.

**Stage 2 — Recognition** (4-5 tasks)
Task types: `which_better` | `whats_wrong` | `rank` | `fill_blank` | `true_false`
Critical rule: wrong answers must be plausibly good and often longer than the correct answer. The app must never reward clicking the longest option. Every distractor represents a real mistake category.

**Stage 3 — Reconstruction** (2-3 tasks)
Task type: `reconstruction`
User sees a real AI output. Must write the prompt that produced it. AI engine runs their prompt, compares outputs semantically, returns similarity score.

**Stage 4 — Free Build** (1-2 tasks)
Task type: `free_build`
Open scenario. AI grades the user's prompt on three dimensions:
- Clarity (0-10)
- Context (0-10)
- Specificity (0-10)
Returns specific actionable feedback per dimension, not just a score.

### Task Payload Shapes (JSONB)

```javascript
// which_better
{ scenario, prompt_a, prompt_b, correct: 'a'|'b', explanation }

// whats_wrong
{ prompt, options: [{text, mistake_category}], correct_index, explanation }

// rank
{ scenario, prompts: [str], correct_order: [int], explanation }

// fill_blank
{ template, blank_marker: '__', scenario, options: [str], correct_index, explanation }

// true_false
{ statement, correct: bool, explanation }

// reconstruction
{ scenario_context, reference_output, reference_prompt, evaluation_criteria: [str] }

// free_build
{ scenario, rubric_hints }
```

---

## XP System

```javascript
XP_STAGE2_TASK: 5
XP_STAGE3_TASK: 10
XP_STAGE4_TASK: 15
XP_PER_LESSON: 20   // completion bonus on top of task XP
```

One full lesson = approximately 8 tasks = ~80 XP from tasks + 20 bonus = ~100 XP total.

---

## Core Algorithms

### Skill Graph — BFS/DFS
Lessons are nodes. lesson_dependencies are directed edges. Graph is built once at server startup into memory (config/graph.js). BFS finds what lessons just unlocked after a completion. DFS finds the recommended next lesson based on weakest unfinished dependency.

### Spaced Repetition — SM-2
After each lesson completion, user_concept_srs is updated. SM-2 fields: ease_factor (min 1.3, default 2.5), interval_days, repetitions, next_review_at. When user opens app, query surfaces all concepts where next_review_at <= today as review cards.

### Semantic Similarity — Stage 3 Grading
User submits a prompt. ai.service.js runs that prompt through Groq. The resulting output is compared to reference_output semantically. Returns a similarity score 0-100. Threshold for pass is defined in constants.

### AI Grading — Stage 4
ai.service.js sends user prompt + scenario + rubric_hints to Groq with a structured grading system prompt. Returns JSON with clarity, context, specificity scores and per-dimension feedback text.

### Wilson Score — Arena Leaderboard
arena_submissions stores composite_score calculated using Wilson Score. Prevents a single high score from dominating over consistent performers.

---

## API Routes

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/tracks
GET    /api/tracks/:slug
GET    /api/tracks/:slug/lessons

GET    /api/lessons/:slug
GET    /api/lessons/:slug/tasks
POST   /api/lessons/:slug/unlock

POST   /api/sessions/start
POST   /api/sessions/:id/submit-task
POST   /api/sessions/:id/complete
GET    /api/sessions/:id

GET    /api/users/me
GET    /api/users/me/progress
GET    /api/users/me/review-cards
PATCH  /api/users/me

GET    /api/vault
GET    /api/vault/:slug

GET    /api/arena/current
POST   /api/arena/submit
GET    /api/arena/leaderboard
```

All routes except `/api/auth/*` require JWT in Authorization header: `Bearer <token>`

---

## Environment Variables

```
DATABASE_URL        # Supabase PostgreSQL direct connection string
JWT_SECRET          # Minimum 32 characters
JWT_EXPIRES_IN      # '7d'
GROQ_API_KEY        # Groq API key for AI evaluation
NODE_ENV            # 'development' | 'production'
PORT                # 3000
CLIENT_URL          # Frontend origin for CORS
MOCK_AI             # 'true' during development to skip real AI calls
```

---

## Key Coding Rules

- **No raw SQL outside /queries files** — controllers never write SQL inline
- **No Groq/AI calls outside ai.service.js** — single entry point for all AI
- **No business logic in routes** — routes only map URL to controller
- **Controllers orchestrate, services compute** — controllers call queries and services, never implement algorithms themselves
- **Always use constants.js values** — never hardcode XP numbers, SM-2 defaults, or thresholds inline
- **errorHandler.js catches everything** — controllers throw, handler catches, never send res directly from a catch block
- **MOCK_AI=true during development** — ai.service.js checks this flag and returns hardcoded mock responses instead of real API calls

---

## Build Order

1. `config/` — db.js, constants.js, graph.js
2. `middleware/` — auth.js, errorHandler.js, validate.js
3. `seed/` — tracks.json, lessons.json, tasks.json, vault.json, seed.js → run seed
4. `queries/` — auth, tracks, lessons (unblocks most controllers)
5. `controllers/` — auth, tracks, lessons
6. `services/` — ai.service.js with MOCK_AI, srs.service.js, graph.service.js
7. `queries/` + `controllers/` — sessions (most complex, depends on everything above)
8. `queries/` + `controllers/` — users, vault, arena
9. Replace MOCK_AI with real Groq calls
10. Full Postman test of all endpoints

---

## Content Status

Foundation track: 15 lessons planned, Lesson 1 fully designed, lessons 2-5 placeholder content, lessons 6-15 titles only. Domain tracks: 5 tracks planned, content to be written after backend is complete. All seed data is structurally correct — content will be replaced before launch without touching any code.

---

## What This Is NOT

- Not a video course or static content site
- Not a chatbot or AI assistant
- Not a simple quiz app
- The AI is the grading engine, not the product itself