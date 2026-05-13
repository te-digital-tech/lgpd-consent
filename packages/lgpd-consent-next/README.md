# `@te-digital/lgpd-consent-next`

Next.js App Router adapter for `@te-digital/lgpd-consent`. Server-side consent reading + Google Consent Mode v2 boot script.

[English](../../README.md) · [Português](../../README.pt-BR.md)

## Install

```bash
pnpm add @te-digital/lgpd-consent @te-digital/lgpd-consent-react @te-digital/lgpd-consent-next
```

## Usage

### 1. Boot Google Consent Mode v2 in root layout

```tsx
// app/layout.tsx
import { ConsentScript } from '@te-digital/lgpd-consent-next';

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

This runs BEFORE any tracker, setting all consent states to `denied`. Required for GCM v2 compliance.

### 2. Read consent on the server

Useful for conditionally injecting tracker scripts only when the user has consented, avoiding the client-side flash.

```tsx
import { readConsent } from '@te-digital/lgpd-consent-next/server';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const consent = await readConsent({ currentPolicyVersion: 1 });
  return (
    <html>
      <body>
        {consent.preferences.analytics && <ClarityScript />}
        {consent.preferences.marketing && <MetaPixel />}
        {children}
      </body>
    </html>
  );
}
```

Requires the manager configured with `storage: 'cookie'` (or `'auto'` falling back to cookies).

## API

### `<ConsentScript region?, defaultAnalytics?, defaultMarketing? />`

Inline script tag (`strategy="beforeInteractive"`) emitting the GCM v2 `default` state.

### `readConsent(options?): Promise<ServerConsent>`

Server-side reader.

```ts
type ServerConsent = {
  status: 'pending' | 'granted' | 'expired';
  preferences: ConsentPreferences;
  acceptedAt: string | null;
  policyVersion: number | null;
};
```

## License

MIT © [T&E Digital](https://tedigital.com.br)
