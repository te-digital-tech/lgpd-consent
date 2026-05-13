import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

declare global {
  interface Window {
    _hsq?: unknown[];
  }
}

let loaded = false;

/**
 * HubSpot tracking code. Gated by `marketing` (covers both analytics and
 * marketing usage in the typical HubSpot CRM setup).
 *
 * Reference: https://developers.hubspot.com/docs/api/events/tracking-code
 */
export function applyHubSpot(
  prefs: ConsentPreferences,
  config: IntegrationsConfig['hubspot'],
): void {
  if (!config) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!prefs.marketing) return;
  if (loaded) return;
  loaded = true;

  window._hsq = window._hsq || [];
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.id = 'hs-script-loader';
  script.src = `//js.hs-scripts.com/${config.portalId}.js`;
  document.head.appendChild(script);
}
