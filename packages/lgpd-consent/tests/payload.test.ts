import { describe, expect, it } from 'vitest';
import {
  STORED_PAYLOAD_VERSION,
  defaultPreferences,
  parseStoredPayload,
  preferencesFromPayload,
} from '../src/payload.js';

describe('parseStoredPayload', () => {
  it('returns null for missing input', () => {
    expect(parseStoredPayload(null)).toBeNull();
    expect(parseStoredPayload(undefined)).toBeNull();
    expect(parseStoredPayload('')).toBeNull();
  });

  it('returns null when JSON is malformed', () => {
    expect(parseStoredPayload('{not json')).toBeNull();
    expect(parseStoredPayload('"just a string"')).toBeNull();
  });

  it('rejects unknown schema versions', () => {
    expect(
      parseStoredPayload(
        JSON.stringify({
          preferences: { essential: true },
          acceptedAt: 'x',
          policyVersion: 1,
          version: 999,
        }),
      ),
    ).toBeNull();
  });

  it('decodes URI-encoded cookie payloads', () => {
    const payload = {
      preferences: { essential: true, analytics: true },
      acceptedAt: '2024-01-01T00:00:00.000Z',
      policyVersion: 1,
      version: STORED_PAYLOAD_VERSION,
    };
    const encoded = encodeURIComponent(JSON.stringify(payload));
    const parsed = parseStoredPayload(encoded);
    expect(parsed?.preferences.analytics).toBe(true);
  });

  it('rejects payloads with missing required fields', () => {
    expect(
      parseStoredPayload(JSON.stringify({ acceptedAt: 'x', policyVersion: 1, version: 1 })),
    ).toBeNull();
  });
});

describe('preferencesFromPayload', () => {
  it('projects only declared categories and defaults missing to false', () => {
    const out = preferencesFromPayload(
      {
        preferences: { essential: true, analytics: true },
        acceptedAt: 'x',
        policyVersion: 1,
        version: STORED_PAYLOAD_VERSION,
      },
      ['essential', 'analytics', 'marketing'],
    );
    expect(out).toEqual({ essential: true, analytics: true, marketing: false });
  });
});

describe('defaultPreferences', () => {
  it('returns essential:true and all others:false', () => {
    expect(defaultPreferences(['essential', 'a', 'b'])).toEqual({
      essential: true,
      a: false,
      b: false,
    });
  });
});
