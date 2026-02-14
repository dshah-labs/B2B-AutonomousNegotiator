/**
 * Minimal check that company details are saved (storage layer only).
 * Run: node scripts/check-storage.mjs
 * Uses dynamic import of the built or source modules; run from project root.
 */

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

// Load type definitions for payload shape; we'll use plain objects for the test
const testPayload = {
  user: { first_name: 'Test', last_name: 'User', email: 'test@example.com' },
  company: {
    company_name: 'Test Company Inc',
    ein: '99-9999999',
    website: 'https://testcompany.com',
    domains: ['testing', 'qa'],
    policies: 'Test policies',
    pricing_model: 'Subscription',
    services: 'Test services',
  },
  goals: { short_term: 'Short term', long_term: 'Long term' },
};

async function main() {
  console.log('Checking storage service...\n');

  // Dynamic import so we resolve from project root (Vite/TS project)
  const path = await import('node:path');
  const { pathToFileURL } = await import('node:url');
  const projectRoot = path.default.resolve(process.cwd());
  const storagePath = path.default.join(projectRoot, 'services', 'storageService.ts');
  const samplePath = path.default.join(projectRoot, 'services', 'sampleData.ts');

  // Node cannot run TS directly; try loading compiled files or use tsx
  const storageJs = path.default.join(projectRoot, 'services', 'storageService.js');
  const fs = await import('node:fs');
  if (!fs.default.existsSync(storageJs)) {
    console.log('No built JS found. Run the test in the browser instead:');
    console.log('  1. npm run dev');
    console.log('  2. Open http://localhost:5173/test-storage.html');
    console.log('\nOr run: npx vite-node scripts/test-storage-node.ts');
    return;
  }

  const storageMod = await import(pathToFileURL(storageJs).href);
  const storage = storageMod.storage;
  const sampleMod = await import(pathToFileURL(path.join(projectRoot, 'services', 'sampleData.js')).href);
  const sampleAgents = sampleMod.sampleAgents;

  if (storage.isEmpty()) storage.seed(sampleAgents);
  const initialCount = storage.getAll().length;
  console.log('1. After seed, company count:', initialCount);

  const id = storage.add(testPayload);
  console.log('2. createAgent (storage.add) returned id:', id);

  const afterCount = storage.getAll().length;
  console.log('3. Company count after add:', afterCount, afterCount === initialCount + 1 ? 'OK' : 'FAIL');

  const one = storage.get(id);
  const match = one && one.payload.company.company_name === testPayload.company.company_name;
  console.log('4. get(id) company name:', one?.payload?.company?.company_name, match ? 'OK' : 'FAIL');

  if (afterCount === initialCount + 1 && match) {
    console.log('\nAll checks passed. Company details are being saved correctly.');
  } else {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
