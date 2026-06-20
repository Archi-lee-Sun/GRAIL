# 🏆 GRAIL — Master Prompts

> A Duolingo-style desktop web application for learning prompt engineering
> through active, structured practice.

---

## What is GRAIL?

GRAIL is an interactive learning platform that teaches users how to write
effective AI prompts through a gamified, lesson-based experience. Instead
of passive reading, users progress through structured lessons with four
distinct learning stages, get their prompts graded by a real AI, earn XP,
maintain streaks, and compete on weekly leaderboards.

## Purpose

GRAIL was built as the final project for the course **"Software Engineering
Practical Course: User Interface and Interaction Design"** at Kutaisi
International University (KIU), Georgia.

The goal was to build something genuinely real — not a mock, not a
prototype, but a fully functional application that could realistically be
launched as a product. Real AI grading, real algorithms, real data
persistence, real email verification, and a complete dual-theme design
system. Every technical and product decision was made with that standard
in mind.

---

## Features

### 🗺️ Learning Path
- Lessons organized into tracks: Foundation, Code Assistant,
  Email & Professional Writing, Decision Making & Strategy
- Domain tracks unlock after completing Foundation lessons
- Winding visual path with mushroom-shaped lesson nodes
- Node icons reflect lesson stage (book / question bubble / pencil)
- Node colors reflect lesson state (red = current, purple = complete,
  grey = locked)

