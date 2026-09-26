# CLAUDE.md

This file tells Claude Code what this project is, how it is built, and how to work on it. Read it fully before making changes. Keep the "Progress" section at the bottom up to date as work gets done.

## What we are building
This is a prototype of a vibe-coding platform (a product where you describe an app in plain language and AI builds it). It is a take-home assignment(vibecoding allowed) for Lyzr. The current Architect product serves non-technical users. Version 2.0 must serve both non-technical users and developers.

The judges rank the work in this order:

1. Design, UI/UX and user flows (most important)
2. Feature coverage (every major feature has a flow, even if fake)
3. Working functionality (bonus points)

This means a polished, believable, complete flow beats a deep but narrow implementation. When choosing between making one thing really work or making three screens feel right, prefer the three screens, unless the thing is on the "must really work" list below.

## Core product ideas

These decisions shape every screen. Do not drift from them without asking.

**One project, two views.** Every project can be seen in Simple view or Developer view, switched with a toggle in the workspace header. The toggle is per project and can be changed at any time. It is not an account setting. Simple view hides code and technical errors and speaks in plain language. Developer view shows the file tree, code, diffs, logs and framework choices. Both views show the same project data.

**Plan before build.** When a user submits a prompt, Architect first replies with a short plan in plain English (which agents, which pages, which integrations). The user can approve it, edit it, or ask for changes. Building starts only after approval.

**Never a dead end.** Every button leads somewhere. Every loading state explains what is happening. Every error says what went wrong and offers a next action (in Simple view, usually a single "Fix it for me" button).

## What really works vs what is dummy

Must really work (Phase 1):

- Sign up, log in, log out with email and password
- Projects saved in PostgreSQL, listed on the dashboard, persisting across reloads
- Chat messages saved per project
- Plan generation and chat replies from the OpenAI API
- Simple/Developer view toggle saved per project

Dummy (realistic fake behaviour):

- The build itself. The backend returns a scripted sequence of build steps and the frontend animates them with realistic timing.
- The app preview. It shows one of a few pre-made sample apps stored in the frontend. OpenAI picks the closest one from a fixed list of template keys.
- Generated files in Developer view. They come from the same sample app, shown as read-only code.
- GitHub, deploy, import and agent testing flows (Phase 2). Buttons, modals and status changes all work visually, backed by fake data.

Rule for dummy flows: they must look and feel real. Use real-looking data, realistic delays (300 ms to 2 s per step), and correct loading, success and error states. Never show "TODO", "Coming soon" or lorem ipsum in the UI.

## Tech stack

Frontend (`/frontend`):

- React 18 with TypeScript, built with Vite
- Tailwind CSS for styling
- React Router for pages
- TanStack Query for fetching and caching server data
- lucide-react for icons

Backend (`/backend`):

- Python 3.11+, FastAPI
- SQLAlchemy 2.0 (ORM) with Alembic for database migrations
- Pydantic v2 for request and response schemas
- PostgreSQL 16
- passlib with bcrypt for password hashing, PyJWT for tokens
- Official `openai` Python SDK

Local development: PostgreSQL runs in Docker via `docker-compose.yml`. Frontend and backend run directly on the machine.

Deployment (later): frontend on Vercel, backend on Render or Railway, database on Neon or Supabase Postgres.

## Folder structure

```
/
├── CLAUDE.md
├── docker-compose.yml          # local Postgres
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx             # routes
│   │   ├── api/                # fetch wrappers, one file per resource
│   │   ├── components/         # shared UI pieces (Button, Modal, Toggle...)
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   └── workspace/      # chat, preview, build progress, view toggle
│   │   ├── sample-apps/        # pre-made apps shown in the dummy preview
│   │   ├── mocks/              # fake data for dummy flows
│   │   └── styles/tokens.css   # design tokens (colors, type, spacing)
│   └── .env.example
└── backend/
    ├── app/
    │   ├── main.py             # FastAPI app, CORS, router registration
    │   ├── config.py           # settings loaded from environment variables
    │   ├── db.py               # engine and session
    │   ├── models/             # SQLAlchemy models
    │   ├── schemas/            # Pydantic schemas
    │   ├── routers/            # auth.py, projects.py, chat.py, build.py
    │   ├── services/           # openai_service.py, build_simulator.py
    │   └── deps.py             # get_db, get_current_user
    ├── alembic/
    ├── requirements.txt
    └── .env.example
```

