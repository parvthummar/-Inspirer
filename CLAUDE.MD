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
- The app preview. It is a website-style mock-up generated from the project's plan (`features/site-preview/`): navigation from its pages, a landing page from its summary and agents, and a fitting layout per page (list, form, chat, dashboard, calendar, sign-in), filled with example content. It doesn't run the project's code.
- Generated files in Developer view (projects Architect built): example source from the pre-made sample apps plus files generated from the plan, shown as read-only code. Imported GitHub projects show their real code instead.
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

Deployment: frontend on Vercel (root `frontend/`, `vercel.json` sends `/api/*` to the `api/proxy.js` function (region cle1, near Render and Neon), which forwards it to the backend so the login cookie is first-party; a plain external rewrite timed out from Vercel's edge; `BACKEND_URL` overrides the Render address, and sends other paths to `index.html`), backend on Render (`render.yaml` blueprint; runs `alembic upgrade head` on start), database on Neon. `DATABASE_URL` accepts Neon's `postgresql://...` URL as is (the psycopg driver is added in `config.py`). `FRONTEND_ORIGIN` can list several origins, comma-separated. `VITE_API_URL` stays unset on Vercel.

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
- `projects`: id, user_id, name, description, initial_prompt, view_mode ("simple" or "developer", default "developer"), status ("draft", "planning", "building", "ready", "error"), template_key (nullable), created_at, updated_at
- `messages`: id, project_id, role ("user" or "assistant"), content (text), steps (JSONB, list of action steps shown under an assistant message), created_at
- `plans`: id, project_id, content (JSONB with agents, pages, integrations), status ("proposed", "approved", "revised"), created_at

Every query on projects, messages and plans must be filtered by the logged-in user. A user must never see another user's data.

## API (Phase 1)

All routes are under `/api`. Responses are JSON. Errors use FastAPI's `HTTPException` with a clear `detail` message.

Auth:
- `POST /api/auth/signup` body: name, email, password
- `POST /api/auth/login` body: email, password
- `POST /api/auth/google` body: credential (Google ID token from the "Continue with Google" button). Verifies it against Google's keys, creates the account on first sign-in, or logs into an existing account with the same verified email.
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/auth/me` body: name
- `POST /api/auth/password` body: current_password, password

The JWT (JSON Web Token) is stored in an httpOnly cookie, so frontend JavaScript never touches it. Tokens expire after 7 days.

Projects:
- `GET /api/projects`
- `POST /api/projects` body: prompt. Creates the project with status "planning" and returns it straight away; OpenAI writes the name and plan in the background (the workspace polls and shows progress).
- `GET /api/projects/{id}`
- `PATCH /api/projects/{id}` body: any of name, view_mode
- `DELETE /api/projects/{id}`

Chat and plan:
- `GET /api/projects/{id}/messages`
- `POST /api/projects/{id}/messages` body: content. Saves the user message, gets an assistant reply from OpenAI, saves and returns it.
- `POST /api/projects/{id}/plan` body: optional feedback. Writes a new plan (or revises the current one with the feedback) in the background; the project is "planning" until the plan message appears.
- `PATCH /api/projects/{id}/plan` body: plan content. Saves the user's edits to the proposed plan.
- `POST /api/projects/{id}/plan/approve`

Build (dummy):
- `POST /api/projects/{id}/build` starts a simulated build and sets status to "building"
- `GET /api/projects/{id}/build` returns the scripted steps with their timings, and the final status
- Approving the plan starts the build automatically; `POST /build` is used to rebuild (e.g. "Fix it for me").

Checkpoints:
- `POST /api/projects/{id}/checkpoints/restore` body: message_id. Removes every message and plan version after that message and restores the project snapshot stored on it (messages have `has_checkpoint`).
- `POST /api/projects/{id}/edits` body: element, instruction, change, file. Saves a click-to-edit change as a chat exchange (no AI call); requires status "ready".

Usage:
- `GET /api/usage` returns credits used this month (plans 5, chat replies 1, builds 10; Starter plan 500 credits, resets on the 1st), with a breakdown by kind and by project.

GitHub import (real, public repositories):
- `GET /api/github/analyze?repo=owner/name` reads a public repository (metadata, languages, file list, README, dependency files) and returns a summary: description, stack, pages, services, languages, notes. Cached per server process.
- `POST /api/projects` accepts an optional `source` ({type: "github", owner, name}); the server re-reads the repository and stores it in `projects.source` (with the file list).
- `GET /api/projects/{id}/files` lists the imported repository's files; `GET /api/projects/{id}/files/content?path=` returns one file's text (from raw.githubusercontent.com, only for paths in the imported list; binary and >400 KB files are flagged).
- `POST /api/projects/{id}/files/pull` reads the imported repository again from GitHub (ignoring the cache), updates the stored file list and returns how many files were added, removed or changed.

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
COOKIE_SECURE=false
GOOGLE_CLIENT_ID=
GITHUB_TOKEN=            # optional; raises GitHub's limit from 60 to 5000 requests an hour
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=
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
  - `--on-accent` (white): text on solid accent, danger or success backgrounds. `--terminal` / `--terminal-ink`: log panels, dark in both themes.
  - Dark theme: warm graphite (surface #121110, panel #1B1A18, text #ECE8E1, muted #A39E95, line #2E2C29) with a soft periwinkle accent #93A4FF and dark text on accent buttons; all text pairs checked at 6.5:1 or better. Defined under `:root[data-theme="dark"]` in `tokens.css`. Never hard-code colours (including glows: use `rgb(var(--accent-rgb)/…)`); use tokens so both themes work.
- Fonts: IBM Plex Sans for the interface, IBM Plex Mono only for code, file names and logs.
- Sentence case for all text. No all-caps labels. No emoji in the UI.
- Button text says exactly what happens ("Approve plan", "Deploy to production"), and the same word is used in the resulting message ("Plan approved").
- Empty states tell the user what to do next, with a button to do it.
- Vary corner radius and shadow by hierarchy. Do not make everything an identical rounded card.
- Must work down to a 1280 px wide laptop screen. The workspace is desktop-first; the dashboard and auth pages must also work on mobile.
- Visible keyboard focus on every interactive element.

## Pages and layout (Phase 1)

- `/login` and `/signup`: single centered form, link between them.
- `/` (home): sidebar layout; the prompt box ("Describe the app you want to build") centred on the page; a "+" button in the bottom-left of the prompt box opens the import dialog.
- `/projects`: all projects as a grid with name, status and last updated time. `/templates`: starter templates; picking one fills the prompt on the home page.
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

- [x] Phase 1, step 1: repo setup (Docker Postgres 16, FastAPI skeleton with `/api/health`, Alembic wired to settings, Vite React 18 + TS, Tailwind with design tokens)
- [x] Phase 1, step 2: database models (users, projects, messages, plans) and first Alembic migration `ae4e01685453`
- [x] Phase 1, step 3: email/password auth (JWT in httpOnly cookie `architect_session`, 7 days), login/signup pages, protected routes, account menu with log out
- [x] Phase 1, step 4: dashboard (prompt box, project grid with delete, starter templates, dummy import modal for GitHub/zip/other platform). Project name is drafted from the prompt until OpenAI names it in step 6.
- [x] Phase 1, step 5: workspace layout (header with rename, Simple/Developer toggle saved per project, disabled Deploy with tooltip; resizable chat panel with real messages; preview panel in a browser frame with device sizes and per-status placeholders). Assistant replies are a fixed placeholder until step 7.
- [x] Phase 1, step 6: OpenAI plan generation in the background (structured output, one retry, fallback plan), plan card in chat with Approve plan / Edit plan / Ask for changes, earlier versions collapsed, `messages.plan_id` migration. Approving does not start a build yet (step 8).
- [x] Phase 1, step 7: chat replies from OpenAI with project, plan and last 20 messages as context; structured output decides if a message asks for plan changes and then revises the plan in the background. Fallback reply when OpenAI is unavailable.
- [x] Phase 1, step 8: approving the plan starts a scripted build (`build_simulator.py`, steps generated from the plan, 0.5 to 2 s each, stored in `projects.build_state`); live steps in chat and a top-to-bottom reveal of the app in the preview; 5 interactive sample apps (support desk, leave tracker, sales CRM, meeting notes, ops dashboard) with their own accent; full-page preview at `/project/:id/preview`; "Fix it for me" rebuilds on error.
- [x] Phase 1, step 9: Developer view tabs. Preview stays mounted; Code shows a file tree and read-only highlighted viewer (sample-app source via Vite `?raw` plus backend/agent/integration files generated from the approved plan; files appear as build steps finish); Logs is a terminal-style panel with build logs in step with the build and live runtime logs once ready. Simple view shows only the preview.
- [x] Phase 2: agent section. Agents tab in both views: canvas (trigger, agents, tools, integrations, handoff), settings panel (plain in Simple; model, temperature, max steps, memory in Developer), simulated test playground with step traces, framework picker in Developer view that changes the generated agent code. Agent settings are dummy data kept per project in the browser (localStorage); a new plan resets them. Google sign-in skipped for now (needs OAuth client credentials).
- [x] Phase 2: GitHub integration (dummy). Header button with sync dot opens a dialog: simulated account authorisation, create a repository (owner, name, visibility) or link an existing one, setup progress, then repository overview with sync status (up to date / changes to pull / changes to push), Sync now, auto-push toggle, commit history derived from the build steps, and disconnect. State kept in the browser (account shared, repository per project).
- [x] Phase 2: deploy panel (dummy). Header Deploy button (enabled once built, green dot when live) opens a drawer: Overview (preview vs production, deploy with confirm, live steps and logs, blocks on missing keys), Environment/Keys (managed and required variables from the plan's integrations, masked values), Domain (custom domain, DNS records, check DNS, HTTPS), History (versions, logs, roll back or restore). Preview host is now `<slug>-preview.architect.app`, production `<slug>.architect.app`. State kept in the browser via `lib/localStore.ts` (also used by the agent and GitHub stores).
- [x] Phase 2: import project. Dashboard modal: choose source (GitHub link or your repos when GitHub is connected, zip, Lovable/Bolt/Replit/v0 export), simulated analysis, then a "Here's what I understood" review (plain summary, pages, agents, services, things to know, collapsible stack/files/languages, editable name). Importing creates a real project whose first message is built from the summary, so the plan continues the app.
- [x] Phase 2: checkpoints (real). Messages store a snapshot of project state (`messages.snapshot`, migration `9ef303305319`) whenever Architect posts one; "Restore to here" on hover in the chat, with confirmation, removes later messages and plan versions and restores status, name, template, build and plan statuses. Agent settings, GitHub and deploy state (browser-only) are not rolled back.
- [x] Phase 2: click-to-edit in the preview. "Click to edit" toggle in the browser frame; hover outlines elements with a name, click opens a popover. Text, colour, size, bold, rounded and hide are applied instantly (DOM overrides kept per project in the browser, tied to the chat message so checkpoint restores undo them) and confirmed in chat via `POST /edits`; other requests go to Architect as a normal chat message with the element as context.
- [x] Phase 3: usage and credits meter. Real usage counted from the database (`usage_service.py`); credits left and a bar in the dashboard header (red from 80%), "Usage and credits" in the account menu; dialog with breakdown, per-project bars and plans (upgrade is a request, no payment).
- [x] Phase 3: onboarding. Welcome tour (four steps: Simple vs Developer view with the toggle first, then describe, plan, build) for users with no projects (ends in the prompt box). The flag is kept per user in the browser. (A "Getting started" checklist was added and later removed at the user's request.)
- [x] Phase 3: settings page at `/settings/:section`. Profile (name and password, real), connected accounts (GitHub shares the workspace connection; Slack and Google Drive simulated), API keys (create once-shown key, masked list, revoke; browser only), billing and usage (shared `UsageSummary`, invoices empty state). Linked from the account menu.
- [x] Phase 3: agent monitoring (dummy). Monitor tab in both views once built: stat tiles, conversations-per-hour chart, filters (all / needs attention, agent, 24 h / 7 days), live run list, run detail with conversation, step trace (tool calls, timings, tokens in Developer view), and failures explained in plain words with "Fix it for me". Runs generated from the approved plan (`mocks/monitorData.ts`), repeatable per project.
- [x] Phase 3: team and comments (dummy, browser only). Share button in the workspace header: invite by email as Editor or Viewer, change role, remove, resend, link sharing for the preview; invites are accepted automatically after a few seconds. Comment mode in the preview toolbar: click to drop numbered pins (per app page), threads with replies, resolve/reopen, show resolved; joined teammates reply after a few seconds.
- [x] Fix: switching agent framework crashed the page (infinite update loop in `FrameworkPicker`: the save ran in an effect that depended on a callback recreated by the save). Finishing now happens in the timer with the callback in a ref; same hardening in `RepoSetupProgress`.
- [x] Demo labels: `DemoBadge` (hover/focus explanation) and `DemoNotice` (banner) mark every simulated area: preview "Sample data", simulated build, Monitor, Code "Example code", Logs, import summary, Deploy, GitHub, Share, comment replies, Agents, connected accounts, API keys, plans.
- [x] App shell with sidebar for the dashboard and settings (`components/AppShell.tsx`, `Sidebar.tsx`): logo, New project (focuses the prompt), Home / Templates / Settings, recent projects with a status line ("Ready to try", "Pick up where you left off", "Drafting a plan…", "Building now…", "Needs your attention") and last-updated time, upgrade card with plan and credits, profile menu opening upwards; credits pill in the top-right; slide-in drawer below the `lg` breakpoint. The workspace keeps its own header. `AppHeader` removed.
- [x] Home is just the prompt (centred); the Getting started checklist was removed; projects and templates moved to their own pages (`/projects`, `/templates`) linked from the sidebar.
- [x] Resizable sidebar (200 to 400 px, default 256): drag the edge, arrow keys, double-click to reset; width remembered in the browser. The drag handle is now the shared `components/PanelResizer.tsx`, also used between chat and preview.
- [x] Hideable sidebar: hide button next to the logo, dragging the edge to within about an inch (96 px) of the window edge (or pressing left at the minimum) hides it, Ctrl/Cmd+B toggles it, and a show button appears at the top left when hidden. It comes back at its previous width; hidden state is remembered in the browser.
- [x] Prompt box: import is a "+" button in its bottom-left, the shortcut hint was removed, and any non-blank prompt (1+ characters) can be planned; the backend trims and accepts 1 to 4000 characters.
- [x] Fix: in the workspace the whole page scrolled (chat, file tree and code moved together). The Code tab's grid row grew with its content, and the chart's screen-reader table escaped its panel. Now the workspace never scrolls, each tab panel clips to its space, the Code grid row is capped (`grid-rows-[minmax(0,1fr)]`), and the file tree and code scroll separately. Checked in headless Chrome on all five tabs.
- [x] Code tab: the divider between the file list and the code is draggable (160 to 480 px, default 220), with arrow keys and double-click to reset; the width is remembered in the browser. Uses the shared `PanelResizer`.
- [x] Real GitHub import: the import review reads the actual public repository (`github_service.py`, migration `f9143ff94903` adds `projects.source`), the first plan is written from the real README and stack, and the Code tab of imported projects shows the repository's real files (available before any build), with a link to GitHub. The preview is still an example app. Zip and other-platform imports are still simulated.
- [x] New projects open in Developer view (model default and migration `0ead0f30fde5`); existing projects keep their view, and the toggle still switches per project.
- [x] Light, dark and system themes: `lib/theme.ts` (choice saved in the browser, follows the OS on "System"), an inline script in `index.html` applies it before first paint, `ThemeSwitcher` in the account menu and Settings > Profile > Appearance, plus a one-click sun/moon `ThemeToggleButton` in the top bar (next to the credits pill, and next to the avatar in the workspace). Text on solid colours uses `text-on-accent`; log panels use the `terminal` colours. Checked in headless Chrome.
- [x] Dark theme restyled to warm graphite with a periwinkle accent (was blue-grey with electric blue); home prompt box tightened (2 rows, less padding).
- [x] Dark is the default for anyone who hasn't chosen a theme (`DEFAULT_THEME` in `lib/theme.ts`, kept in step with the `index.html` script); a saved Light or System choice is kept.
- [x] Preview is now a website mock-up generated from the plan (`PlanSite`), replacing the pre-made sample apps in the preview, build reveal and full-page preview (they remain as example code in the Code tab). Each project gets its own brand colour; works with device sizes, dark mode, click-to-edit and comments. Labelled "Mock-up".
- [x] Code tab toolbar. Built projects: "Download code" zips every file in the browser (`lib/zip.ts`, a small store-only zip writer, no library) and "Sync with GitHub" opens the (simulated) GitHub dialog. Imported repositories: "Download code" is GitHub's own branch zip, "Pull latest" really re-reads the repo, plus "Open on GitHub"; pushing back needs GitHub sign-in (not in the prototype).
- [x] Phase 2: Google sign-in (real). Google Identity Services button on login and signup; backend verifies the ID token with PyJWT (`pyjwt[crypto]`) against Google's public keys. Only the OAuth client ID is needed (no secret). Google-only accounts have no password (`has_password` false) and get a clear message on password login. When deploying, add the production frontend URL to Authorized JavaScript origins in Google Cloud.
- [x] Hosting prepared (Vercel proxy, Render blueprint in Ohio next to Neon us-east-2, Neon URL handling). Migrations applied on Neon and an end-to-end API check passed there (signup, login, project, plan, chat, approve, build, view toggle, usage, delete). Vercel and Render not deployed yet.
