# Athena

Monorepo (pnpm workspaces), TypeScript everywhere. 4-person team, everyone full-stack.

## Layout

- `frontend/web` - Next.js 15 (App Router), Tailwind v4, shadcn/ui, Supabase Auth (browser client). Port 3000.
- `backend/api` - Fastify backend. Gemini (`@google/genai`), Supabase service client, Resend. Port 4000.
- `shared` - zod schemas + types used by both apps. Import as `@athena/shared`.

## Commands

- `pnpm dev` (both apps) / `pnpm dev:web` / `pnpm dev:api`
- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm format`
- Add a dep to one app: `pnpm --filter @athena/web add <pkg>`
- Add a shadcn component: `cd frontend/web && pnpm dlx shadcn@latest add button`

## Conventions

- Define request/response contracts as zod schemas in `shared`; validate in api, reuse types in web.
- Service clients in the api are created lazily in `backend/api/src/lib.ts`; read env via `backend/api/src/env.ts`.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never import it from frontend/web.
- New env var -> add it to `.env.example` in the same PR.
- Branch from `main` as `feat/...` or `fix/...`; open a PR, CI must pass; never push to `main` directly.
- Conventional commits (`feat:`, `fix:`, `chore:`). Small PRs, merge often.
- Never read, print or commit `.env` files.

## Athena extraction phase

Contracts in shared are proposals for team review; do not describe them as frozen. AI is an internal server-only library in ai/, and learning/analytics/data remain pending. The frontend uses deterministic mocks, no real student progress. Build shared and ai before consumers (pnpm build:platform).
