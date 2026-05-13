# `@te-digital-tech/lgpd-consent-react`

React adapter for `@te-digital-tech/lgpd-consent`. Hooks + headless components.

[English](../../README.md) · [Português](../../README.pt-BR.md)

## Install

```bash
pnpm add @te-digital-tech/lgpd-consent @te-digital-tech/lgpd-consent-react
```

## Usage

```tsx
'use client';
import { ConsentProvider, useConsent, useCategory } from '@te-digital-tech/lgpd-consent-react';
import { ptBR } from '@te-digital-tech/lgpd-consent/i18n';

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider
      config={{
        categories: ['essential', 'analytics', 'marketing'],
        policyVersion: 1,
        strings: ptBR,
        integrations: { gcm: true },
      }}
    >
      {children}
      <CookieBanner />
    </ConsentProvider>
  );
}

function CookieBanner() {
  const { state, accept, reject, openPreferences } = useConsent();
  if (state.status !== 'pending') return null;
  return (
    <div role="dialog">
      <button onClick={accept}>Accept</button>
      <button onClick={reject}>Reject optional</button>
      <button onClick={openPreferences}>Customize</button>
    </div>
  );
}

function Analytics() {
  const ok = useCategory('analytics');
  if (!ok) return null;
  return <ClarityScript />;
}
```

## API

### `<ConsentProvider config={...}>`

Wrap your app. Single source of truth for consent state. Use the React hooks inside.

### `useConsent()`

```ts
const {
  state,                  // ConsentState
  accept,                 // () => void
  reject,                 // () => void
  set,                    // (partial) => void
  revoke,                 // () => void
  isAllowed,              // (category) => boolean
  openPreferences,        // () => void
  closePreferences,       // () => void
  preferencesOpen,        // boolean
} = useConsent();
```

### `useCategory(category)`

Returns `true` if the category is currently granted.

### `useStrings()`

Returns the localized strings of the manager (locale + copy).

## License

MIT © [T&E Digital](https://tedigital.com.br)
