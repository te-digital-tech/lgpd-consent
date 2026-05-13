import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createConsentManager } from '../src/index.js';

beforeEach(() => {
  if (typeof localStorage !== 'undefined') localStorage.clear();
});

describe('createConsentManager', () => {
  it('starts in pending status without stored consent', () => {
    const m = createConsentManager({
      categories: ['essential', 'analytics', 'marketing'],
      policyVersion: 1,
    });
    expect(m.get().status).toBe('pending');
    expect(m.get().preferences.essential).toBe(true);
    expect(m.get().preferences.analytics).toBe(false);
    expect(m.get().preferences.marketing).toBe(false);
  });

  it('accept() grants all categories', () => {
    const m = createConsentManager({
      categories: ['essential', 'analytics', 'marketing'],
      policyVersion: 1,
    });
    m.accept();
    expect(m.get().status).toBe('granted');
    expect(m.get().preferences.analytics).toBe(true);
    expect(m.get().preferences.marketing).toBe(true);
  });

  it('reject() denies optional categories but keeps essential', () => {
    const m = createConsentManager({
      categories: ['essential', 'analytics', 'marketing'],
      policyVersion: 1,
    });
    m.reject();
    expect(m.get().status).toBe('granted');
    expect(m.get().preferences.essential).toBe(true);
    expect(m.get().preferences.analytics).toBe(false);
    expect(m.get().preferences.marketing).toBe(false);
  });

  it('set() updates granular preferences', () => {
    const m = createConsentManager({
      categories: ['essential', 'analytics', 'marketing'],
      policyVersion: 1,
    });
    m.set({ analytics: true });
    expect(m.get().preferences.analytics).toBe(true);
    expect(m.get().preferences.marketing).toBe(false);
  });

  it('revoke() resets to pending and clears storage', () => {
    const m = createConsentManager({
      categories: ['essential', 'analytics', 'marketing'],
      policyVersion: 1,
    });
    m.accept();
    expect(m.get().status).toBe('granted');
    m.revoke();
    expect(m.get().status).toBe('pending');
  });

  it('isAllowed() respects essential always-on rule', () => {
    const m = createConsentManager({
      categories: ['essential', 'analytics', 'marketing'],
      policyVersion: 1,
    });
    expect(m.isAllowed('essential')).toBe(true);
    expect(m.isAllowed('analytics')).toBe(false);
    m.accept();
    expect(m.isAllowed('analytics')).toBe(true);
  });

  it('subscribers receive state on every change', () => {
    const m = createConsentManager({
      categories: ['essential', 'analytics', 'marketing'],
      policyVersion: 1,
    });
    const spy = vi.fn();
    const unsub = m.on('change', spy);
    m.accept();
    m.reject();
    expect(spy).toHaveBeenCalledTimes(2);
    unsub();
    m.accept();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('throws when essential category is missing', () => {
    expect(() =>
      createConsentManager({
        // @ts-expect-error — essential is required
        categories: ['analytics'],
        policyVersion: 1,
      }),
    ).toThrow(/essential/);
  });

  it('marks state as expired when policy version bumps', () => {
    const first = createConsentManager({
      categories: ['essential', 'analytics', 'marketing'],
      policyVersion: 1,
    });
    first.accept();

    const second = createConsentManager({
      categories: ['essential', 'analytics', 'marketing'],
      policyVersion: 2,
    });
    expect(second.get().status).toBe('expired');
  });
});
