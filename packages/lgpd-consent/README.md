# `@te-digital/lgpd-consent`

Framework-agnostic core of the LGPD cookie consent manager.

[English](../../README.md) · [Português](../../README.pt-BR.md)

## Install

```bash
pnpm add @te-digital/lgpd-consent
```

## Usage

```ts
import { createConsentManager } from '@te-digital/lgpd-consent';
import { ptBR } from '@te-digital/lgpd-consent/i18n';

const consent = createConsentManager({
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
});

consent.accept();
consent.isAllowed('analytics');  // → true
consent.on('change', (state) => console.log(state));
```

## API

### `createConsentManager(config: ConsentConfig): ConsentManager`

| Option | Type | Default |
|--------|------|---------|
| `categories` | `ConsentCategory[]` | required, must include `'essential'` |
| `policyVersion` | `number` | required |
| `storage` | `'localStorage' \| 'cookie' \| 'auto'` | `'auto'` |
| `storageKey` | `string` | `'lgpd-consent'` |
| `cookieDomain` | `string` | current host |
| `cookieMaxAge` | `number` (seconds) | `31_536_000` (1 year) |
| `strings` | `ConsentStrings` | English |
| `log` | `(event: ConsentEvent) => void \| Promise<void>` | none |
| `integrations` | `IntegrationsConfig` | none |

### `ConsentManager`

```ts
manager.get(): ConsentState
manager.accept(): void
manager.reject(): void
manager.set(partial: Partial<ConsentPreferences>): void
manager.revoke(): void
manager.on('change', listener): () => void  // returns unsubscribe
manager.isAllowed(category): boolean
manager.strings: ConsentStrings
```

## Integrations

```ts
import { gcmDefault } from '@te-digital/lgpd-consent/integrations/gcm';

// Call once on app boot, BEFORE any tracker loads
gcmDefault('BR');
```

| Module | Export | Purpose |
|--------|--------|---------|
| `@te-digital/lgpd-consent/integrations/gcm` | `gcmDefault`, `applyGcm` | Google Consent Mode v2 |
| `@te-digital/lgpd-consent/integrations/clarity` | `applyClarity` | Microsoft Clarity |
| `@te-digital/lgpd-consent/integrations/meta` | `applyMeta` | Meta Pixel |
| `@te-digital/lgpd-consent/integrations/gtm` | `applyGtm` | GTM dataLayer push |

## i18n

```ts
import { en, ptBR } from '@te-digital/lgpd-consent/i18n';
```

To add a locale, copy `src/i18n/en.ts`, translate, and submit a PR.

## License

MIT © [T&E Digital](https://tedigital.com.br)
