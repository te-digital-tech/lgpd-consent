---
"@te-digital/lgpd-consent-react": patch
---

Preserve the `'use client'` directive in the published bundles. esbuild strips per-file module directives when bundling into a single chunk (and drops a `banner` the same way), so the React adapter shipped without `'use client'`. Importing any export from a React Server Component pulled the whole package into the RSC graph and crashed with `React.createContext is not a function`. A tsup `onSuccess` hook now re-prepends the directive to `dist/index.js` and `dist/index.cjs` — the package is client-only end to end.
