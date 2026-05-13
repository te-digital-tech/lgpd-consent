<div align="center">

# `@te-digital-tech/lgpd-consent`

**Headless cookie consent for React & Next.js — LGPD-first.**

[English](./README.md) · [Português](./README.pt-BR.md)

[![npm version](https://img.shields.io/npm/v/@te-digital-tech/lgpd-consent?style=flat-square&labelColor=0A0A0A&color=00FF88)](https://www.npmjs.com/package/@te-digital-tech/lgpd-consent)
[![License: MIT](https://img.shields.io/badge/License-MIT-00FF88?style=flat-square&labelColor=0A0A0A)](./LICENSE)
[![Made by T&E Digital](https://img.shields.io/badge/made%20by-T%26E%20Digital-00FF88?style=flat-square&labelColor=0A0A0A)](https://tedigital.com.br)

</div>

---

A modern, framework-agnostic cookie consent management library purpose-built for **Brazil's LGPD** (Lei Geral de Proteção de Dados). Works in plain JavaScript, React, and Next.js (App Router).

> Not a GDPR library translated to Portuguese. Built around LGPD categories, ANPD-aligned defaults, proof-of-consent logging, and modern integrations (Google Consent Mode v2, Microsoft Clarity, Meta Pixel, GTM).

## Why this library

| Existing options | What's missing |
|------------------|----------------|
| `react-cookie-consent` | GDPR-centric, no LGPD categories, no GCM v2 |
| `@cookieconsent/core` (orestbida) | EU-centric, ~12kb, heavyweight UI |
| Cookiebot / Iubenda / OneTrust | SaaS, US$30-300/month |
| Hand-rolled components | No versioning, no proof of consent, no integration |

**This library:**

- LGPD-first defaults, in Portuguese and English
- Headless core (~2kb) — bring your own UI
- React adapter with hooks and context
- Next.js adapter with server-side consent reading (no script flash)
- Proof of consent: timestamp, policy version, user-agent — hook to send to your backend
- Policy versioning: bump and force re-consent automatically
- Built-in integrations: Google Consent Mode v2, Microsoft Clarity, Meta Pixel, GTM
- Zero runtime dependencies in core, dual ESM/CJS, full TypeScript

## Packages

| Package | Description |
|---------|-------------|
| [`@te-digital-tech/lgpd-consent`](./packages/lgpd-consent) | Framework-agnostic core. Use in plain JS, Vue, Svelte, anywhere. |
| [`@te-digital-tech/lgpd-consent-react`](./packages/lgpd-consent-react) | React adapter: `ConsentProvider`, `useConsent`, `useCategory` |
| [`@te-digital-tech/lgpd-consent-next`](./packages/lgpd-consent-next) | Next.js App Router adapter with server-side helpers |

## Quick start (Next.js)

```bash
pnpm add @te-digital-tech/lgpd-consent @te-digital-tech/lgpd-consent-react @te-digital-tech/lgpd-consent-next
```

```tsx
// app/providers.tsx
'use client';
import { ConsentProvider } from '@te-digital-tech/lgpd-consent-react';
import { ptBR } from '@te-digital-tech/lgpd-consent/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider
      config={{
        categories: ['essential', 'analytics', 'marketing'],
        policyVersion: 1,
        strings: ptBR,
        integrations: { gcm: true },
        log: async (event) => {
          await fetch('/api/consent-log', {
            method: 'POST',
            body: JSON.stringify(event),
          });
        },
      }}
    >
      {children}
    </ConsentProvider>
  );
}
```

```tsx
// app/components/CookieBanner.tsx
'use client';
import { useConsent } from '@te-digital-tech/lgpd-consent-react';

export function CookieBanner() {
  const { state, accept, reject, openPreferences } = useConsent();
  if (state.status !== 'pending') return null;

  return (
    <div role="dialog">
      <p>We use cookies for ...</p>
      <button onClick={() => accept('all')}>Accept all</button>
      <button onClick={() => reject('optional')}>Reject optional</button>
      <button onClick={openPreferences}>Preferences</button>
    </div>
  );
}
```

```tsx
// app/layout.tsx — server-side consent reading
import { readConsent } from '@te-digital-tech/lgpd-consent-next/server';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const consent = await readConsent();
  return (
    <html>
      <body>
        {consent.analytics && <ClarityScript />}
        {consent.marketing && <MetaPixel />}
        {children}
      </body>
    </html>
  );
}
```

## LGPD compliance checklist

| Article / requirement | How the library helps |
|-----------------------|------------------------|
| Art. 8 — Free, informed, unambiguous consent | No pre-checked opt-ins; equal visual weight enforced |
| Art. 8 §5 — Right to revoke | `consent.revoke()` + `<RevokeButton>` helper |
| Art. 9 — Granularity by purpose | Separate categories |
| Art. 37 — Records of processing | Log hook captures `acceptedAt`, `policyVersion`, `userAgent` |
| Art. 18 — Data subject access | `exportConsentLog(userId)` |

The library helps you implement consent properly — it does not replace a Data Protection Officer or a legal review.

## Documentation

- [Getting started](./docs/getting-started.md)
- [Core API reference](./packages/lgpd-consent/README.md)
- [React API reference](./packages/lgpd-consent-react/README.md)
- [Next.js integration](./packages/lgpd-consent-next/README.md)
- [Integrations: GCM v2, Clarity, Meta, GTM](./docs/integrations.md)
- [Proof of consent backend recipe](./docs/proof-of-consent.md)

## Contributing

Issues, PRs, and translations welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT © [T&E Digital](https://tedigital.com.br)

---

<div align="center">
  <sub>Built by <a href="https://tedigital.com.br">T&E Digital</a> — a São Paulo software studio. Need <a href="https://tedigital.com.br/servicos/desenvolvimento-de-software-sob-medida">custom software</a> or <a href="https://tedigital.com.br/servicos/analise-de-seo">technical SEO</a>? Get in touch.</sub>
</div>
