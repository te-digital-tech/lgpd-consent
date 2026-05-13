import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

type GcmConsentState = 'granted' | 'denied';

type GtagConsentUpdate = {
  ad_storage: GcmConsentState;
  ad_user_data: GcmConsentState;
  ad_personalization: GcmConsentState;
  analytics_storage: GcmConsentState;
  functionality_storage: GcmConsentState;
  personalization_storage: GcmConsentState;
  security_storage: GcmConsentState;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function ensureGtag() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    // biome-ignore lint/suspicious/noExplicitAny: gtag stub signature is variadic by design.
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    };
  }
}

/**
 * Sync consent state with Google Consent Mode v2.
 *
 * Reference: https://developers.google.com/tag-platform/security/guides/consent
 *
 * Maps our categories:
 *   - analytics  → analytics_storage
 *   - marketing  → ad_storage, ad_user_data, ad_personalization, personalization_storage
 *   - essential  → security_storage, functionality_storage (always granted)
 */
export function applyGcm(prefs: ConsentPreferences, config: IntegrationsConfig['gcm']): void {
  if (!config) return;
  if (typeof window === 'undefined') return;
  ensureGtag();

  const analytics: GcmConsentState = prefs.analytics ? 'granted' : 'denied';
  const marketing: GcmConsentState = prefs.marketing ? 'granted' : 'denied';

  const update: GtagConsentUpdate = {
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    analytics_storage: analytics,
    functionality_storage: 'granted',
    personalization_storage: marketing,
    security_storage: 'granted',
  };

  window.gtag?.('consent', 'update', update);
}

/**
 * Emit Google Consent Mode v2 `default` state before any tracking scripts load.
 * Call once on app boot.
 */
export function gcmDefault(region?: string): void {
  if (typeof window === 'undefined') return;
  ensureGtag();
  const defaults: Partial<GtagConsentUpdate> & { wait_for_update?: number; region?: string[] } = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
  };
  if (region) defaults.region = [region];
  window.gtag?.('consent', 'default', defaults);
}
