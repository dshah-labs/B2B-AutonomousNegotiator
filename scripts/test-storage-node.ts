/**
 * Node script to verify storage service: company details are saved and retrievable.
 * Run: npx vite-node scripts/test-storage-node.ts
 */

import { api } from '../services/api';
import { PricingModel } from '../types';

async function run(): Promise<void> {
  console.log('Storage service test (Node)\n');

  // 1. Initial companies (seeded)
  const initial = await api.getCompanies();
  console.log('1. getCompanies() after seed:', { count: initial.length, ids: initial.map((a) => a.id) });

  // 2. Create a new agent
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
  console.log('2. createAgent() returned:', { agent_id: newId });

  // 3. Fetch all companies again
  const afterCreate = await api.getCompanies();
  const found = afterCreate.find((a) => a.id === newId);
  console.log('3. getCompanies() after create:', {
    count: afterCreate.length,
    newIdPresent: !!found,
    newCompanyName: found?.payload.company.company_name,
  });

  if (!found) {
    console.error('FAIL: New company not found in getCompanies()');
    process.exit(1);
  }

  // 4. Get single company by id
  const one = await api.getCompany(newId);
  const detailsMatch =
    one?.payload.company.company_name === testPayload.company.company_name &&
    one?.payload.user.email === testPayload.user.email;
  console.log('4. getCompany(id):', {
    found: !!one,
    company_name: one?.payload.company.company_name,
    detailsMatch,
  });

  if (!one || !detailsMatch) {
    console.error('FAIL: getCompany(id) did not return correct details');
    process.exit(1);
  }

  // 5. Graph data
  const graph = await api.getGraphData();
  const nodeForNew = graph.nodes.find((n) => n.id === newId);
  console.log('5. getGraphData():', {
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    newNodeInGraph: !!nodeForNew,
    newNodeLabel: nodeForNew?.label,
  });

  console.log('\nAll checks passed. Company details are being saved correctly.');
}

run().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
