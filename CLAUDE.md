# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

LGPD-first headless cookie consent for plain JS, React, and Next.js. Published as three linked npm packages under `@te-digital/*`. Built around Brazilian LGPD categories (not translated GDPR), with ANPD-aligned defaults, proof-of-consent logging, policy versioning, and Google Consent Mode v2 / Clarity / Meta Pixel / GTM integrations.

## Commands

Run from the repo root — most scripts fan out to all packages via `pnpm -r --filter="./packages/*"`.

```bash
pnpm install                # bootstrap workspace
pnpm build                  # tsup build all packages (ESM + CJS + d.ts)
pnpm dev                    # tsup --watch in parallel for all packages
pnpm test                   # vitest run, all packages
pnpm test:watch             # vitest watch, all packages
pnpm lint                   # biome check . (lint + format check + organize imports)
pnpm lint:fix               # biome check --write .
pnpm typecheck              # tsc --noEmit per package
pnpm changeset              # author a changeset before opening a PR
```

Per-package or single-test runs:

```bash
pnpm --filter @te-digital/lgpd-consent test                    # one package
pnpm --filter @te-digital/lgpd-consent exec vitest run manager  # single test file
pnpm --filter @te-digital/lgpd-consent exec vitest -t "expired" # by test name
```

Node 20+ and pnpm 9+ are required (enforced via `engines` and `.nvmrc`).

## Architecture

### Package layout and dependency direction

```
packages/lgpd-consent       → core, zero runtime deps, framework-agnostic
packages/lgpd-consent-react → depends on core; ConsentProvider + hooks
packages/lgpd-consent-next  → depends on core; SSR cookie reader + ConsentScript
```

Internal deps use `workspace:*` and are bumped to `patch` on each release (`updateInternalDependencies` in `.changeset/config.json`). All three packages are **linked** in Changesets, so they version in lockstep — bumping one bumps all.

### Core state machine (`packages/lgpd-consent/src/manager.ts`)

`createConsentManager(config)` returns the public API. The lifecycle status is `pending | granted | expired`:

- **pending** — no stored payload; show banner.
- **granted** — payload exists and `policyVersion` matches.
- **expired** — payload exists but `policyVersion < config.policyVersion`; re-prompt.

Invariants enforced in the manager itself, not in adapters:

- `essential` **must** be present in `categories` and is hard-coded to `true` in every preference snapshot. Manager constructor throws if missing.
- `accept()` / `reject()` ignore their `scope` argument shape — `reject` always leaves `essential` on.
- After every mutation (`accept`/`reject`/`set`/`revoke`), the manager: persists → updates `state` → re-applies integrations → fires the log hook → notifies listeners. Keep that order if you touch `persist()`.

### Two distinct version numbers

There are two version fields in the stored payload and they mean different things — don't conflate them:

- `STORED_PAYLOAD_VERSION` (constant `1` in `payload.ts`) — schema version of the persisted JSON. If you change the on-disk shape, bump this and update `parseStoredPayload()` to migrate or reject old data.
- `policyVersion` (user-provided in `ConsentConfig`) — the customer's privacy policy version. Bumping triggers `status: 'expired'` and re-prompt.

### Shared payload parser

`packages/lgpd-consent/src/payload.ts` is the single source of truth for `StoredPayload` shape and parsing. It's exported as a subpath (`@te-digital/lgpd-consent/payload`) so `packages/lgpd-consent-next/src/server.ts` consumes it directly — there is no longer a duplicated cookie parser to keep in sync.

### Storage adapters (`packages/lgpd-consent/src/storage.ts`)

Strategy is `'localStorage' | 'cookie' | 'auto'` (default `auto` → localStorage when available, else cookie). **Cookie storage is required for Next.js SSR reading** — the server cannot read localStorage. If you add a new strategy, both `createStorage()` here and the parser in `packages/lgpd-consent-next/src/server.ts` need updating.

`packages/lgpd-consent-next/src/server.ts` imports `parseStoredPayload` from the core `/payload` subpath, so there is one source of truth for the on-disk format. If you change the payload shape, update `payload.ts` and bump `STORED_PAYLOAD_VERSION` — both the client manager and the Next server reader pick it up.

### Integrations (`packages/lgpd-consent/src/integrations/`)

Each integration (`gcm`, `clarity`, `meta`, `gtm`, `ga4`, `plausible`, `hotjar`, `segment`, `mixpanel`, `tiktok`, `linkedin`, `rdstation`, `hubspot`) exports an `apply*(prefs, config)` function that is a no-op when its config slice is absent or `window` is undefined. They're invoked every time state changes via `applyIntegrations()` in the manager. Adding a new integration requires:

1. New file + `apply*` export.
2. Wire into `applyIntegrations()` in `manager.ts`.
3. Add to `IntegrationsConfig` in `types.ts`.
4. Add `integrations/<name>` to the tsup `entry` map and to `exports` in `packages/lgpd-consent/package.json`.

