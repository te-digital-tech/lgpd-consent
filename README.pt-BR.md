<div align="center">

# `@te-digital-tech/lgpd-consent`

**Cookie consent headless para React e Next.js — focado em LGPD.**

[English](./README.md) · [Português](./README.pt-BR.md)

[![npm version](https://img.shields.io/npm/v/@te-digital-tech/lgpd-consent?style=flat-square&labelColor=0A0A0A&color=00FF88)](https://www.npmjs.com/package/@te-digital-tech/lgpd-consent)
[![License: MIT](https://img.shields.io/badge/License-MIT-00FF88?style=flat-square&labelColor=0A0A0A)](./LICENSE)
[![Feito pela T&E Digital](https://img.shields.io/badge/feito%20por-T%26E%20Digital-00FF88?style=flat-square&labelColor=0A0A0A)](https://tedigital.com.br)

</div>

---

Biblioteca moderna e framework-agnostic de gerenciamento de consentimento de cookies, feita pra **LGPD** (Lei 13.709/2018). Funciona em JavaScript puro, React e Next.js (App Router).

> Não é uma lib GDPR traduzida. Foi construída com categorias da LGPD, defaults alinhados às orientações da ANPD, log de prova de consentimento e integrações modernas (Google Consent Mode v2, Microsoft Clarity, Meta Pixel, GTM).

## Por que essa lib

| Opção atual | O que falta |
|-------------|-------------|
| `react-cookie-consent` | GDPR-centric, sem categorias LGPD, sem GCM v2 |
| `@cookieconsent/core` (orestbida) | EU-centric, ~12kb, UI pesada |
| Cookiebot / Iubenda / OneTrust | SaaS, R$150-1500/mês |
| Componente caseiro | Sem versionamento, sem prova jurídica, sem integração |

**Esta lib:**

- Defaults LGPD-first, em português e inglês
- Core headless (~2kb) — você monta a UI
- Adapter React com hooks e context
- Adapter Next.js com leitura de consent no servidor (sem flash de scripts)
- Prova de consentimento: timestamp, versão da política, user-agent — hook pra enviar pro seu backend
- Versionamento de política: bump força re-consent automático
- Integrações nativas: Google Consent Mode v2, Microsoft Clarity, Meta Pixel, GTM
- Zero dependências de runtime no core, dual ESM/CJS, TypeScript completo

## Pacotes

| Pacote | Descrição |
|--------|-----------|
| [`@te-digital-tech/lgpd-consent`](./packages/lgpd-consent) | Core framework-agnostic. JS puro, Vue, Svelte, qualquer lugar. |
| [`@te-digital-tech/lgpd-consent-react`](./packages/lgpd-consent-react) | Adapter React: `ConsentProvider`, `useConsent`, `useCategory` |
| [`@te-digital-tech/lgpd-consent-next`](./packages/lgpd-consent-next) | Adapter Next.js App Router com helpers server-side |

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
      <p>Usamos cookies para ...</p>
      <button onClick={() => accept('all')}>Aceitar todos</button>
      <button onClick={() => reject('optional')}>Recusar opcionais</button>
      <button onClick={openPreferences}>Personalizar</button>
    </div>
  );
}
```

```tsx
// app/layout.tsx — leitura server-side do consent
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

## Checklist de conformidade LGPD

| Artigo / requisito | Como a lib ajuda |
|--------------------|------------------|
| Art. 8 — Consentimento livre, informado, inequívoco | Sem opt-ins pré-marcados; peso visual igual entre aceitar e recusar |
| Art. 8 §5 — Direito de revogação | `consent.revoke()` + helper `<RevokeButton>` |
| Art. 9 — Granularidade por finalidade | Categorias separadas |
| Art. 37 — Registros de tratamento | Log captura `acceptedAt`, `policyVersion`, `userAgent` |
| Art. 18 — Acesso do titular | `exportConsentLog(userId)` |

A lib te ajuda a implementar consent corretamente — não substitui um DPO nem revisão jurídica.

## Documentação

- [Primeiros passos](./docs/getting-started.md)
- [API do core](./packages/lgpd-consent/README.md)
- [API React](./packages/lgpd-consent-react/README.md)
- [Integração Next.js](./packages/lgpd-consent-next/README.md)
- [Integrações: GCM v2, Clarity, Meta, GTM](./docs/integrations.md)
- [Backend de prova de consentimento](./docs/proof-of-consent.md)

## Contribuindo

Issues, PRs e traduções são bem-vindas. Veja [CONTRIBUTING.md](./CONTRIBUTING.md).

## Licença

MIT © [T&E Digital](https://tedigital.com.br)

---

<div align="center">
  <sub>Feito pela <a href="https://tedigital.com.br">T&E Digital</a> — estúdio de software em São Paulo. Precisa de <a href="https://tedigital.com.br/servicos/desenvolvimento-de-software-sob-medida">software sob medida</a> ou <a href="https://tedigital.com.br/servicos/analise-de-seo">SEO técnico</a>? Fale com a gente.</sub>
</div>
