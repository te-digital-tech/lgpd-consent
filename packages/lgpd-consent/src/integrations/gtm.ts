import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Push a `lgpd_consent_update` event into GTM's dataLayer so tag templates
 * can use it as a trigger. Lightweight and orthogonal to GCM v2 — many setups
 * want both: GCM for Google's own tags + GTM event for third-party tags.
 */
export function applyGtm(prefs: ConsentPreferences, enabled: IntegrationsConfig['gtm']): void {
  if (!enabled) return;
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'lgpd_consent_update',
    consent: {
      essential: prefs.essential,
      analytics: prefs.analytics === true,
      marketing: prefs.marketing === true,
    },
  });
}
