import { en } from './i18n/en.js';
import { applyClarity } from './integrations/clarity.js';
import { applyGcm } from './integrations/gcm.js';
import { applyGtm } from './integrations/gtm.js';
import { applyMeta } from './integrations/meta.js';
import { emitLog } from './log.js';
import { buildState, createStorage } from './storage.js';
import type {
  ConsentCategory,
  ConsentConfig,
  ConsentManager,
  ConsentPreferences,
  ConsentState,
} from './types.js';

const STORED_PAYLOAD_VERSION = 1 as const;

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
 * consent.accept('all');
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

  let state = buildState(storage.read(), config.policyVersion, categories);
  applyIntegrations(state.preferences);

  function applyIntegrations(prefs: ConsentPreferences) {
    if (!config.integrations) return;
    applyGcm(prefs, config.integrations.gcm);
    applyClarity(prefs, config.integrations.clarity);
    applyMeta(prefs, config.integrations.meta);
    applyGtm(prefs, config.integrations.gtm);
  }

  function persist(prefs: ConsentPreferences, type: 'accepted' | 'rejected' | 'updated') {
    const acceptedAt = new Date().toISOString();
    storage.write({
      preferences: prefs,
      acceptedAt,
      policyVersion: config.policyVersion,
      version: STORED_PAYLOAD_VERSION,
    });

    state = {
      status: 'granted',
      preferences: prefs,
      acceptedAt,
      policyVersion: config.policyVersion,
    };

    applyIntegrations(prefs);
    emitLog(type, prefs, { policyVersion: config.policyVersion, log: config.log });
    notify();
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
      storage.clear();
      const prefs = buildPrefs(() => false);
      state = {
        status: 'pending',
        preferences: prefs,
        acceptedAt: null,
        policyVersion: null,
      };
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
