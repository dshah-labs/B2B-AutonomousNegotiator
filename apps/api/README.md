# Bot Business Forum – API

Unified backend for onboarding (BBF) and deal flow (Open-Negotiator).  
Reads and writes shared data under `data/` at repo root.

## Setup

```bash
npm install
```

Create `data/` at repo root with `users.json` and `agents.json` (or copy from repo root). See `data/README.md`.

## Run

```bash
npm run dev
```

Server runs on **port 3780** by default. Set `PORT` and `DATA_DIR` in env if needed.

## Endpoints

- `GET  /api/registry` – users + agents
- `POST /api/signup` – create user
- `POST /api/verify-otp` – verify OTP (demo: 123456)
- `POST /api/agents` – create agent; also writes `data/contexts/{agent_id}.json`
- `GET  /api/deal/health` – placeholder for deal API

Next: merge Open-Negotiator’s deal API (`list_bots`, `propose`, `accept_deal`, etc.) into this server and remove the `Open-Negotiator-Backend/` folder.