### 📚 Four-Stage Lesson Loop
Every lesson has four stages the user must pass in order:
1. **Concept** — Read the theory in markdown format
2. **Recognition** — 5 multiple choice tasks (which is better, true/false,
   what's wrong, ranking, fill the blank). Need 4/5 correct to pass.
3. **Reconstruction** — 2 AI-graded tasks. Need composite score ≥ 5.0
4. **Free Build** — 1 open prompt task. AI grades on clarity, depth,
   and structure. Need composite score ≥ 5.0

### 🤖 AI Grading
- Prompts are graded by Groq API (llama-3.1-8b-instant)
- Per-criterion scoring with detailed written feedback
- Visual score bars that turn vivid green (≥7) or vivid red (<7)
  per criterion
- PASSED / FAILED badges with composite score display

### 🏟️ Weekly Arena
- One active challenge per week
- Users submit their best prompt for the scenario
- Scored on clarity, context, and specificity
- UPSERT logic keeps only the user's best submission
- Leaderboard ranked by Wilson Score algorithm

### 🏅 Leaderboard
- Top 100 arena participants
- Gold / silver / bronze medal badges for top 3
- Colored left-border accent per rank
- Your entry highlighted with violet outline

### 🗄️ Vault
- Named prompt library unlocked as lessons are completed
- Entries organized by category (Analysis, Reasoning, etc.)
- Each entry has theory, a reusable prompt template,
  example input, and example output

### 📊 XP, Streaks & Gamification
- XP awarded per completed stage and task
- Daily streak tracking with streak freeze mechanic
- Level system based on cumulative XP
- Navbar displays fire (streak), diamond (XP), snowflake (freezes)
  with glowing icons

### 🌙 Light / Dark Mode
- Full dark mode (dark forest green palette — the default)
- Full light mode (warm off-white parchment palette with vivid accents)
- Toggle persists across sessions via localStorage
- Toggle available on login and register pages as well

### ✉️ Email Verification
- Registration requires real email verification
- A 6-digit code is sent to the user's email address via Gmail SMTP
- Code expires after 10 minutes
- Codes are stored in-memory with expiry — no additional database table required
- Confirm password field with match validation on the registration form

### 🔁 Spaced Repetition (Backend Complete)
- SM-2 algorithm implemented for concept review scheduling
- `next_review_at` computed per lesson after completion
- Frontend implementation planned for future release

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL via Supabase (Session Pooler, SSL)
- **Auth:** JWT (7-day expiry) + bcrypt password hashing
- **AI:** Groq API — llama-3.1-8b-instant
- **Email:** Nodemailer via Gmail SMTP
- **Algorithms:**
  - SM-2 Spaced Repetition (review scheduling)
  - Multi-source BFS (learning path finder)
  - Wilson Score (leaderboard ranking)

### Frontend
- **Framework:** React + Vite
- **Routing:** react-router-dom
- **Styling:** 100% inline styles, no UI libraries
- **Design system:** custom dark forest / warm parchment dual-theme

grail/

├── backend/

│   ├── src/

│   │   ├── config/          # DB pool, constants

│   │   ├── controllers/     # Route handlers

│   │   ├── queries/         # Raw SQL queries

│   │   ├── routes/          # Express routers

│   │   ├── services/        # AI, SRS, BFS, Wilson, streak,

│   │   │                    # email, verification logic

│   │   └── seed/            # Seed data and seed script

│   └── server.js

└── frontend/

└── src/

├── pages/           # Dashboard, Lesson, Arena, Vault,

│                    # Leaderboard, Login, Register

└── components/      # Navbar, shared UI

---

## Project Structure

---

## API Endpoints (20+)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/send-verification` | Send email verification code |
| POST | `/api/auth/verify-code` | Verify the code |
| GET | `/api/tracks` | List all tracks |
| GET | `/api/tracks/:slug/lessons` | Lessons for a track |
| GET | `/api/lessons/:slug` | Lesson detail |
| GET | `/api/lessons/:slug/stage/:stage` | Stage content |
| POST | `/api/lessons/:slug/stage/:stage/answer` | Submit answer |
| POST | `/api/lessons/:slug/stage/:stage/complete` | Complete stage |
| GET | `/api/users/me/dashboard` | Dashboard data |
| GET | `/api/users/me/reviews` | Due SRS reviews |
| GET | `/api/users/me/learning-path/:lessonId` | BFS path |
| GET | `/api/vault` | All unlocked vault entries |
| GET | `/api/vault/:slug` | Single vault entry |
| GET | `/api/arena/current` | Active arena challenge |
| POST | `/api/arena/:id/submit` | Submit arena prompt |
| GET | `/api/arena/:id/leaderboard` | Arena leaderboard |

---

## Database Schema (12 tables)

`users` · `tracks` · `lessons` · `lesson_dependencies` · `tasks` ·
`user_lesson_progress` · `task_attempts` · `user_concept_srs` ·
`vault_entries` · `user_vault_unlocks` · `arena_challenges` ·
`arena_submissions`

---

## How to Run

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- Groq API key
- Gmail account with App Password enabled

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/grail.git
cd grail

# Backend
cd backend
npm install
cp .env.example .env
# Fill in all required variables in .env
node src/seed/seed.js    # Seed the database
node server.js           # Start backend on port 3000

# Frontend (new terminal)
cd frontend
npm install
npm run dev              # Start frontend on port 5173
```

### Environment Variables

DATABASE_URL=

NODE_ENV=

PORT=

JWT_SECRET=

JWT_EXPIRES_IN=

GROQ_API_KEY=

MOCK_AI=

CLIENT_URL=

EMAIL_USER=yourgmail@gmail.com

EMAIL_PASS=your16characterapppassword

For `EMAIL_PASS`, generate a Gmail App Password from
`myaccount.google.com → Security → App Passwords`.

---

## How It Was Built

### Backend
The database schema, system architecture, and overall backend structure
were designed collaboratively between the developer and Claude (Anthropic).
Every line of backend code was written by the developer — controllers,
queries, routes, services, algorithms, and all business logic. Claude
assisted with identifying bugs, discussing design tradeoffs, and solving
specific technical problems throughout development. At the final stages of
the project, OpenAI Codex made minor touches to the backend specifically
to fix a small number of bugs that were discovered during end-to-end
testing — but the backend codebase is overwhelmingly developer-written.

### Frontend
The frontend was built using OpenAI Codex as a coding tool. The developer
and Claude (Anthropic) co-designed every screen — layout decisions, design
system, component structure, UX flows, and all styling instructions were
specified through detailed prompts written collaboratively. Codex
implemented those specifications. All design decisions, UX logic, and
product direction came from the developer working with Claude.

---

## Known Limitations & Current State

> ⚠️ The application currently runs on seed/test data created for
> development and demonstration purposes. This is intentional for the
> scope of this project submission. Real production content would be
> added in a live deployment.

### Planned Improvements

- **Reviews UI** — The spaced repetition backend (SM-2 algorithm,
  `user_concept_srs` table, `/api/users/me/reviews` endpoint) is fully
  implemented. The frontend implementation — a dashboard notification
  showing due reviews and an inline review flow — is planned for the
  next release.

- **Production content** — Lesson content, vault entries, and arena
  challenges are currently seed data. Expanded, higher-quality content
  would be added progressively in a live product.

- **UI/UX refinements** — Further design polish and mobile responsiveness
  improvements are planned as the project matures.

---

## Author

**Archil Sanikidze**
Freshman, Computer Science
Kutaisi International University (KIU), Georgia

---

## License

MIT
