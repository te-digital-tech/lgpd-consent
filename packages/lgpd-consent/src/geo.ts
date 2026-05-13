/**
 * Geolocation gate. LGPD applies to users in Brazil regardless of where the
 * controller is based, but many products want to skip the banner outside of BR
 * to avoid friction. This module is a thin policy layer — it does **not** make
 * the geolocation call itself, because that varies by stack (CDN header, IP
 * lookup API, Next middleware, etc.).
 */

export type GeoPolicy = {
  /** ISO 3166-1 alpha-2 country codes that should always see the banner. */
  showFor?: string[];
  /** Country codes that should be skipped (mutually exclusive with showFor). */
  skipFor?: string[];
  /** Behavior when country is unknown. Default: show — LGPD-safe default. */
  onUnknown?: 'show' | 'skip';
};

export type GeoDecision = {
  shouldShowBanner: boolean;
  country: string | null;
};

/**
 * Decide whether to show the banner based on the resolved country. Pass the
 * country yourself (e.g. from `request.geo.country` on Vercel or a custom
 * header) — the library is intentionally agnostic about how you obtained it.
 *
 * @example
 * const { shouldShowBanner } = resolveGeoGate('BR', { showFor: ['BR'] });
 */
export function resolveGeoGate(
  country: string | null | undefined,
  policy: GeoPolicy = {},
): GeoDecision {
  const normalized = typeof country === 'string' ? country.toUpperCase() : null;
  if (!normalized) {
    return {
      shouldShowBanner: policy.onUnknown !== 'skip',
      country: null,
    };
  }
  if (policy.showFor && policy.showFor.length > 0) {
    return {
      shouldShowBanner: policy.showFor.map((c) => c.toUpperCase()).includes(normalized),
      country: normalized,
    };
  }
  if (policy.skipFor && policy.skipFor.length > 0) {
    return {
      shouldShowBanner: !policy.skipFor.map((c) => c.toUpperCase()).includes(normalized),
      country: normalized,
    };
  }
  return { shouldShowBanner: true, country: normalized };
}
