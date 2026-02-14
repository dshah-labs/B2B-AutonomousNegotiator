# Shared data

Single source of truth for onboarding and deal flow.

| File / folder   | Purpose |
|-----------------|--------|
| `users.json`    | Owner accounts (from BBF signup). Keyed by `user_id`. |
| `agents.json`   | Bots with `company_context` and `goals`. Keyed by `agent_id`. |
| `contexts/`     | One JSON per agent (`{agent_id}.json`) for deal/claw bot; written by API on agent create. |

**Using the standalone API (`apps/api`):** point it at this folder with `DATA_DIR` (default: repo root `data/`). Copy or symlink `users.json` and `agents.json` from the repo root here if you already have data.

**Using the frontend only (Vite plugin):** the dev server uses `users.json` and `agents.json` at repo root. To switch to the shared API, run `apps/api` and proxy frontend `/api` to `http://localhost:3780`.
