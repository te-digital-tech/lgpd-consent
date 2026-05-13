import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

let loaded = false;

/**
 * Plausible Analytics. Gated by `analytics` — though Plausible itself is
 * cookieless, many policies still require explicit consent before any
 * third-party request is made.
 *
 * Reference: https://plausible.io/docs
 */
export function applyPlausible(
  prefs: ConsentPreferences,
  config: IntegrationsConfig['plausible'],
): void {
  if (!config) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!prefs.analytics) return;
  if (loaded) return;
  loaded = true;

  const script = document.createElement('script');
  script.defer = true;
  script.dataset.domain = config.domain;
  script.src = config.src ?? 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}