### Optional features (opt-in via `ConsentConfig`)

- `signingSecret` — turns on HMAC-SHA256 tamper-detection for the stored payload. Signing is async (Web Crypto) so the manager writes the unsigned payload synchronously and upgrades it with the signature in a microtask; on read, missing-signature falls back to pending, invalid-signature is verified in background and cleared if forged.
- `cookieCleanup` — wires `clearCookiesByCategory` into every granted→denied transition (including `set()` partial updates and `revoke()`). Accepts `false` to disable, `true` for built-in catalog, or `{ catalog, useDefaults }` to extend.
- `auditLog` — receives `BannerAuditEvent`s (impressions, button clicks, time-to-decision). Routed through `createAuditRecorder()` consumers in the React adapter.

### Auto-blocking (`packages/lgpd-consent/src/auto-block.ts`)

Subpath export `@te-digital/lgpd-consent/auto-block`. Call `autoBlockScripts({ manager })` once on mount; it scans existing `<script type="text/plain" data-consent="...">` tags, swaps them for executable clones when their category is granted, and watches the DOM with a `MutationObserver` for SPA/hydration cases. Revoking does not unload running code — it removes the executed clones and fires a `lgpd-consent:reload-suggested` window event so consumers can surface a reload to the user.

### Log hook semantics

`config.log` is **fire-and-forget by design** (`packages/lgpd-consent/src/log.ts`) — sync errors and promise rejections are swallowed so logging failures never block consent application. Don't change this without an architectural reason; callers are expected to handle batching/retries/durability server-side.

### React adapter (`packages/lgpd-consent-react`)

`ConsentProvider` builds the manager once via `useMemo` and **owns the `preferencesOpen` state** (hoisted into context so every `useConsent` consumer shares it — previously each call had its own `useState`, which broke split UIs). `useConsent` subscribes via `useSyncExternalStore` so SSR snapshots and concurrent rendering stay consistent.

Headless UI primitives shipped alongside the hooks:
- `<RevokeButton>` — wraps `revoke()`, supports `asChild` for custom elements and optional `confirmMessage`.
- `<Banner>` — render-prop component that renders only while status is `pending`/`expired`; fires `onImpression` exactly once.
- `<PreferencesModal>` — owns a draft preference state so checkboxes don't commit until the user clicks save.

Every file using React hooks/JSX is marked `'use client'` because they ship in libraries consumed by Next.js App Router.

### Next.js adapter (`packages/lgpd-consent-next`)

Two entry points with **different runtime constraints**:

- `.` (`index.ts` → `ConsentScript`) — usable in client/server components. Accepts a `nonce` prop for CSP-strict deployments.
- `./server` (`server.ts` → `readConsent`, `readConsentFromRequest`) — only `readConsent` imports `next/headers` and is App Router-only. `readConsentFromRequest(source)` is agnostic and works with `NextRequest` (`cookies.get()`), Pages Router `req` (`req.cookies` object), or any object with a `headers.cookie` string. Use it in middleware, `getServerSideProps`, or custom route handlers.

These are separate `exports` in `package.json` and separate `entry` keys in `tsup.config.ts` — don't merge them.

## Build and release

- **Build:** `tsup` per package, dual ESM/CJS, `.d.ts` emitted, `sideEffects: false`, `target: es2022`. Each subpath export (`/i18n`, `/integrations/*`, `/server`) is its own tsup entry — adding a new export means editing both `tsup.config.ts` and the `exports` map.
- **Lint/format:** Biome only (no ESLint/Prettier). Strict rules: `useImportType`, `useExportType`, `noExplicitAny: error`. Formatter is disabled on `package.json` files via override (manifest tooling owns that formatting).
- **Tests:** Vitest with `happy-dom` environment (needed because storage/integrations touch `window`/`document`/`localStorage`). Tests live alongside core only — React/Next packages run `vitest --passWithNoTests`.
- **Releases:** Changesets via `.github/workflows/release.yml`. Pushing to `main` either opens a release PR or, when that PR is merged, publishes to npm with `NPM_CONFIG_PROVENANCE=true`. Per-package `publishConfig.access` is `public`.
- **Size budget:** core ESM bundle is capped at 3 KB via `size-limit` config in `packages/lgpd-consent/package.json`. Adding dependencies to core breaks the "zero runtime deps" guarantee — don't.

## Conventions (from CONTRIBUTING.md and biome.json)

- TypeScript strict mode with `noUncheckedIndexedAccess` and `verbatimModuleSyntax` — imports of types must use `import type`.
- Public API additions require a JSDoc block (the existing types in `types.ts` are the reference style).
- All relative imports use the `.js` extension (required by `verbatimModuleSyntax` + bundler resolution).
- New locales: copy `packages/lgpd-consent/src/i18n/en.ts`, translate, and re-export from `i18n/index.ts`.
- Open a changeset (`pnpm changeset`) for any user-visible change before opening a PR against `main`.
