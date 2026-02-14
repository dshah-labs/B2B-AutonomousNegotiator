import type { StoredAgent } from './storageService';
import { PricingModel } from '../types';

export const sampleAgents: StoredAgent[] = [
  {
    id: 'agt_sample_001',
    created_at: new Date().toISOString(),
    payload: {
      user: { first_name: 'Jane', last_name: 'Smith', email: 'jane@acmecorp.com' },
      company: {
        company_name: 'Acme Corp',
        ein: '12-3456789',
        website: 'https://acmecorp.com',
        domains: ['logistics', 'supply-chain'],
        policies: 'Standard enterprise security.',
        pricing_model: PricingModel.ENTERPRISE,
        services: 'B2B logistics and supply chain automation.',
      },
      goals: { short_term: 'Scale EMEA operations.', long_term: 'Market leadership in logistics AI.' },
    },
  },
  {
    id: 'agt_sample_002',
    created_at: new Date().toISOString(),
    payload: {
      user: { first_name: 'John', last_name: 'Doe', email: 'john@techflow.io' },
      company: {
        company_name: 'TechFlow',
        ein: '',
        website: 'https://techflow.io',
        domains: ['saas', 'automation'],
        policies: 'Privacy-first, SOC2.',
        pricing_model: PricingModel.SUBSCRIPTION,
        services: 'SaaS automation and workflow tools.',
      },
      goals: { short_term: 'Add 50 enterprise customers.', long_term: 'Global SaaS platform.' },
    },
  },
  {
    id: 'agt_sample_003',
    created_at: new Date().toISOString(),
    payload: {
      user: { first_name: 'Alex', last_name: 'Lee', email: 'alex@datawise.com' },
      company: {
        company_name: 'DataWise',
        ein: '98-7654321',
        website: 'https://datawise.com',
        domains: ['data', 'analytics'],
        policies: 'GDPR compliant, data residency options.',
        pricing_model: PricingModel.USAGE_BASED,
        services: 'Analytics and BI platforms.',
      },
      goals: { short_term: 'Launch API tier.', long_term: 'Embedded analytics everywhere.' },
    },
  },
  {
    id: 'agt_sample_004',
    created_at: new Date().toISOString(),
    payload: {
      user: { first_name: 'Sam', last_name: 'Kim', email: 'sam@cloudnine.dev' },
      company: {
        company_name: 'CloudNine',
        ein: '',
        website: 'https://cloudnine.dev',
        domains: ['cloud', 'infrastructure'],
        policies: 'ISO 27001.',
        pricing_model: PricingModel.FREEMIUM,
        services: 'Cloud infrastructure and DevOps tools.',
      },
      goals: { short_term: 'Grow free tier adoption.', long_term: 'Multi-cloud standard.' },
    },
  },
  {
    id: 'agt_sample_005',
    created_at: new Date().toISOString(),
    payload: {
      user: { first_name: 'Jordan', last_name: 'Taylor', email: 'jordan@nexuspartners.com' },
      company: {
        company_name: 'Nexus Partners',
        ein: '11-2233445',
        website: 'https://nexuspartners.com',
        domains: ['consulting', 'integration'],
        policies: 'Confidentiality and SLAs.',
        pricing_model: PricingModel.ENTERPRISE,
        services: 'Integration consulting and implementation.',
      },
      goals: { short_term: 'Partner with 3 major vendors.', long_term: 'Preferred integration partner.' },
    },
  },
];
