import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

// biome-ignore lint/suspicious/noExplicitAny: vendor signature
type MixpanelLike = any;

declare global {
  interface Window {
    mixpanel?: MixpanelLike;
  }
}

let loaded = false;

/**
 * Mixpanel. Gated by `analytics`. Uses Mixpanel's official `opt_in_tracking` /
 * `opt_out_tracking` API after loading so we can flip state without a reload.
 *
 * Reference: https://docs.mixpanel.com/docs/tracking/reference/javascript-quickstart
 */
export function applyMixpanel(
  prefs: ConsentPreferences,
  config: IntegrationsConfig['mixpanel'],
): void {
  if (!config) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (prefs.analytics) {
    if (!loaded) loadMixpanel(config.token);
    window.mixpanel?.opt_in_tracking?.();
  } else if (loaded) {
    window.mixpanel?.opt_out_tracking?.();
  }
}

function loadMixpanel(token: string) {
  loaded = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
  script.onload = () => {
    window.mixpanel?.init?.(token, { opt_out_tracking_by_default: true });
  };
  document.head.appendChild(script);
}
