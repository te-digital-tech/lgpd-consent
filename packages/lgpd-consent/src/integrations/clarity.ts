import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}

let loaded = false;

/**
 * Microsoft Clarity. Gated by `analytics` consent.
 *
 * Reference: https://learn.microsoft.com/en-us/clarity/setup-and-installation/cookie-consent
 *
 * Strategy: lazy-load the script only after analytics is granted. On revocation,
 * notify Clarity to stop tracking. Clarity itself does not unload, but it respects
 * the `consent` signal.
 */
export function applyClarity(
  prefs: ConsentPreferences,
  config: IntegrationsConfig['clarity'],
): void {
  if (!config) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (prefs.analytics) {
    if (!loaded) loadClarityScript(config.projectId);
    window.clarity?.('consent');
  } else {
    window.clarity?.('consent', false);
  }
}

function loadClarityScript(projectId: string) {
  loaded = true;
  // biome-ignore lint/suspicious/noExplicitAny: vendor snippet uses dynamic globals.
  (function (c: any, l: any, a: string, r: string, i: string) {
    c[a] =
      c[a] ||
      function (...args: unknown[]) {
        (c[a].q = c[a].q || []).push(args);
      };
    const t = l.createElement(r);
    t.async = 1;
    t.src = `https://www.clarity.ms/tag/${i}`;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', projectId);
}
