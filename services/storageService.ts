/**
 * In-memory storage for companies/agents created through onboarding.
 * Used by the graph visualization and company list endpoints.
 */

import type { OnboardingPayload } from '../types';

export interface StoredAgent {
  id: string;
  created_at: string;
  payload: OnboardingPayload;
}

const agents: Map<string, StoredAgent> = new Map();

let idCounter = 1;
function nextId(): string {
  return `agt_${String(idCounter++).padStart(3, '0')}`;
}

export const storage = {
  add(payload: OnboardingPayload): string {
    const id = nextId();
    agents.set(id, {
      id,
      created_at: new Date().toISOString(),
      payload,
    });
    return id;
  },

  getAll(): StoredAgent[] {
    return Array.from(agents.values());
  },

  get(id: string): StoredAgent | undefined {
    return agents.get(id);
  },

  /** Seed with initial data (e.g. sample companies). Ids must not conflict with nextId(). */
  seed(entries: StoredAgent[]): void {
    entries.forEach((e) => agents.set(e.id, e));
  },

  isEmpty(): boolean {
    return agents.size === 0;
  },
};
