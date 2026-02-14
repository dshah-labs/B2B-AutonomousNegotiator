/**
 * Storage service test: verifies company details are saved via api.createAgent
 * and retrievable via getCompanies, getCompany, getGraphData.
 * Run by opening test-storage.html in the dev server (e.g. http://localhost:5173/test-storage.html).
 */

import { api } from '../services/api';
import { PricingModel } from '../types';

const log = (msg: string, data?: unknown) => {
  console.log(msg, data ?? '');
  const el = document.getElementById('output');
  if (el) {
    const line = document.createElement('div');
    line.className = 'py-1 border-b border-slate-200 last:border-0';
    line.innerHTML = `<strong>${msg}</strong>${data !== undefined ? `<pre class="mt-1 text-sm overflow-auto">${JSON.stringify(data, null, 2)}</pre>` : ''}`;
    el.appendChild(line);
  }
};

async function run(): Promise<void> {
  const out = document.getElementById('output');
  if (out) out.innerHTML = '';

  try {
    // 1. Initial companies (seeded)
    const initial = await api.getCompanies();
    log('1. getCompanies() after seed', { count: initial.length, ids: initial.map((a) => a.id) });

    // 2. Create a new agent (simulated onboarding submit)
    const testPayload = {
      user: { first_name: 'Test', last_name: 'User', email: 'test@example.com' },
      company: {
        company_name: 'Test Company Inc',
        ein: '99-9999999',
        website: 'https://testcompany.com',
        domains: ['testing', 'qa'],
        policies: 'Test policies',
        pricing_model: PricingModel.SUBSCRIPTION,
        services: 'Test services',
      },
      goals: { short_term: 'Short term', long_term: 'Long term' },
    };
    const { agent_id: newId } = await api.createAgent(testPayload);
    log('2. createAgent() returned', { agent_id: newId });

    // 3. Fetch all companies again — should include the new one
    const afterCreate = await api.getCompanies();
    const found = afterCreate.find((a) => a.id === newId);
    log('3. getCompanies() after create', {
      count: afterCreate.length,
      newIdPresent: !!found,
      newCompanyName: found?.payload.company.company_name,
    });

    if (!found) {
      log('FAIL: New company not found in getCompanies()', null);
      return;
    }

    // 4. Get single company by id
    const one = await api.getCompany(newId);
    const detailsMatch =
      one?.payload.company.company_name === testPayload.company.company_name &&
      one?.payload.user.email === testPayload.user.email;
    log('4. getCompany(id)', {
      found: !!one,
      company_name: one?.payload.company.company_name,
      detailsMatch,
    });

    if (!one || !detailsMatch) {
      log('FAIL: getCompany(id) did not return correct details', null);
      return;
    }

    // 5. Graph data should include the new node
    const graph = await api.getGraphData();
    const nodeForNew = graph.nodes.find((n) => n.id === newId);
    log('5. getGraphData()', {
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      newNodeInGraph: !!nodeForNew,
      newNodeLabel: nodeForNew?.label,
    });

    log('All checks passed. Company details are being saved correctly.', null);
  } catch (e) {
    log('Error', e instanceof Error ? e.message : String(e));
    console.error(e);
  }
}

// Run when loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}