## Data model (Phase 1)

- `users`: id (UUID), email (unique), name, password_hash, auth_provider ("email" now, "google" later), created_at
- `projects`: id, user_id, name, description, initial_prompt, view_mode ("simple" or "developer"), status ("draft", "planning", "building", "ready", "error"), template_key (nullable), created_at, updated_at
- `messages`: id, project_id, role ("user" or "assistant"), content (text), steps (JSONB, list of action steps shown under an assistant message), created_at
- `plans`: id, project_id, content (JSONB with agents, pages, integrations), status ("proposed", "approved", "revised"), created_at

Every query on projects, messages and plans must be filtered by the logged-in user. A user must never see another user's data.

## API (Phase 1)

All routes are under `/api`. Responses are JSON. Errors use FastAPI's `HTTPException` with a clear `detail` message.

Auth:
- `POST /api/auth/signup` body: name, email, password
- `POST /api/auth/login` body: email, password
- `POST /api/auth/logout`
- `GET /api/auth/me`

The JWT (JSON Web Token) is stored in an httpOnly cookie, so frontend JavaScript never touches it. Tokens expire after 7 days.

Projects:
- `GET /api/projects`
- `POST /api/projects` body: prompt. Creates the project, asks OpenAI for a name and a plan, returns both.
- `GET /api/projects/{id}`
- `PATCH /api/projects/{id}` body: any of name, view_mode
- `DELETE /api/projects/{id}`

Chat and plan:
- `GET /api/projects/{id}/messages`
- `POST /api/projects/{id}/messages` body: content. Saves the user message, gets an assistant reply from OpenAI, saves and returns it.
- `POST /api/projects/{id}/plan/approve`

Build (dummy):
- `POST /api/projects/{id}/build` starts a simulated build and sets status to "building"
- `GET /api/projects/{id}/build` returns the scripted steps with their timings, and the final status

## OpenAI usage

