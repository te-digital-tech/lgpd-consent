# @te-digital/lgpd-consent-next

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
