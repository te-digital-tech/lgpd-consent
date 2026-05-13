import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

type FbqFn = ((...args: unknown[]) => void) & {
  // biome-ignore lint/suspicious/noExplicitAny: matches Meta Pixel vendor signature
  callMethod?: (...args: any[]) => void;
  queue: unknown[][];
  push: FbqFn;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

let initialized = false;

/**
 * Meta Pixel. Gated by `marketing` consent.
 *
 * Reference: https://developers.facebook.com/docs/meta-pixel/implementation/gdpr
 *
 * Uses Pixel's first-party `consent` API. We `revoke` and `grant` instead of
 * unloading the script, matching Meta's recommended pattern.
 */
export function applyMeta(prefs: ConsentPreferences, config: IntegrationsConfig['meta']): void {
  if (!config) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (prefs.marketing) {
    if (!initialized) loadPixel(config.pixelId);
    window.fbq?.('consent', 'grant');
  } else {
    window.fbq?.('consent', 'revoke');
  }
}

function loadPixel(pixelId: string) {
  initialized = true;
  if (window.fbq) return;

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod.apply(fbq, args);
    else fbq.queue.push(args);
  }) as FbqFn;
  fbq.queue = [];
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';

  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);

  window.fbq?.('init', pixelId);
  window.fbq?.('consent', 'revoke');
}
