---
'@te-digital/lgpd-consent': minor
'@te-digital/lgpd-consent-react': minor
'@te-digital/lgpd-consent-next': minor
---

Comprehensive feature expansion to deliver everything advertised in the README and close gaps versus paid SaaS consent platforms.

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
