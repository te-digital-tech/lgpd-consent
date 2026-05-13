import type { ConsentPreferences } from './types.js';

export const STORED_PAYLOAD_VERSION = 1 as const;

export type StoredPayload = {
  preferences: Record<string, boolean>;
  acceptedAt: string;
  policyVersion: number;
  version: typeof STORED_PAYLOAD_VERSION;
  /** Optional HMAC-SHA256 signature over the canonical payload, base64url-encoded. */
  signature?: string;
};

/**
 * Parse a raw string (cookie value or localStorage entry) into a validated payload.
 * Returns null if the input is missing, malformed, or written in an unknown schema.
 * Shared between the client-side storage adapter and the Next.js server reader so
 * the on-disk contract has a single source of truth.
 */
export function parseStoredPayload(raw: string | null | undefined): StoredPayload | null {
  if (!raw) return null;
  let value = raw;
  if (value.includes('%')) {
    try {
      value = decodeURIComponent(value);
    } catch {
      // fall through with the original — JSON.parse will reject if truly broken
    }
  }
  try {
    const parsed = JSON.parse(value) as StoredPayload;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.version !== STORED_PAYLOAD_VERSION) return null;
    if (typeof parsed.acceptedAt !== 'string') return null;
    if (typeof parsed.policyVersion !== 'number') return null;
    if (!parsed.preferences || typeof parsed.preferences !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Project a stored payload onto the public ConsentPreferences shape using the
 * caller's declared category list. Categories absent from storage default to false.
 */
export function preferencesFromPayload(
  payload: StoredPayload,
  categories: readonly string[],
): ConsentPreferences {
  const out = { essential: true } as ConsentPreferences;
  for (const cat of categories) {
    if (cat === 'essential') continue;
    out[cat] = payload.preferences[cat] === true;
  }
  return out;
}

export function defaultPreferences(categories: readonly string[]): ConsentPreferences {
  const out = { essential: true } as ConsentPreferences;
  for (const cat of categories) {
    if (cat === 'essential') continue;
    out[cat] = false;
  }
  return out;
}
