import { beforeEach, describe, expect, it } from 'vitest';
import { exportConsentLog, exportConsentLogJson } from '../src/export.js';
import { createConsentManager } from '../src/index.js';

beforeEach(() => {
  if (typeof localStorage !== 'undefined') localStorage.clear();
});

describe('exportConsentLog', () => {
  it('captures the current decision and metadata', () => {
    const m = createConsentManager({
      categories: ['essential', 'analytics', 'marketing'],
      policyVersion: 1,
    });
    m.set({ analytics: true });
    const record = exportConsentLog(m, { subjectId: 'user-42' });
    expect(record.subjectId).toBe('user-42');
    expect(record.granted).toContain('analytics');
    expect(record.granted).toContain('essential');
    expect(record.denied).toContain('marketing');
    expect(record.policyVersion).toBe(1);
    expect(record.locale).toBe('en');
  });

  it('serializes to pretty JSON', () => {
    const m = createConsentManager({
      categories: ['essential', 'analytics'],
      policyVersion: 1,
    });
    const json = exportConsentLogJson(m);
    expect(json).toMatch(/^\{\n/);
    expect(JSON.parse(json).status).toBeDefined();
  });
});
