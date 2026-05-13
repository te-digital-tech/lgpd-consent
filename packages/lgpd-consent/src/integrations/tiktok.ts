import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

// biome-ignore lint/suspicious/noExplicitAny: vendor signature
type TtqLike = any;

declare global {
  interface Window {
    ttq?: TtqLike;
    TiktokAnalyticsObject?: string;
  }
}

let initialized = false;

/**
 * TikTok Pixel. Gated by `marketing`.
 *
 * Reference: https://business-api.tiktok.com/portal/docs?id=1739585702922241
 */
export function applyTiktok(prefs: ConsentPreferences, config: IntegrationsConfig['tiktok']): void {
  if (!config) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!prefs.marketing) return;
  if (initialized) return;
  initialized = true;

  /* eslint-disable @typescript-eslint/no-explicit-any */
  // biome-ignore lint/suspicious/noExplicitAny: vendor snippet
  const w: any = window;
  w.TiktokAnalyticsObject = 'ttq';
  w.ttq = w.ttq || [];
  // biome-ignore lint/suspicious/noExplicitAny: vendor snippet
  const ttq: any = w.ttq;
  ttq.methods = [
    'page',
    'track',
    'identify',
    'instances',
    'debug',
    'on',
    'off',
    'once',
    'ready',
    'alias',
    'group',
    'enableCookie',
    'disableCookie',
  ];
  // biome-ignore lint/suspicious/noExplicitAny: vendor snippet
  ttq.setAndDefer = (t: any, e: string) => {
    // biome-ignore lint/suspicious/noExplicitAny: vendor snippet
    t[e] = (...args: any[]) => {
      t.push([e].concat(Array.prototype.slice.call(args, 0)));
    };
  };
  for (const m of ttq.methods) ttq.setAndDefer(ttq, m);
  // biome-ignore lint/suspicious/noExplicitAny: vendor snippet
  ttq.instance = (t: any) => {
    const e = ttq._i[t] || [];
    for (const m of ttq.methods) ttq.setAndDefer(e, m);
    return e;
  };
  // biome-ignore lint/suspicious/noExplicitAny: vendor snippet
  ttq.load = (e: string, n?: any) => {
    const r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    ttq._i = ttq._i || {};
    ttq._i[e] = [];
    ttq._i[e]._u = r;
    ttq._t = ttq._t || {};
    ttq._t[e] = +new Date();
    ttq._o = ttq._o || {};
    ttq._o[e] = n || {};
    const o = document.createElement('script');
    o.async = true;
    o.src = `${r}?sdkid=${e}&lib=ttq`;
    document.head.appendChild(o);
  };
  ttq.load(config.pixelId);
  ttq.page();
}
