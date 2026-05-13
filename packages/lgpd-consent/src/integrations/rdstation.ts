import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

let loaded = false;

/**
 * RD Station Marketing tracking script. Gated by `marketing`. The vendor's
 * snippet is a single async `<script>` keyed by token.
 *
 * Reference: https://ajuda.rdstation.com.br/hc/pt-br/articles/360001692911
 */
export function applyRdStation(
  prefs: ConsentPreferences,
  config: IntegrationsConfig['rdstation'],
): void {
  if (!config) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!prefs.marketing) return;
  if (loaded) return;
  loaded = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://d335luupugsy2.cloudfront.net/js/loader-scripts/${config.token}-loader.js`;
  document.head.appendChild(script);
}
