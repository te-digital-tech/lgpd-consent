import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    clarity?: ClarityFn;
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

  if (!window.clarity) {
    const clarity: ClarityFn = ((...args: unknown[]) => {
      clarity.q = clarity.q || [];
      clarity.q.push(args);
    }) as ClarityFn;
    clarity.q = [];
    window.clarity = clarity;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${projectId}`;
  const firstScript = document.getElementsByTagName('script')[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);
}
