import { describe, expect, it } from 'vitest';
import { readConsentFromRequest } from '../src/server.js';

const validPayload = encodeURIComponent(
  JSON.stringify({
    preferences: { essential: true, analytics: true },
    acceptedAt: '2024-01-01T00:00:00.000Z',
    policyVersion: 1,
    version: 1,
  }),
);

describe('readConsentFromRequest', () => {
  it('reads from a NextRequest-like cookies.get()', () => {
    const source = {
      cookies: {
        get(name: string) {
          return name === 'lgpd-consent' ? { value: validPayload } : undefined;
        },
      },
    };
    const out = readConsentFromRequest(source);
    expect(out.status).toBe('granted');
    expect(out.preferences.analytics).toBe(true);
  });

  it('reads from Pages Router req.cookies object', () => {
    const source = { cookies: { 'lgpd-consent': validPayload } };
    const out = readConsentFromRequest(source);
    expect(out.status).toBe('granted');
  });

  it('reads from a raw Cookie header', () => {
    const source = { headers: { cookie: `lgpd-consent=${validPayload}; other=x` } };
    const out = readConsentFromRequest(source);
    expect(out.status).toBe('granted');
  });

  it('returns pending when cookie is missing', () => {
    const out = readConsentFromRequest({ cookies: {} });
    expect(out.status).toBe('pending');
    expect(out.preferences.essential).toBe(true);
  });

  it('marks expired when stored policyVersion is older', () => {
    const source = {
      cookies: {
        get: () => ({ value: validPayload }),
      },
    };
    const out = readConsentFromRequest(source, { currentPolicyVersion: 2 });
    expect(out.status).toBe('expired');
  });
});
