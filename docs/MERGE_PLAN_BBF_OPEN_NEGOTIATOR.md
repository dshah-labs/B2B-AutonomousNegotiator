# Merge Plan: Bot-Business-Forum + Open-Negotiator-Backend

## Goal
Combine Team A (BBF) and Team B (Open-Negotiator) so that:
1. **Onboarding** (BBF) stores company details and returns an **agent_id**.
2. **Backend** uses that data to create a “claw bot” per company and drive **bot-to-bot deals**.
3. When a **deal is made**, users are **emailed**.
4. **Matching**: once a user is added, the system finds the most relevant agents for partnerships/proposals to achieve the user’s goals, and users can converse based on that.

---

## 1. Data Contract (Team A → Team B)

### What BBF produces (end of onboarding)

| Your plan | BBF current shape | Notes |
|-----------|-------------------|--------|
| **Goal.txt** | `goals` on agent | `short_term`, `long_term` |
| **Context.txt** | `company_context` on agent | company_name, domains, policies, pricing_model, services, ein, website |
| **Email, Company name** | `user` (email, first_name, last_name) + `company_context.company_name` | Owner + company |

**BBF payload today (what gets stored):**

- **users.json** (keyed by `user_id`):  
  `user_id`, `email`, `first_name`, `last_name`, `company_domain`, `created_at`, `verified`, `verification_method`, `role_title`
- **agents.json** (keyed by `agent_id`):  
  `agent_id`, `owner_user_id`, `status`, `created_at`, `company_context` (CompanyData), `goals` (short_term, long_term)

So **Goal.txt** = agent’s `goals`; **Context.txt** = agent’s `company_context` (+ user email/name from `users[owner_user_id]`).

### What Open-Negotiator expects

