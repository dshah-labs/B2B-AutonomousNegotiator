# Repository layout

Single monorepo for **Bot Business Forum** (onboarding + deal flow). Frontend and backend are separate apps; shared data lives in one place.

## Structure

```
Bot-Business-Forum/
├── apps/
│   ├── web/                 # (Optional later) BBF frontend move here
│   └── api/                 # Unified backend (onboarding + deal API)
│       ├── src/index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── data/                    # Shared data (single source of truth)
│   ├── users.json
│   ├── agents.json
│   └── contexts/            # One JSON per agent (written on agent create)
│
├── docs/
├── package.json             # Root (workspaces: apps/api; frontend deps at root)
├── App.tsx, index.html, index.tsx, vite.config.ts, ...  # Frontend at root for now
└── README.md
```

## Rationale

| Choice | Why |
|--------|-----|
| **apps/web** | Clear frontend boundary; Vite dev server and static build live here. |
| **apps/api** | One Node server for both BBF’s onboarding API and Open-Negotiator’s deal API; easier to share config, DB, and matching logic. |
| **data/ at root** | Single place for users, agents, and context files; both frontend (via API) and backend read/write here. No duplicated storage. |
| **Monorepo** | One clone, one set of docs; `npm install` at root installs all apps; optional shared packages later (e.g. `packages/shared-types`). |

## Commands (from repo root)

- **Install everything:** `npm install`
- **Frontend dev:** `npm run dev --workspace=apps/web` or `cd apps/web && npm run dev`
- **Backend dev:** `npm run dev --workspace=apps/api` or `cd apps/api && npm run dev`
- **Build frontend:** `npm run build --workspace=apps/web`
- **Build backend:** `npm run build --workspace=apps/api`

## Data flow

1. **Onboarding (BBF):** User completes flow in `apps/web` → `POST /api/agents` to `apps/api` → API writes `data/users.json`, `data/agents.json`, and `data/contexts/{agent_id}.json`.
2. **Deal / matching:** `apps/api` reads `data/contexts/*.json` and `data/agents.json` for `list_bots`, matching, `propose`, `accept_deal`; on deal completion, sends email (owner from context/user).
3. **Frontend:** `apps/web` talks only to `apps/api` (proxy in dev to backend port).

## Current state vs target

- **Now:** Frontend and Vite plugin API stay at **repo root** (no move yet). Backend runs in `apps/api`; shared data in `data/`.
- **Target:** Optionally move frontend into `apps/web` later; merge Open-Negotiator into `apps/api` and remove `Open-Negotiator-Backend/` folder.
- **Steps:** See [MERGE_PLAN_BBF_OPEN_NEGOTIATOR.md](./MERGE_PLAN_BBF_OPEN_NEGOTIATOR.md).
