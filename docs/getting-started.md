# Getting started

[English](#english) · [Português](#português)

---

## English

### Install (Next.js App Router)

```bash
pnpm add @te-digital-tech/lgpd-consent @te-digital-tech/lgpd-consent-react @te-digital-tech/lgpd-consent-next
```

### 1. Boot Google Consent Mode v2

```tsx
// app/layout.tsx
import { ConsentScript } from '@te-digital-tech/lgpd-consent-next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <ConsentScript region="BR" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 2. Wrap the app in `<ConsentProvider>`

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
        storage: 'cookie',                 // recommended for SSR reading
        cookieDomain: '.yoursite.com',
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

### 3. Build your banner UI

```tsx
'use client';
import { useConsent, useStrings } from '@te-digital-tech/lgpd-consent-react';

export function CookieBanner() {
  const { state, accept, reject, openPreferences } = useConsent();
  const s = useStrings();
  if (state.status === 'granted') return null;
  return (
    <div role="dialog" aria-labelledby="cookie-title">
      <h2 id="cookie-title">{s.banner.title}</h2>
      <p>{s.banner.description}</p>
      <button onClick={accept}>{s.banner.accept}</button>
      <button onClick={reject}>{s.banner.reject}</button>
      <button onClick={openPreferences}>{s.banner.customize}</button>
    </div>
  );
}
```

### 4. Gate trackers

```tsx
'use client';
import { useCategory } from '@te-digital-tech/lgpd-consent-react';

export function ClarityScript() {
  const ok = useCategory('analytics');
  if (!ok) return null;
  return <script ... />;
}
```

Or server-side:

```tsx
import { readConsent } from '@te-digital-tech/lgpd-consent-next/server';

export default async function RootLayout({ children }) {
  const consent = await readConsent();
  return (
    <html>
      <body>
        {consent.preferences.analytics && <ClarityScript />}
        {children}
      </body>
    </html>
  );
}
```

---

## Português

### Instalação (Next.js App Router)

```bash
pnpm add @te-digital-tech/lgpd-consent @te-digital-tech/lgpd-consent-react @te-digital-tech/lgpd-consent-next
```

### 1. Inicializar o Google Consent Mode v2

```tsx
// app/layout.tsx
import { ConsentScript } from '@te-digital-tech/lgpd-consent-next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <ConsentScript region="BR" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 2. Envolver a app com `<ConsentProvider>`

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
        storage: 'cookie',                 // recomendado pra leitura SSR
        cookieDomain: '.seusite.com',
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

### 3. Montar a UI do banner

```tsx
'use client';
import { useConsent, useStrings } from '@te-digital-tech/lgpd-consent-react';

export function CookieBanner() {
  const { state, accept, reject, openPreferences } = useConsent();
  const s = useStrings();
  if (state.status === 'granted') return null;
  return (
    <div role="dialog" aria-labelledby="cookie-title">
      <h2 id="cookie-title">{s.banner.title}</h2>
      <p>{s.banner.description}</p>
      <button onClick={accept}>{s.banner.accept}</button>
      <button onClick={reject}>{s.banner.reject}</button>
      <button onClick={openPreferences}>{s.banner.customize}</button>
    </div>
  );
}
```

### 4. Gate dos trackers

Cliente:

```tsx
'use client';
import { useCategory } from '@te-digital-tech/lgpd-consent-react';

export function ClarityScript() {
  const ok = useCategory('analytics');
  if (!ok) return null;
  return <script ... />;
}
```

Servidor:

```tsx
import { readConsent } from '@te-digital-tech/lgpd-consent-next/server';

export default async function RootLayout({ children }) {
  const consent = await readConsent();
  return (
    <html>
      <body>
        {consent.preferences.analytics && <ClarityScript />}
        {children}
      </body>
    </html>
  );
}
```
