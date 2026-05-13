import { type CookieCatalog, DEFAULT_COOKIE_CATALOG, clearCookiesByCategory } from './cookies.js';
import { en } from './i18n/en.js';
import { applyClarity } from './integrations/clarity.js';
import { applyGa4 } from './integrations/ga4.js';
import { applyGcm } from './integrations/gcm.js';
import { applyGtm } from './integrations/gtm.js';
import { applyHotjar } from './integrations/hotjar.js';
import { applyHubSpot } from './integrations/hubspot.js';
import { applyLinkedIn } from './integrations/linkedin.js';
import { applyMeta } from './integrations/meta.js';
import { applyMixpanel } from './integrations/mixpanel.js';
import { applyPlausible } from './integrations/plausible.js';
import { applyRdStation } from './integrations/rdstation.js';
import { applySegment } from './integrations/segment.js';
import { applyTiktok } from './integrations/tiktok.js';
import { emitLog } from './log.js';
import { STORED_PAYLOAD_VERSION, type StoredPayload } from './payload.js';
import { type SigningStrategy, createHmacSigner } from './signing.js';
import { buildState, createStorage } from './storage.js';
import type {
  ConsentCategory,
  ConsentConfig,
  ConsentManager,
  ConsentPreferences,
  ConsentState,
} from './types.js';

/**
 * Create a framework-agnostic consent manager.
 *
 * @example
 * const consent = createConsentManager({
 *   categories: ['essential', 'analytics', 'marketing'],
 *   policyVersion: 1,
 *   log: async (event) => fetch('/api/consent-log', { method: 'POST', body: JSON.stringify(event) }),
 * });
 *
 * consent.accept();
 * consent.on('change', (state) => console.log(state));
 */