- All OpenAI calls live in `backend/app/services/openai_service.py`. Routers never call OpenAI directly.
- The model name comes from the `OPENAI_MODEL` environment variable. Do not hardcode it.
- Plan generation must return structured JSON (use the SDK's structured output / JSON mode) with this shape: `{ "project_name": str, "summary": str, "agents": [{ "name", "role", "tools": [] }], "pages": [{ "name", "purpose" }], "integrations": [], "template_key": one of the keys in sample-apps }`.
- Validate the response with a Pydantic model. If parsing fails, retry once, then fall back to a sensible default plan so the user never sees a crash.
- The system prompt tells the model it is Architect, an assistant that plans agentic apps, and that it must write in plain language when the project is in Simple view and may use technical terms in Developer view.
- Never send the API key to the frontend.

## Environment variables

Backend `.env`:
```
DATABASE_URL=postgresql+psycopg://architect:architect@localhost:5432/architect
JWT_SECRET=change-me
OPENAI_API_KEY=
OPENAI_MODEL=
FRONTEND_ORIGIN=http://localhost:5173
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:8000
```

Keep `.env.example` files updated whenever a new variable is added. Never commit real `.env` files.

## Commands

```
# database
docker compose up -d

# backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# frontend
cd frontend
npm install
npm run dev
```

After changing a SQLAlchemy model, create a migration with `alembic revision --autogenerate -m "short description"` and check the generated file before applying it.

## Design direction

The product is a workspace people stay in for hours, so the UI should feel calm and precise, not flashy. Put boldness in one place: the moment an app is being built and appears in the preview. Everything else stays quiet.

- Base palette (define these as CSS variables in `styles/tokens.css` and use only these through Tailwind config):
  - `--surface` #F4F6F8 (app background)
  - `--panel` #FFFFFF (panels and cards)
  - `--ink` #16202A (main text)
  - `--muted` #5B6875 (secondary text)
  - `--line` #DCE2E8 (borders)
  - `--accent` #3355FF (primary actions, active states, the build progress)
  - `--danger` #D0342C, `--success` #1F8A5B
- Fonts: IBM Plex Sans for the interface, IBM Plex Mono only for code, file names and logs.
- Sentence case for all text. No all-caps labels. No emoji in the UI.
- Button text says exactly what happens ("Approve plan", "Deploy to production"), and the same word is used in the resulting message ("Plan approved").
- Empty states tell the user what to do next, with a button to do it.
- Vary corner radius and shadow by hierarchy. Do not make everything an identical rounded card.
- Must work down to a 1280 px wide laptop screen. The workspace is desktop-first; the dashboard and auth pages must also work on mobile.
- Visible keyboard focus on every interactive element.

## Pages and layout (Phase 1)

- `/login` and `/signup`: single centered form, link between them.
- `/` (dashboard): large prompt box at the top ("Describe the app you want to build"), an "Import a project" secondary action next to it (opens a dummy modal for now), then the user's projects as a list or grid with name, status and last updated time, then a small row of starter templates.
- `/project/:id` (workspace): header with project name (editable), Simple/Developer toggle, and a Deploy button (disabled in Phase 1 with a tooltip). Left panel is the chat, with the plan shown as a special message that has Approve and Edit buttons. Right panel is the preview; in Developer view the right panel gets tabs: Preview, Code, Logs.

## Coding conventions

- TypeScript strict mode. No `any` unless there is a comment explaining why.
- Components are function components with hooks. One component per file.
- Server data goes through TanStack Query hooks in `src/api/`, not raw fetch calls inside components.
- Python code uses type hints everywhere. Routers stay thin; logic goes in `services/`.
- Keep functions small and names descriptive. Prefer clarity over cleverness.
- Handle loading and error states for every request in the UI.

## How to work in this repo

- Build in small steps. After each step, make sure the app still runs, then stop and summarise what changed.
- Only build what the current phase asks for. If you think something from a later phase is needed now, ask first.
- Do not install new libraries without saying why.
- When a decision is not covered here, pick the option that makes the user flow clearer, and mention the choice in your summary.
- Update the "Progress" section below when a task is finished.

## Roadmap

**Phase 1: foundation (current)**
1. Repo setup: Docker Postgres, FastAPI skeleton, Vite React app, Tailwind with design tokens
2. Database models and first Alembic migration
3. Email/password auth (backend routes and frontend pages), protected routes
4. Dashboard: create project from prompt, list projects, delete project
5. Workspace layout with chat panel and preview panel
6. OpenAI plan generation and plan message with Approve/Edit
7. Chat replies from OpenAI, saved to the database
8. Dummy build: animated progress steps, then sample app in the preview
9. Simple/Developer toggle with Developer tabs (Preview, Code, Logs)

**Phase 2: feature coverage (dummy flows)**
- Google sign-in (real, if time allows)
- Agent section: agent canvas, agent settings panel, test playground, framework picker
- GitHub integration: connect, create or link repo, commit history, sync status
- Deploy panel: preview vs production, environment variables, custom domain, deploy history with rollback, logs
- Import project: from GitHub, zip upload, or another platform's export, with a "here's what I understood" summary
- Checkpoints: restore the project to an earlier chat message
- Click-to-edit in the preview

**Phase 3: polish and extras**
- Agent monitoring: conversations, failures, step-by-step traces
- Usage and credits meter
- Team members and roles, comments on the preview
- Settings page: profile, connected accounts, API keys, billing
- Onboarding for first-time users
- Deployment of the whole prototype and README with design decisions

## Progress

- [ ] Phase 1, step 1: repo setup