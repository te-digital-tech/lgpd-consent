import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

declare global {
  interface Window {
    _linkedin_data_partner_ids?: string[];
    _linkedin_partner_id?: string;
  }
}

let loaded = false;

/**
 * LinkedIn Insight Tag. Gated by `marketing`.
 *
 * Reference: https://www.linkedin.com/help/lms/answer/a427660
 */
export function applyLinkedIn(
  prefs: ConsentPreferences,
  config: IntegrationsConfig['linkedin'],
): void {
  if (!config) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!prefs.marketing) return;
  if (loaded) return;
  loaded = true;

  window._linkedin_partner_id = config.partnerId;
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  window._linkedin_data_partner_ids.push(config.partnerId);

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
  document.head.appendChild(script);
}
