# B2B Autonomous Negotiator

AI-powered negotiation platform: onboarding for business bots (Bot Business Forum) plus deal API and context storage for bot-to-bot negotiation.

## What’s in this repo

- **Frontend (onboarding):** React + Vite app – sign up, OTP, company context, goals, create agent. Uses Gemini for autofill and goal suggestions.
- **API (`apps/api`):** Node/Express server – same onboarding endpoints plus `data/contexts/` for deal/claw bot. Optional; frontend can run with built-in Vite API.
- **Data:** `users.json` and `agents.json` (repo root for Vite dev); `data/` for the standalone API.

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 7+

## Run steps

### 1. Clone and install

```bash
git clone https://github.com/johri-lab/B2B-AutonomousNegotiator.git
cd B2B-AutonomousNegotiator
npm install
```

This installs root and workspace dependencies (including `apps/api`).

### 2. Set Gemini API key (for autofill and goal generation)

Create a `.env` file in the project root (do not commit it):

```bash
echo "GEMINI_API_KEY=your_key_here" > .env
```

Or export before running:

```bash
export GEMINI_API_KEY=your_key_here
```

Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run the frontend (onboarding UI)

```bash
npm run dev
```

- Opens at **http://localhost:3000** (or next free port, e.g. 3001, 3002).
- Uses the Vite dev server’s built-in API; data is stored in `users.json` and `agents.json` at the repo root.
- **Demo OTP:** use `123456` when asked for the verification code.

### 4. (Optional) Run the standalone API

If you want to use the shared `data/` and context files:

```bash
npm run dev:api
```

- API runs at **http://localhost:3780**.
- Reads/writes `data/users.json`, `data/agents.json`, and `data/contexts/`.
- To have the frontend use this API instead of the Vite API, configure a proxy in `vite.config.ts` to forward `/api` to `http://localhost:3780`.

## Scripts (from repo root)

| Command        | Description                          |
|----------------|--------------------------------------|
| `npm run dev`  | Start Vite frontend (onboarding UI). |
| `npm run dev:api` | Start API server on port 3780.    |
| `npm run build`   | Build frontend for production.   |
| `npm run preview` | Preview production build.         |

## Data model

- **Users** (`users.json`): `user_id`, `email`, `first_name`, `last_name`, `company_domain`, `verified`, `role_title`, etc.
- **Agents** (`agents.json`): `agent_id`, `owner_user_id`, `company_context`, `goals` (short_term, long_term).
- **Contexts** (`data/contexts/{agent_id}.json`): Written by the API on agent create; used for deal/claw bot.

## Docs

- [Repository layout](docs/REPO_LAYOUT.md) – apps, data, and migration notes.
- [Merge plan (BBF + Open-Negotiator)](docs/MERGE_PLAN_BBF_OPEN_NEGOTIATOR.md) – data contract and integration steps.

## License

See repository settings.
