import type { StoredPayload } from './payload.js';

/**
 * Optional anti-tamper signing for the stored consent payload.
 *
 * When enabled the manager signs the payload with HMAC-SHA256 before persisting
 * and verifies the signature on read. A failed verification is treated the same
 * as an absent payload — the user is re-prompted, but no data is lost server-side
 * because the log hook records every change anyway.
 *
 * Trade-off: the secret has to be embedded in the client bundle to verify
 * locally. That stops casual tampering (e.g. someone flipping `marketing: true`
 * in DevTools) but doesn't stop a determined attacker who can read the secret.
 * For audit-grade integrity, also sign server-side when storing the consent log.
 */

export type SigningStrategy = {
  sign(payload: SignableInput): Promise<string>;
  verify(payload: SignableInput, signature: string): Promise<boolean>;
};

export type SignableInput = Omit<StoredPayload, 'signature'>;

function canonicalize(input: SignableInput): string {
  const keys: (keyof SignableInput)[] = ['version', 'policyVersion', 'acceptedAt', 'preferences'];
  const ordered = {} as Record<string, unknown>;
  for (const k of keys) ordered[k as string] = input[k];
  // Sort preferences keys to make the canonical form deterministic regardless of
  // insertion order (Object.keys preserves order but a stored payload restored
  // from JSON might differ across runtimes).
  const sortedPrefs: Record<string, boolean> = {};
  for (const cat of Object.keys(input.preferences).sort()) {
    sortedPrefs[cat] = input.preferences[cat] === true;
  }
  ordered.preferences = sortedPrefs;
  return JSON.stringify(ordered);
}

function toBase64Url(bytes: ArrayBuffer): string {
  const arr = new Uint8Array(bytes);
  let bin = '';
  for (let i = 0; i < arr.byteLength; i++) bin += String.fromCharCode(arr[i] as number);
  const b64 =
    typeof btoa === 'function' ? btoa(bin) : Buffer.from(bin, 'binary').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getSubtle(): SubtleCrypto | null {
  if (typeof globalThis === 'undefined') return null;
  const c = (globalThis as { crypto?: { subtle?: SubtleCrypto } }).crypto;
  return c?.subtle ?? null;
}

/**
 * Create an HMAC-SHA256 signer. Returns null when Web Crypto is unavailable —
 * callers should treat that as "signing disabled" rather than an error so the
 * library still works on legacy runtimes.
 */
export function createHmacSigner(secret: string): SigningStrategy | null {
  const subtle = getSubtle();
  if (!subtle) return null;
  const encoder = new TextEncoder();
  let keyPromise: Promise<CryptoKey> | null = null;
  const getKey = () => {
    if (!keyPromise) {
      keyPromise = subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify'],
      );
    }
    return keyPromise;
  };

  return {
    async sign(payload) {
      const key = await getKey();
      const data = encoder.encode(canonicalize(payload));
      const sig = await subtle.sign('HMAC', key, data);
      return toBase64Url(sig);
    },
    async verify(payload, signature) {
      try {
        const expected = await this.sign(payload);
        return timingSafeEqual(expected, signature);
      } catch {
        return false;
      }
    },
  };
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= (a.charCodeAt(i) ^ b.charCodeAt(i)) as number;
  return diff === 0;
}
