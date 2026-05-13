import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

type HjFn = ((...args: unknown[]) => void) & { q?: unknown[][] };

declare global {
  interface Window {
    hj?: HjFn;
    _hjSettings?: { hjid: number; hjsv: number };
  }
}

let loaded = false;

/**
 * Hotjar. Gated by `analytics`.
 *
 * Reference: https://help.hotjar.com/hc/en-us/articles/115011867948
 */
export function applyHotjar(prefs: ConsentPreferences, config: IntegrationsConfig['hotjar']): void {
  if (!config) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!prefs.analytics) return;
  if (loaded) return;
  loaded = true;

  const hjsv = config.version ?? 6;
  window._hjSettings = { hjid: config.siteId, hjsv };
  if (!window.hj) {
    const hj: HjFn = ((...args: unknown[]) => {
      hj.q = hj.q || [];
      hj.q.push(args);
    }) as HjFn;
    hj.q = [];
    window.hj = hj;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://static.hotjar.com/c/hotjar-${config.siteId}.js?sv=${hjsv}`;
  document.head.appendChild(script);
}
