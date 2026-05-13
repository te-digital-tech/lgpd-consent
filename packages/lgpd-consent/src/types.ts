/**
 * LGPD-aligned cookie categories.
 *
 * - `essential` — strictly necessary cookies. Always granted. Cannot be opted out.
 * - `analytics` — usage statistics, performance monitoring (e.g. Microsoft Clarity, Plausible).
 * - `marketing` — advertising attribution and personalization (e.g. Meta Pixel, Google Ads).
 *
 * Custom categories can be defined by extending the union with declaration merging
 * or by passing additional category strings to {@link ConsentConfig.categories}.
 */
export type ConsentCategory = 'essential' | 'analytics' | 'marketing' | (string & {});

/**
 * A snapshot of which categories the user has consented to.
 * `essential` is always `true` per LGPD Art. 7 (legitimate interest).
 */
export type ConsentPreferences = Record<ConsentCategory, boolean> & {
  essential: true;
};

/**
 * Lifecycle status of the consent state machine.
 *
 * - `pending` — user has not interacted yet. Show the banner.
 * - `granted` — user has saved preferences (any state, including reject-all).
 * - `expired` — saved preferences exist but policy version is outdated. Re-prompt.
 */
export type ConsentStatus = 'pending' | 'granted' | 'expired';

/** The full consent state at a point in time. */
export type ConsentState = {
  status: ConsentStatus;
  preferences: ConsentPreferences;
  /** ISO 8601 timestamp when preferences were last saved. */
  acceptedAt: string | null;
  /** Policy version active at the time of saving. */
  policyVersion: number | null;
};

/** A consent change event sent to the {@link ConsentConfig.log} hook. */
export type ConsentEvent = {
  type: 'accepted' | 'rejected' | 'updated' | 'revoked';
  preferences: ConsentPreferences;
  acceptedAt: string;
  policyVersion: number;
  /** Provided by the runtime if available (browser). */
  userAgent?: string;
  /** Allow callers to attach arbitrary metadata (e.g. user id, request id). */
  meta?: Record<string, unknown>;
};

/** Localized strings shown by UI adapters. The core is headless and never renders them. */
export type ConsentStrings = {
  locale: string;
  banner: {
    eyebrow: string;
    title: string;
    description: string;
    privacyLinkLabel: string;
    accept: string;
    reject: string;
    customize: string;
  };
  preferences: {
    title: string;
    description: string;
    save: string;
    accept: string;
    reject: string;
    close: string;
    enabled: string;
    disabled: string;
  };
  categories: Record<
    string,
    {
      title: string;
      description: string;
      locked?: boolean;
    }
  >;
};

export type StorageStrategy = 'localStorage' | 'cookie' | 'auto';

export type IntegrationsConfig = {
  /** Google Consent Mode v2 (gtag('consent', 'update')). */
  gcm?: boolean | { defaultRegion?: string };
  /** Microsoft Clarity. Loads/blocks the tracker based on `analytics` consent. */
  clarity?: { projectId: string };
  /** Meta Pixel. Loads/blocks based on `marketing` consent. */
  meta?: { pixelId: string };
  /** Google Tag Manager. Pushes consent events to `dataLayer`. */
  gtm?: boolean;
  /** Google Analytics 4 (gtag.js direct, no GTM). */
  ga4?: { measurementId: string };
  /** Plausible. Loads tracker when analytics granted. */
  plausible?: { domain: string; src?: string };
  /** Hotjar. */
  hotjar?: { siteId: number; version?: number };
  /** Segment analytics.js. */
  segment?: { writeKey: string };
  /** Mixpanel. */
  mixpanel?: { token: string };
  /** TikTok Pixel. */
  tiktok?: { pixelId: string };
  /** LinkedIn Insight Tag. */
  linkedin?: { partnerId: string };
  /** RD Station Marketing. */
  rdstation?: { token: string };
  /** HubSpot tracking code. */
  hubspot?: { portalId: string };
};

/** Configuration accepted by {@link createConsentManager}. */
export type ConsentConfig = {
  /** Categories the user can opt into. Always include `essential`. */
  categories: ConsentCategory[];
  /**
   * Bump this integer when the policy materially changes (new processors, new purposes).
   * The library will mark existing consent as `expired` and re-prompt.
   */
  policyVersion: number;
  /** Where consent is persisted. Default `auto` prefers localStorage with cookie fallback. */
  storage?: StorageStrategy;
  /** Storage key. Default `lgpd-consent`. */
  storageKey?: string;
  /** Cookie domain when using cookie storage. Default: current host. */
  cookieDomain?: string;
  /** Cookie max-age in seconds. Default 1 year. */
  cookieMaxAge?: number;
  /** Strings shown by adapters. Default English. */
  strings?: ConsentStrings;
  /** Async hook fired on every consent change. Send to your backend for proof. */
  log?: (event: ConsentEvent) => void | Promise<void>;
  /** Built-in tracker integrations. */
  integrations?: IntegrationsConfig;
  /**
   * Optional HMAC-SHA256 secret used to sign the stored payload. When set, an
   * unsigned or wrongly-signed payload on read is treated as missing.
   * Bundled into the client — see signing.ts for the trade-off notes.
   */
  signingSecret?: string;
  /**
   * Cookie cleanup on revoke/deny. Provide your own catalog to extend the
   * built-in mapping. Pass `false` to disable cleanup entirely.
   */
  cookieCleanup?:
    | boolean
    | { catalog?: Partial<Record<ConsentCategory, string[]>>; useDefaults?: boolean };
  /** Sink for banner-interaction audit events. Distinct from the consent log hook. */
  auditLog?: (event: import('./audit.js').BannerAuditEvent) => void | Promise<void>;
};

/** The public manager API returned by {@link createConsentManager}. */
export type ConsentManager = {
  /** Current consent state. */
  get(): ConsentState;
  /** Accept all categories. */
  accept(scope?: 'all'): void;
  /** Reject all optional categories (essential stays on). */
  reject(scope?: 'optional'): void;
  /** Set granular preferences. */
  set(preferences: Partial<ConsentPreferences>): void;
  /** Clear state and trigger a re-prompt. */
  revoke(): void;
  /** Subscribe to state changes. Returns an unsubscribe function. */
  on(event: 'change', listener: (state: ConsentState) => void): () => void;
  /** Test whether a category is currently granted. */
  isAllowed(category: ConsentCategory): boolean;
  /** Current strings (locale and copy). */
  strings: ConsentStrings;
};
