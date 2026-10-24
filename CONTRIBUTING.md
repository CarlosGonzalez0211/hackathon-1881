# Contributing

## Setup

1. Node 22 (`nvm use`) and pnpm 9 (`npm i -g pnpm@9`).
2. `pnpm install`
3. `cp .env.example .env` and `cp .env frontend/web/.env.local`; get values from the team's shared secrets.
4. `pnpm dev` - web on http://localhost:3000, api on http://localhost:4000 (`/health`).

## Workflow

1. Pick or create an issue on the GitHub Project board.
2. `git switch -c feat/short-name` from an up-to-date `main`.
3. Commit small, using conventional commits. Husky runs lint-staged on commit.
4. Open a PR using the template. CI (lint, format, typecheck, build) must be green and one teammate should review.
5. Squash-merge, delete the branch.

## Rules

- No secrets in git. Add new variables to `.env.example`.
- Shared types/schemas go in `shared`.
