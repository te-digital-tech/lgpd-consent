import type { ConsentCategory } from './types.js';

/**
 * Known third-party cookie → category mappings. Used both for client-side
 * scanning (telling the user *what* the site stores) and for mass-cleanup on
 * revoke. Patterns are matched against the cookie name as a literal substring
 * or, when a value ends with `*`, as a prefix.
 */
export type CookieCatalog = Record<ConsentCategory, string[]>;

/**
 * A reasonable default catalog covering the trackers shipped as integrations.
 * Consumers can pass their own catalog to override or extend.
 */
export const DEFAULT_COOKIE_CATALOG: CookieCatalog = {
  essential: ['lgpd-consent', 'XSRF-TOKEN', 'csrf', 'session', 'connect.sid'],
  analytics: [
    '_ga',
    '_ga_*',
    '_gid',
    '_gat',
    '_gat_*',
    '_clck',
    '_clsk',
    'CLID',
    'MUID',
    'ANONCHK',
    '_hjSession*',
    '_hjid',
    '_hjAbsoluteSessionInProgress',
    '_hjFirstSeen',
    'ajs_anonymous_id',
    'ajs_user_id',
    'mp_*',
    'plausible_*',
  ],
  marketing: [
    '_fbp',
    '_fbc',
    'fr',
    'tr',
    '_gcl_au',
    '_gcl_aw',
    '_gcl_dc',
    'IDE',
    'NID',
    'DSID',
    'test_cookie',
    'tt_*',
    '_ttp',
    '_uetsid',
    '_uetvid',
    'li_*',
    'lidc',
    'bcookie',
    'bscookie',
    'UserMatchHistory',
    'rdtrk',
    '__hstc',
    '__hssc',
    '__hssrc',
    'hubspotutk',
  ],
};

function matches(name: string, patterns: string[]): boolean {
  for (const p of patterns) {
    if (p.endsWith('*')) {
      if (name.startsWith(p.slice(0, -1))) return true;
    } else if (name === p) return true;
  }
  return false;
}

export type ScannedCookie = {
  name: string;
  category: ConsentCategory | 'unknown';
};

/**
 * Read `document.cookie` and tag each entry against the catalog. Useful for
 * surfacing a "cookies currently stored" list in the preferences modal.
 */
export function scanCookies(catalog: CookieCatalog = DEFAULT_COOKIE_CATALOG): ScannedCookie[] {
  if (typeof document === 'undefined') return [];
  const raw = document.cookie ? document.cookie.split('; ') : [];
  const out: ScannedCookie[] = [];
  for (const entry of raw) {
    const eq = entry.indexOf('=');
    const name = eq === -1 ? entry : entry.slice(0, eq);
    if (!name) continue;
    let category: ScannedCookie['category'] = 'unknown';
    for (const cat of Object.keys(catalog) as ConsentCategory[]) {
      if (matches(name, catalog[cat] ?? [])) {
        category = cat;
        break;
      }
    }
    out.push({ name, category });
  }
  return out;
}

/**
 * Delete every cookie matching the given categories. Tries the current host,
 * each parent domain, and `path=/` so we hit the variants set by third-party
 * libraries. Essential cookies are never touched.
 */
export function clearCookiesByCategory(
  categories: ConsentCategory[],
  catalog: CookieCatalog = DEFAULT_COOKIE_CATALOG,
): void {
  if (typeof document === 'undefined' || typeof location === 'undefined') return;
  const targets = new Set<string>();
  for (const cat of categories) {
    if (cat === 'essential') continue;
    for (const p of catalog[cat] ?? []) targets.add(p);
  }
  if (!targets.size) return;

  const hostParts = location.hostname.split('.');
  const domains: string[] = [];
  for (let i = 0; i < hostParts.length - 1; i++) {
    domains.push(`.${hostParts.slice(i).join('.')}`);
  }
  domains.push(location.hostname);

  const cookies = document.cookie.split('; ');
  for (const entry of cookies) {
    const eq = entry.indexOf('=');
    const name = eq === -1 ? entry : entry.slice(0, eq);
    if (!name || !matches(name, [...targets])) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${domain}`;
    }
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}
