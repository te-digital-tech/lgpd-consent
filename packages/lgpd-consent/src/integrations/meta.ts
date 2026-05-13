import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[][]; loaded?: boolean };
    _fbq?: unknown;
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
  // biome-ignore lint/suspicious/noExplicitAny: vendor snippet uses dynamic globals.
  (function (f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function (...args: unknown[]) {
      // biome-ignore lint/suspicious/noExplicitAny: vendor signature.
      n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args as any);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq?.('init', pixelId);
  window.fbq?.('consent', 'revoke');
}
