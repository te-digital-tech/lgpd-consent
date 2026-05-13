import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let loaded = false;

/**
 * Google Analytics 4 via gtag.js (no GTM). Gated by `analytics`. Pairs with the
 * `gcm` integration so Consent Mode v2 is honored.
 *
 * Reference: https://developers.google.com/analytics/devguides/collection/ga4
 */
export function applyGa4(prefs: ConsentPreferences, config: IntegrationsConfig['ga4']): void {
  if (!config) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!prefs.analytics) return;
  if (loaded) return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    // biome-ignore lint/suspicious/noExplicitAny: gtag variadic
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    };
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.measurementId}`;
  document.head.appendChild(script);
  window.gtag?.('js', new Date());
  window.gtag?.('config', config.measurementId);
}