export function createConsentManager(config: ConsentConfig): ConsentManager {
  const categories = config.categories;
  if (!categories.includes('essential')) {
    throw new Error("[lgpd-consent] 'essential' category is required and must always be present.");
  }

  const storage = createStorage(config.storage, {
    key: config.storageKey,
    cookieDomain: config.cookieDomain,
    cookieMaxAge: config.cookieMaxAge,
  });

  const strings = config.strings ?? en;
  const listeners = new Set<(state: ConsentState) => void>();
  const signer: SigningStrategy | null = config.signingSecret
    ? createHmacSigner(config.signingSecret)
    : null;

  const catalog: CookieCatalog = resolveCatalog(config.cookieCleanup);
  const cleanupEnabled = config.cookieCleanup !== false;

  let state: ConsentState;
  let initialPayload = storage.read();

  if (initialPayload && signer) {
    const { signature, ...rest } = initialPayload;
    // Signature check is async — if missing or async-unverifiable, fall back to pending
    // and start a background verification. Synchronous fast path: missing signature
    // is treated as untrusted.
    if (!signature) {
      storage.clear();
      initialPayload = null;
    } else {
      // optimistic accept; re-verify in background and clear if invalid
      void signer.verify(rest, signature).then((ok) => {
        if (!ok) {
          storage.clear();
          state = buildState(null, config.policyVersion, categories);
          notify();
        }
      });
    }
  }

  state = buildState(initialPayload, config.policyVersion, categories);
  applyIntegrations(state.preferences);

  function applyIntegrations(prefs: ConsentPreferences) {
    if (!config.integrations) return;
    applyGcm(prefs, config.integrations.gcm);
    applyClarity(prefs, config.integrations.clarity);
    applyMeta(prefs, config.integrations.meta);
    applyGtm(prefs, config.integrations.gtm);
    applyGa4(prefs, config.integrations.ga4);
    applyPlausible(prefs, config.integrations.plausible);
    applyHotjar(prefs, config.integrations.hotjar);
    applySegment(prefs, config.integrations.segment);
    applyMixpanel(prefs, config.integrations.mixpanel);
    applyTiktok(prefs, config.integrations.tiktok);
    applyLinkedIn(prefs, config.integrations.linkedin);
    applyRdStation(prefs, config.integrations.rdstation);
    applyHubSpot(prefs, config.integrations.hubspot);
  }

  function persist(prefs: ConsentPreferences, type: 'accepted' | 'rejected' | 'updated') {
    const acceptedAt = new Date().toISOString();
    const previous = state.preferences;
    const base: Omit<StoredPayload, 'signature'> = {
      preferences: prefs,
      acceptedAt,
      policyVersion: config.policyVersion,
      version: STORED_PAYLOAD_VERSION,
    };

    // Persist sync first using whatever signature we have (none yet), then upgrade
    // with the real signature in a microtask. This avoids racing the integrations
    // and listeners while still delivering tamper-evidence on the cookie.
    storage.write(base);
    if (signer) {
      void signer.sign(base).then((signature) => {
        storage.write({ ...base, signature });
      });
    }

    state = {
      status: 'granted',
      preferences: prefs,
      acceptedAt,
      policyVersion: config.policyVersion,
    };

    if (cleanupEnabled) cleanupDenied(previous, prefs);
    applyIntegrations(prefs);
    emitLog(type, prefs, { policyVersion: config.policyVersion, log: config.log });
    notify();
  }

  function cleanupDenied(prev: ConsentPreferences, next: ConsentPreferences) {
    const newlyDenied: ConsentCategory[] = [];
    for (const cat of categories) {
      if (cat === 'essential') continue;
      const wasOn = prev[cat] === true;
      const isOff = next[cat] !== true;
      if (wasOn && isOff) newlyDenied.push(cat);
    }
    if (newlyDenied.length) clearCookiesByCategory(newlyDenied, catalog);
  }

  function notify() {
    for (const listener of listeners) listener(state);
  }

  function buildPrefs(getValue: (cat: ConsentCategory) => boolean): ConsentPreferences {
    const out = { essential: true } as ConsentPreferences;
    for (const cat of categories) {
      if (cat === 'essential') continue;
      out[cat] = getValue(cat);
    }
    return out;
  }

  return {
    get() {
      return state;
    },
    accept() {
      persist(
        buildPrefs(() => true),
        'accepted',
      );
    },
    reject() {
      persist(
        buildPrefs(() => false),
        'rejected',
      );
    },
    set(partial) {
      const merged = buildPrefs((cat) =>
        partial[cat] !== undefined ? partial[cat] === true : state.preferences[cat] === true,
      );
      persist(merged, 'updated');
    },
    revoke() {
      const previous = state.preferences;
      storage.clear();
      const prefs = buildPrefs(() => false);
      state = {
        status: 'pending',
        preferences: prefs,
        acceptedAt: null,
        policyVersion: null,
      };
      if (cleanupEnabled) cleanupDenied(previous, prefs);
      emitLog('revoked', prefs, { policyVersion: config.policyVersion, log: config.log });
      applyIntegrations(prefs);
      notify();
    },
    on(_event, listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    isAllowed(category) {
      if (category === 'essential') return true;
      if (state.status !== 'granted') return false;
      return state.preferences[category] === true;
    },
    strings,
  };
}

function resolveCatalog(config: ConsentConfig['cookieCleanup']): CookieCatalog {
  if (config === false) return { essential: [], analytics: [], marketing: [] };
  if (config === true || config === undefined) return DEFAULT_COOKIE_CATALOG;

  const useDefaults = config.useDefaults !== false;
  const base = useDefaults
    ? DEFAULT_COOKIE_CATALOG
    : { essential: [], analytics: [], marketing: [] };
  const merged: CookieCatalog = { ...base };
  if (config.catalog) {
    for (const [cat, patterns] of Object.entries(config.catalog)) {
      if (!patterns) continue;
      merged[cat] = [...(merged[cat] ?? []), ...patterns];
    }
  }
  return merged;
}
