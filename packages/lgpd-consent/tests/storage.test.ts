import { beforeEach, describe, expect, it } from 'vitest';
import { STORED_PAYLOAD_VERSION } from '../src/payload.js';
import { buildState, createStorage } from '../src/storage.js';

beforeEach(() => {
  if (typeof localStorage !== 'undefined') localStorage.clear();
  if (typeof document !== 'undefined') {
    for (const c of document.cookie.split('; ')) {
      const name = c.split('=')[0];
      if (name) document.cookie = `${name}=; max-age=0; path=/`;
    }
  }
});

describe('createStorage(localStorage)', () => {
  it('round-trips a payload', () => {
    const s = createStorage('localStorage', { key: 'k1' });
    s.write({
      preferences: { essential: true, analytics: true },
      acceptedAt: 'now',
      policyVersion: 1,
      version: STORED_PAYLOAD_VERSION,
    });
    expect(s.read()?.preferences.analytics).toBe(true);
    s.clear();
    expect(s.read()).toBeNull();
  });

  it('reports its kind', () => {
    expect(createStorage('localStorage').kind).toBe('localStorage');
  });
});

describe('createStorage(cookie)', () => {
  it('round-trips via document.cookie', () => {
    const s = createStorage('cookie', { key: 'k2' });
    s.write({
      preferences: { essential: true, marketing: true },
      acceptedAt: 'now',
      policyVersion: 2,
      version: STORED_PAYLOAD_VERSION,
    });
    expect(s.read()?.preferences.marketing).toBe(true);
    s.clear();
    expect(s.read()).toBeNull();
  });
});

describe('buildState', () => {
  it('returns pending with default prefs when payload missing', () => {
    const state = buildState(null, 1, ['essential', 'analytics']);
    expect(state.status).toBe('pending');
    expect(state.preferences.analytics).toBe(false);
  });

  it('returns expired when stored version is older than current', () => {
    const state = buildState(
      {
        preferences: { essential: true, analytics: true },
        acceptedAt: 'x',
        policyVersion: 1,
        version: STORED_PAYLOAD_VERSION,
      },
      2,
      ['essential', 'analytics'],
    );
    expect(state.status).toBe('expired');
    // expired state hides stored prefs to force re-prompt
    expect(state.preferences.analytics).toBe(false);
    expect(state.policyVersion).toBe(1);
  });

  it('returns granted when versions match', () => {
    const state = buildState(
      {
        preferences: { essential: true, analytics: true },
        acceptedAt: 'x',
        policyVersion: 1,
        version: STORED_PAYLOAD_VERSION,
      },
      1,
      ['essential', 'analytics'],
    );
    expect(state.status).toBe('granted');
    expect(state.preferences.analytics).toBe(true);
  });
});
