import type { ConsentPreferences } from '@te-digital/lgpd-consent';
import { cookies } from 'next/headers';

const DEFAULT_KEY = 'lgpd-consent';

type StoredPayload = {
  preferences: Record<string, boolean>;
  acceptedAt: string;
  policyVersion: number;
  version: 1;
};

export type ServerConsent = {
  status: 'pending' | 'granted' | 'expired';
  preferences: ConsentPreferences;
  acceptedAt: string | null;
  policyVersion: number | null;
};

/**
 * Read consent on the server (React Server Components, route handlers, middleware).
 *
 * Requires the manager to be configured with `storage: 'cookie'` (or `'auto'`
 * with cookies as the active strategy). localStorage cannot be read on the server.
 *
 * @example
 * import { readConsent } from '@te-digital/lgpd-consent-next/server';
 *
 * export default async function Layout({ children }) {
 *   const consent = await readConsent();
 *   return (
 *     <html>
 *       <body>
 *         {consent.preferences.analytics && <ClarityScript />}
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 */
export async function readConsent(
  options: { storageKey?: string; currentPolicyVersion?: number } = {},
): Promise<ServerConsent> {
  const key = options.storageKey ?? DEFAULT_KEY;
  const store = await cookies();
  const raw = store.get(key)?.value;

  if (!raw) return empty();

  let parsed: StoredPayload;
  try {
    parsed = JSON.parse(decodeURIComponent(raw)) as StoredPayload;
  } catch {
    return empty();
  }
  if (parsed.version !== 1) return empty();

  const isExpired =
    options.currentPolicyVersion !== undefined &&
    parsed.policyVersion < options.currentPolicyVersion;

  if (isExpired) {
    return {
      status: 'expired',
      preferences: { essential: true } as ConsentPreferences,
      acceptedAt: parsed.acceptedAt,
      policyVersion: parsed.policyVersion,
    };
  }

  const prefs: ConsentPreferences = { essential: true } as ConsentPreferences;
  for (const [cat, val] of Object.entries(parsed.preferences)) {
    if (cat === 'essential') continue;
    prefs[cat] = val === true;
  }

  return {
    status: 'granted',
    preferences: prefs,
    acceptedAt: parsed.acceptedAt,
    policyVersion: parsed.policyVersion,
  };
}

function empty(): ServerConsent {
  return {
    status: 'pending',
    preferences: { essential: true } as ConsentPreferences,
    acceptedAt: null,
    policyVersion: null,
  };
}
