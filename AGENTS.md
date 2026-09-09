# LokoCode IDE — Base44 Dev Environment

## Overview
LokoCode IDE is a full-stack AI development platform. Frontend is React + Vite + TypeScript + Tailwind CSS. Backend is Node.js + Express + TypeScript + Prisma + PostgreSQL.

## Architecture
- **client/** — Vite dev server on port 5173 (mapped to host 3000). React SPA with Monaco editor, dashboard, IDE layout, settings, billing, VMs.
- **server/** — Express API on port 3001. Prisma ORM with PostgreSQL. JWT auth, CRUD for projects/files/workspaces, AI conversations, billing, VMs, API keys.
- **db** — PostgreSQL 16 Alpine. Database `lokocode`, user `lokocode`.
- Vite proxy forwards `/api/*` to the backend (single-origin, no CORS issues).

## Dev Commands
```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml logs -f client server
docker compose -f docker-compose.base44.yml down
```

## Key Details
- The server runs `npx prisma db push` on startup to sync schema (no migration files needed).
- JWT auth: token stored in localStorage as `lokocode_token`, sent as `Authorization: Bearer`.
- Theme: dark/light toggle stored in localStorage as `lokocode_theme`.
- Monaco editor loads from CDN (user's browser has internet).
- Terminal is simulated with common commands (ls, pwd, echo, npm, git, etc.).
- AI panel conversations are persisted in the database; AI responses are simulated locally (real provider integration requires API keys).
- VMs are stored in-memory on the server (no real virtualization).

## Secrets
- `JWT_SECRET` — required for auth token signing (generated dev placeholder).
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — optional, for real Stripe billing.
- `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` — optional, for real AI responses.
- `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET` — optional, for OAuth login.

## Verification
1. Visit the preview (port 3000) — should show the auth page.
2. Register an account → redirects to dashboard.
3. Create a project → redirects to IDE with Monaco editor.
4. Edit files, create new files from the explorer sidebar.
5. Use the terminal (type `help` for commands).
6. Use the AI panel for chat.
7. Check Settings, Billing, VMs pages.
8. Ctrl+Shift+P opens the command palette.
