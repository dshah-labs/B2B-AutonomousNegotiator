/**
 * Storage service test: company details are saved and retrievable.
 * Run: npm test
 */

import { describe, it, expect } from 'vitest';
import { api } from './api';
import { PricingModel } from '../types';

describe('Storage service – company details saved', () => {
  it('getCompanies returns seeded companies', async () => {
    const companies = await api.getCompanies();
    expect(companies.length).toBeGreaterThanOrEqual(5);
    expect(companies.every((c) => c.id && c.payload?.company?.company_name)).toBe(true);
  });

  it('createAgent saves company and returns id', async () => {
    const payload = {
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
    const { agent_id: newId } = await api.createAgent(payload);
    expect(newId).toBeDefined();
    expect(typeof newId).toBe('string');
  });

  it('getCompanies includes newly created company', async () => {
    const before = await api.getCompanies();
    const payload = {
      user: { first_name: 'Unique', last_name: 'User', email: 'unique@test.com' },
      company: {
        company_name: 'Unique Corp',
        ein: '',
        website: 'https://uniquecorp.com',
        domains: ['unique'],
        policies: '',
        pricing_model: PricingModel.ENTERPRISE,
        services: 'Unique services',
      },
      goals: { short_term: '', long_term: '' },
    };
    const { agent_id: newId } = await api.createAgent(payload);
    const after = await api.getCompanies();
    expect(after.length).toBe(before.length + 1);
    const found = after.find((a) => a.id === newId);
    expect(found).toBeDefined();
    expect(found!.payload.company.company_name).toBe('Unique Corp');
    expect(found!.payload.user.email).toBe('unique@test.com');
  });

  it('getCompany(id) returns correct company details', async () => {
    const payload = {
      user: { first_name: 'Detail', last_name: 'Test', email: 'detail@test.com' },
      company: {
        company_name: 'Detail Test Ltd',
        ein: '11-2223333',
        website: 'https://detailtest.com',
        domains: ['detail', 'test'],
        policies: 'Privacy policy',
        pricing_model: PricingModel.USAGE_BASED,
        services: 'Consulting',
      },
      goals: { short_term: 'Q1 goals', long_term: '2025 vision' },
    };
    const { agent_id: id } = await api.createAgent(payload);
    const company = await api.getCompany(id);
    expect(company).toBeDefined();
    expect(company!.id).toBe(id);
    expect(company!.payload.company.company_name).toBe('Detail Test Ltd');
    expect(company!.payload.company.ein).toBe('11-2223333');
    expect(company!.payload.goals.short_term).toBe('Q1 goals');
  });

  it('getGraphData includes nodes for all companies', async () => {
    const companies = await api.getCompanies();
    const graph = await api.getGraphData();
    expect(graph.nodes.length).toBe(companies.length);
    const nodeIds = new Set(graph.nodes.map((n) => n.id));
    for (const c of companies) {
      expect(nodeIds.has(c.id)).toBe(true);
    }
  });
});
