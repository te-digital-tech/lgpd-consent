import type { ConsentPreferences } from '@te-digital/lgpd-consent';
import { parseStoredPayload } from '@te-digital/lgpd-consent/payload';
import { cookies } from 'next/headers';

const DEFAULT_KEY = 'lgpd-consent';

export type ServerConsent = {
  status: 'pending' | 'granted' | 'expired';
  preferences: ConsentPreferences;
  acceptedAt: string | null;
  policyVersion: number | null;
};

export type ReadConsentOptions = {
  storageKey?: string;
  currentPolicyVersion?: number;
};

/**
 * Read consent on the server (React Server Components, route handlers). Uses
 * `next/headers` — only valid inside the App Router request context.
 *
 * Requires the manager to be configured with `storage: 'cookie'` (or `'auto'`
 * with cookies as the active strategy). localStorage cannot be read on the server.
 *
 * @example
 * import { readConsent } from '@te-digital/lgpd-consent-next/server';
 *
 * export default async function Layout({ children }) {
 *   const consent = await readConsent({ currentPolicyVersion: 2 });
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
export async function readConsent(options: ReadConsentOptions = {}): Promise<ServerConsent> {
  const key = options.storageKey ?? DEFAULT_KEY;
  const store = await cookies();
  return resolve(store.get(key)?.value, options);
}

/**
 * Pages Router / middleware variant. Pass an object with a `cookies` accessor
 * (e.g. `NextRequest`, `GetServerSidePropsContext['req']`, or a custom shim).
 *
 * @example
 * // pages/_app.tsx getServerSideProps:
 * export async function getServerSideProps(ctx) {
 *   const consent = readConsentFromRequest(ctx.req);
 *   return { props: { consent } };
 * }
 *
 * @example
 * // middleware.ts:
 * import { NextResponse, type NextRequest } from 'next/server';
 * import { readConsentFromRequest } from '@te-digital/lgpd-consent-next/server';
 *
 * export function middleware(req: NextRequest) {
 *   const consent = readConsentFromRequest(req);
 *   const res = NextResponse.next();
 *   res.headers.set('x-consent-status', consent.status);
 *   return res;
 * }
 */
export function readConsentFromRequest(
  source:
    | { cookies: { get(name: string): { value: string } | undefined } }
    | { cookies: Partial<Record<string, string>> }
    | { headers: { cookie?: string | null } },
  options: ReadConsentOptions = {},
): ServerConsent {
  const key = options.storageKey ?? DEFAULT_KEY;
  const raw = extractCookieValue(source, key);
  return resolve(raw, options);
}

function extractCookieValue(source: unknown, key: string): string | undefined {
  if (!source || typeof source !== 'object') return undefined;
  // NextRequest / App Router request: cookies.get(name).value
  const withGet = source as {
    cookies?: { get?: (name: string) => { value: string } | undefined };
  };
  if (typeof withGet.cookies?.get === 'function') {
    return withGet.cookies.get(key)?.value;
  }
  // Pages Router req: cookies is a plain object
  const withObj = source as { cookies?: Record<string, string | undefined> };
  if (withObj.cookies && typeof withObj.cookies === 'object') {
    return withObj.cookies[key];
  }
  // Raw Headers object: parse the Cookie header ourselves
  const withHeader = source as {
    headers?: { cookie?: string | null; get?: (name: string) => string | null };
  };
  const header =
    typeof withHeader.headers?.get === 'function'
      ? withHeader.headers.get('cookie')
      : withHeader.headers?.cookie;
  if (typeof header === 'string') {
    const match = header.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
    return match?.[1];
  }
  return undefined;
}

function resolve(raw: string | undefined | null, options: ReadConsentOptions): ServerConsent {
  const parsed = parseStoredPayload(raw);
  if (!parsed) return empty();

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
