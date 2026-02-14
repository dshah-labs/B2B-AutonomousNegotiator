/**
 * Unified API: onboarding (BBF) + deal API (Open-Negotiator).
 * Reads/writes data/ at repo root (users.json, agents.json, contexts/).
 *
 * Run: npm run dev (from apps/api) or npm run dev:api (from repo root)
 * Default port: 3780 (same as ONB deal-api).
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const DATA_DIR = process.env.DATA_DIR || path.join(REPO_ROOT, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const AGENTS_FILE = path.join(DATA_DIR, 'agents.json');
const CONTEXTS_DIR = path.join(DATA_DIR, 'contexts');
const PORT = Number(process.env.PORT) || 3780;
const DEMO_OTP = '123456';

const readJson = async <T>(filePath: string, fallback: T): Promise<T> => {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = async (filePath: string, data: unknown) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
};

const app = express();
app.use(cors());
app.use(express.json());

// ----- Onboarding (BBF) -----

app.get('/api/registry', async (_req, res) => {
  try {
    const users = await readJson<Record<string, unknown>>(USERS_FILE, {});
    const agents = await readJson<Record<string, unknown>>(AGENTS_FILE, {});
    res.json({ users, agents });
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
});

app.post('/api/signup', async (req, res) => {
  try {
    const userData = req.body as Record<string, unknown>;
    const users = await readJson<Record<string, unknown>>(USERS_FILE, {});
    const userId = `u_${crypto.randomUUID()}`;
    const newUser = {
      ...userData,
      user_id: userId,
      created_at: new Date().toISOString(),
      verified: false,
      verification_method: 'otp',
    };
    users[userId] = newUser;
    await writeJson(USERS_FILE, users);
    res.json(newUser);
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };
    if (otp !== DEMO_OTP) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }
    const users = await readJson<Record<string, unknown>>(USERS_FILE, {});
    const entry = Object.entries(users).find(([, u]) => (u as any)?.email === email);
    if (entry) {
      (entry[1] as any).verified = true;
      await writeJson(USERS_FILE, users);
    }
    res.json({ status: 'success' });
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
});

app.post('/api/agents', async (req, res) => {
  try {
    const payload = req.body as { user?: { user_id?: string }; agent?: { company_context?: unknown; goals?: unknown } };
    const agents = await readJson<Record<string, unknown>>(AGENTS_FILE, {});
    const agentId = `agt_${crypto.randomUUID().slice(0, 8)}`;
    const newAgent = {
      agent_id: agentId,
      owner_user_id: payload?.user?.user_id ?? 'unknown',
      status: 'active',
      created_at: new Date().toISOString(),
      company_context: payload?.agent?.company_context ?? {},
      goals: payload?.agent?.goals ?? {},
    };
    agents[agentId] = newAgent;
    await writeJson(AGENTS_FILE, agents);

    // Write context file for deal/claw bot (Open-Negotiator format)
    const users = await readJson<Record<string, unknown>>(USERS_FILE, {});
    const owner = users[newAgent.owner_user_id as string] as Record<string, unknown> | undefined;
    const context = {
      agent_id: agentId,
      owner_user_id: newAgent.owner_user_id,
      owner_email: owner?.email ?? '',
      owner_name: [owner?.first_name, owner?.last_name].filter(Boolean).join(' '),
      company_name: (newAgent.company_context as Record<string, unknown>)?.company_name ?? '',
      company_context: newAgent.company_context,
      goals: newAgent.goals,
      created_at: newAgent.created_at,
    };
    await fs.mkdir(CONTEXTS_DIR, { recursive: true });
    await writeJson(path.join(CONTEXTS_DIR, `${agentId}.json`), context);

    res.json({ agent_id: agentId });
  } catch (e) {
    res.status(500).json({ message: (e as Error).message });
  }
});

// ----- Placeholder for deal API (merge Open-Negotiator here) -----
app.get('/api/deal/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api', deal: 'placeholder' });
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT} (data: ${DATA_DIR})`);
});