- **data/contexts/*.json**: one context file per company/bot (used to create the “claw bot” and for deal logic).
- Deal API: `list_bots`, `propose`, `accept_deal`, `get_proposal_status`.
- On deal completion: `dealHandler` + `emailSender` to notify both parties.

**Merge requirement:** Define a single **context schema** that:
- Is written by BBF’s backend (or a shared service) when an agent is created.
- Is read by Open-Negotiator for creating the claw bot and for matching/deals.

Suggested **context schema** (one JSON per agent, e.g. `data/contexts/{agent_id}.json`):

```json
{
  "agent_id": "agt_xxx",
  "owner_user_id": "u_xxx",
  "owner_email": "owner@company.com",
  "owner_name": "First Last",
  "company_name": "...",
  "company_context": { "company_name", "ein", "website", "domains", "policies", "pricing_model", "services" },
  "goals": { "short_term", "long_term" },
  "created_at": "..."
}
```

`company_context` and `goals` map directly from BBF’s `agents.json`; owner info from `users.json`.

---

## 2. Single source of truth for “company details”

Today:
- **BBF**: `users.json` + `agents.json` (via Vite plugin in `vite.config.ts` or localStorage fallback in `api.ts`).
- **Open-Negotiator**: `data/contexts/*.json`.

**Merge options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **A. BBF writes contexts** | When `POST /api/agents` succeeds, a backend (or Vite plugin) also writes `data/contexts/{agent_id}.json` in ONB format. | Single place that “registers” the bot. | Two formats (agents.json + contexts) unless we deprecate one. |
| **B. ONB reads BBF store** | Deal API (or a small adapter) reads `users.json` + `agents.json` and builds context in memory / caches to `data/contexts`. | One logical store (BBF). | ONB must depend on BBF file paths or an API that exposes the same data. |
| **C. Shared backend API** | One Node service serves both: BBF’s `/api/*` (signup, verify-otp, agents, registry) and ONB’s deal API. Persists to one place (e.g. `users.json` + `agents.json`) and generates `data/contexts` from that. | Single backend, clear handoff. | Requires refactor: move BBF API out of Vite plugin into this backend. |

**Recommended for minimal change:** **Option A**  
- Keep BBF’s current API and `users.json` / `agents.json` as the source of truth for onboarding.
- On each successful `POST /api/agents`, also write `data/contexts/{agent_id}.json` in the schema above (same repo or shared volume).  
- Open-Negotiator keeps using `data/contexts/*.json` to create claw bots and run deals. No change to ONB’s contract; only the producer of `contexts` is BBF’s backend.

Later you can move to **Option C** (single backend) and then remove the Open-Negotiator-Backend folder.

---

## 3. Handoff: “Create claw bot using the data”

- **Trigger:** BBF frontend calls `POST /api/agents` with `OnboardingPayload` → backend writes `agents.json` and returns `agent_id`.
- **New step:** Backend (or a small script/service) also:
  1. Reads the new agent + owner from `agents.json` and `users.json`.
  2. Writes `data/contexts/{agent_id}.json` (Open-Negotiator format).
  3. (Optional) Calls ONB’s “register bot” endpoint if you add one, or ONB just discovers new files in `data/contexts/`.

So “create claw bot” = **creating and saving the context file** (and optionally starting a Blaxel agent that uses that context and the deal API). No change to BBF frontend; only backend/plugin or a separate service.

---

## 4. Matching: “Most relevant agent for a deal”

- **Input:** New user/agent just added (agent_id, goals, company_context).
- **Output:** List of other agents that are good candidates for partnership/proposal to achieve that user’s goals.

Ways to implement:
- **Rule-based:** e.g. domain overlap, compatible pricing_model, or keyword match on goals (implement in Node next to deal API).
- **Deal API as source:** Use `list_bots` and filter/rank by context and goals (same backend).
- **LLM:** Send goals + company_context to Gemini (or same model you use in BBF) and return a ranked list of agent_ids (can live in BBF’s backend or in ONB).

Recommendation: implement a **small “matching” module** that:
- Reads all `data/contexts/*.json` (or agents.json + users).
- Takes `agent_id` (or goals + company_context).
- Returns top N candidate agent_ids (e.g. by domain overlap + goal relevance).  
Then the **conversation/deal flow** uses these candidates to suggest “partners” and drive `propose` / `accept_deal`.

---

## 5. Conversation and deal flow

- **Bot-to-bot:** Open-Negotiator’s deal API (`propose`, `accept_deal`, etc.) and MCP tools already handle the “claw bot to claw bot” communication.
- **When a deal is made:** `dealHandler` + `emailSender` notify both users (Team B requirement).  
No change needed here; only ensure the **email addresses** used for notification come from the same place as the owner (e.g. `users.json` by `owner_user_id`, or from `data/contexts/*.json` if you store `owner_email` there).

---

## 6. Implementation steps (concise)

1. **Define context schema**  
   - One JSON file per agent in `data/contexts/{agent_id}.json` with: agent_id, owner_user_id, owner_email, owner_name, company_name, company_context, goals, created_at.

2. **BBF backend: write context on agent create**  
   - In the same place that handles `POST /api/agents` (current Vite plugin or a new small Node server):
     - After writing to `agents.json`, load the new agent and its owner from `users.json`.
     - Write `data/contexts/{agent_id}.json` in the schema above.  
   - Ensure `data/contexts` is either next to BBF’s repo or in a path that Open-Negotiator reads (e.g. env `CONTEXTS_DIR`).

3. **Open-Negotiator: keep as-is**  
   - Continue to use `data/contexts/*.json` for claw bots and deal API.  
   - If ONB currently seeds contexts itself, either point it at the same `CONTEXTS_DIR` or run a one-time sync from `agents.json` + `users.json` into `data/contexts/`.

4. **Matching**  
   - Add a small matching function (rule-based or LLM) that, given an agent_id (or goals + context), returns candidate agent_ids.  
   - Expose it as e.g. `GET /api/match?agent_id=...` or from the deal API, and use it to suggest partners before calling `propose`.

5. **Emails**  
   - Ensure deal completion emails use owner email from context (or users.json). Map `owner_user_id` → `users[owner_user_id].email` when sending.

6. **Later: single backend and remove ONB folder**  
   - Move BBF’s `/api/*` (signup, verify-otp, agents, registry) into a single Node backend that also runs the deal API and matching.  
   - Serve BBF frontend as static (or via same server).  
   - Remove the separate Open-Negotiator-Backend folder once its logic lives in this backend.

---

## 7. File / repo layout (suggested)

- **Now (two pieces):**
  - `Bot-Business-Forum/` (or worktree `gza`): frontend + Vite plugin that reads/writes `users.json`, `agents.json`, and **writes** `data/contexts/{agent_id}.json`.
  - `Open-Negotiator-Backend/`: deal API, MCP, dealHandler, emailSender; reads `data/contexts/`.

- **After merge (optional):**
  - Single repo: e.g. `Bot-Business-Forum/` with `frontend/`, `backend/`, `data/contexts/`, and deal + matching logic inside `backend/`.  
  - Open-Negotiator-Backend folder removed; its code merged into `backend/`.

---

## 8. Quick reference

| Need | Where it lives |
|------|----------------|
| Goal.txt | Agent’s `goals` (short_term, long_term) in agents.json / context |
| Context.txt | Agent’s `company_context` + owner (email, name) from users.json / context |
| Agent ID | Returned by `POST /api/agents`; used as context filename and in deal API |
| Create claw bot | Write `data/contexts/{agent_id}.json` on agent create |
| Matching | New module: agents + goals → candidate agent_ids |
| Deal + email | Existing ONB dealHandler + emailSender; feed owner email from context/users |

This plan keeps BBF responsible up to “store company details and return agent_id,” and makes the backend (BBF + ONB merged) responsible for context files, matching, and deal flow until you remove the Open-Negotiator-Backend folder.
