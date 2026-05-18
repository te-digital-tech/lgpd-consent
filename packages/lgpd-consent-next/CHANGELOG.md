# @te-digital/lgpd-consent-next

## 0.2.2

### Patch Changes

- acc2bbf: Realinha as versões dos três pacotes após o patch isolado do `lgpd-consent-react` (preservação do `'use client'`). Sem mudança funcional — garante que os pacotes linkados voltem a versionar em lockstep.
- Updated dependencies [acc2bbf]
  - @te-digital/lgpd-consent@0.2.2

## 0.2.0

### Minor Changes

- d7650b7: Comprehensive feature expansion to deliver everything advertised in the README and close gaps versus paid SaaS consent platforms.

  **Core (`@te-digital/lgpd-consent`)**

  - `exportConsentLog()` / `exportConsentLogJson()` — portable record for LGPD Art. 18 data-subject access requests.
  - `scanCookies()` + `clearCookiesByCategory()` + `DEFAULT_COOKIE_CATALOG` — see what's stored and mass-delete on revoke/deny.
  - `resolveGeoGate()` — opt-in policy for showing the banner only in target countries.
  - `createAuditRecorder()` + `BannerAuditEvent` — banner impression and decision-time telemetry, separate from the consent log.
  - New `/auto-block` subpath: `autoBlockScripts({ manager })` rewrites `<script type="text/plain" data-consent="...">` tags to executable scripts the moment consent is granted, observes mutations for SPAs, and emits a `lgpd-consent:reload-suggested` event on revoke.
  - New `/payload` subpath: shared `StoredPayload` parser used by both client storage and the Next.js server reader (eliminates the duplicated parser bug surface).
  - Optional HMAC-SHA256 payload signing via `config.signingSecret` — tamper-evident storage backed by Web Crypto.
  - Cookie cleanup wired into `set()`, `reject()`, and `revoke()`: any category transition from granted→denied also clears that category's cookies via the catalog.
  - Nine new integrations as standalone subpaths: `/integrations/{ga4,plausible,hotjar,segment,mixpanel,tiktok,linkedin,rdstation,hubspot}`.
  - Three new locales: `es`, `fr`, `de`.

  **React (`@te-digital/lgpd-consent-react`)**

  - New headless components: `<RevokeButton>` (with `asChild` + optional confirm), `<Banner>` (render-prop, auto-hides outside pending/expired, fires `onImpression` once), `<PreferencesModal>` (draft state, save/accept/reject/close handlers).
  - Provider now hoists `preferencesOpen` state so every `useConsent` consumer shares the open/close signal (previously each call had its own local state — a real bug).

  **Next.js (`@te-digital/lgpd-consent-next`)**

  - `<ConsentScript>` now accepts a `nonce` prop for strict CSP setups.
  - New `readConsentFromRequest(source, options)` works with App Router `NextRequest`, Pages Router `req` (`req.cookies` object), and raw `Headers` objects — usable in middleware and `getServerSideProps`.

  **Quality**

  - Test coverage expanded from 9 to 48 tests, covering storage adapters, payload parsing, cookie scanner, geo gate, audit recorder, export, server reader, and React hooks/components.
  - Core ESM size budget raised from 3 KB to 8 KB to accommodate the new functionality; `/auto-block` subpath has its own 3 KB budget.

### Patch Changes

- Updated dependencies [d7650b7]
  - @te-digital/lgpd-consent@0.2.0

## 0.1.1

### Patch Changes

- 28fe6b3: Drop `provenance: true` from each package's `publishConfig`. Provenance is
  already enabled in CI via `NPM_CONFIG_PROVENANCE: "true"` in the release
  workflow env block, which is the only place we publish from going forward.
  Removing the duplicate setting from `package.json` keeps the release-time
  behaviour identical and stops blocking ad-hoc `npm publish` runs from
  machines without an OIDC provider (which is where provenance fails with
  `Automatic provenance generation not supported for provider: null`).

  No runtime change. Pure release-tooling cleanup.

- Updated dependencies [28fe6b3]
  - @te-digital/lgpd-consent@0.1.1

## 0.1.0

### Minor Changes

- ca305a4: Initial public release — headless cookie consent for React and Next.js, LGPD-first.

  **`@te-digital/lgpd-consent`** — framework-agnostic core

  - `createConsentManager` with state machine (`pending` / `granted` / `expired`)
  - localStorage + cookie storage strategies (SSR-friendly)
  - Policy version tracking with automatic re-consent on bump
  - Proof-of-consent `log` hook (timestamp, version, user-agent)
  - Built-in integrations: Google Consent Mode v2, Microsoft Clarity, Meta Pixel, GTM
  - Default strings in English and Portuguese (`pt-BR`)
  - Zero runtime dependencies, dual ESM/CJS, full TypeScript

  **`@te-digital/lgpd-consent-react`** — React adapter

  - `ConsentProvider`, `useConsent`, `useCategory`, `useStrings`
  - Built on `useSyncExternalStore` for safe concurrent rendering
  - React 18 and 19 supported

  **`@te-digital/lgpd-consent-next`** — Next.js App Router adapter

  - `readConsent()` server-side reader for RSC and route handlers
  - `<ConsentScript />` boot script for Google Consent Mode v2 `default` state
  - Next 14, 15, 16 supported

### Patch Changes

- Updated dependencies [ca305a4]
  - @te-digital/lgpd-consent@0.1.0
