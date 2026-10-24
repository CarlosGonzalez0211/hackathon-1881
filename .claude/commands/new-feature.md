---
description: Start a new feature branch and plan it
argument-hint: <short feature description>
---

Start work on this feature: $ARGUMENTS

1. `git switch main && git pull`, then create a branch `feat/<kebab-case-name>`.
2. Read CLAUDE.md for conventions, then outline a short plan (files in frontend/web, backend/api, shared).
3. Put types/zod schemas shared by web and api in shared first.
4. Implement, then run `pnpm lint && pnpm typecheck && pnpm build`.
