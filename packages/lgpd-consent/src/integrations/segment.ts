import type { ConsentPreferences, IntegrationsConfig } from '../types.js';

// biome-ignore lint/suspicious/noExplicitAny: Segment's vendor signature is variadic
type AnalyticsLike = any;

declare global {
  interface Window {
    analytics?: AnalyticsLike;
  }
}

let loaded = false;

/**
 * Segment analytics.js. Gated by `analytics`. Implements the official snippet
 * (queueing + lazy script load) so existing Segment instrumentation keeps
 * working without code changes.
 *
 * Reference: https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/
 */
export function applySegment(
  prefs: ConsentPreferences,
  config: IntegrationsConfig['segment'],
): void {
  if (!config) return;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!prefs.analytics) return;
  if (loaded) return;
  loaded = true;

  const methods = [
    'trackSubmit',
    'trackClick',
    'trackLink',
    'trackForm',
    'pageview',
    'identify',
    'reset',
    'group',
    'track',
    'ready',
    'alias',
    'debug',
    'page',
    'screen',
    'once',
    'off',
    'on',
    'addSourceMiddleware',
    'addIntegrationMiddleware',
    'setAnonymousId',
    'addDestinationMiddleware',
    'register',
  ];

  // biome-ignore lint/suspicious/noExplicitAny: matches Segment's loader shape
  const analytics: any = window.analytics || [];
  if (analytics.invoked) return;
  analytics.invoked = true;
  analytics.methods = methods;
  analytics.factory =
    (method: string) =>
    // biome-ignore lint/suspicious/noExplicitAny: vendor pattern
    (...args: any[]) => {
      args.unshift(method);
      analytics.push(args);
      return analytics;
    };
  for (const method of methods) analytics[method] = analytics.factory(method);
  analytics.load = (writeKey: string) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://cdn.segment.com/analytics.js/v1/${writeKey}/analytics.min.js`;
    document.head.appendChild(script);
  };
  analytics.SNIPPET_VERSION = '5.2.0';
  window.analytics = analytics;
  analytics.load(config.writeKey);
  analytics.page();
}
