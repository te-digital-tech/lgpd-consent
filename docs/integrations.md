# Integrations

[English](#english) · [Português](#português)

---

## English

### Google Consent Mode v2

Required for Google Ads in the EEA and the UK since March 2024. Recommended everywhere else, including Brazil.

```ts
import { gcmDefault } from '@te-digital/lgpd-consent/integrations/gcm';

// Boot script — call BEFORE any tracker loads
gcmDefault('BR');
```

In Next.js, use `<ConsentScript region="BR" />` in your root layout `<head>`.

Enable per-update sync in the provider:

```ts
integrations: { gcm: true }
```

This maps:

| Consent category | GCM signal |
|------------------|------------|
| `analytics` | `analytics_storage` |
| `marketing` | `ad_storage`, `ad_user_data`, `ad_personalization`, `personalization_storage` |
| `essential` | `security_storage`, `functionality_storage` (always granted) |

### Microsoft Clarity

```ts
integrations: {
  clarity: { projectId: 'your-clarity-id' }
}
```

The library lazy-loads the Clarity script only when `analytics` is granted. On revocation, Clarity is signaled to stop.

### Meta Pixel

```ts
integrations: {
  meta: { pixelId: 'your-pixel-id' }
}
```

Uses Meta's first-party `consent` API. The pixel starts in `revoke` state and is granted only when `marketing` is true.

### Google Tag Manager

```ts
integrations: { gtm: true }
```

Pushes `lgpd_consent_update` events to `window.dataLayer`. Use as a trigger in your GTM container:

```
Trigger Type: Custom Event
Event name: lgpd_consent_update
```

---

## Português

### Google Consent Mode v2

Obrigatório pra Google Ads no EEE e UK desde março de 2024. Recomendado no resto do mundo, incluindo Brasil.

```ts
import { gcmDefault } from '@te-digital/lgpd-consent/integrations/gcm';

// Boot script — chame ANTES de qualquer tracker carregar
gcmDefault('BR');
```

Em Next.js, use `<ConsentScript region="BR" />` no `<head>` do layout raiz.

Sync por update no provider:

```ts
integrations: { gcm: true }
```

Mapeamento:

| Categoria | Sinal GCM |
|-----------|-----------|
| `analytics` | `analytics_storage` |
| `marketing` | `ad_storage`, `ad_user_data`, `ad_personalization`, `personalization_storage` |
| `essential` | `security_storage`, `functionality_storage` (sempre granted) |

### Microsoft Clarity

```ts
integrations: {
  clarity: { projectId: 'seu-clarity-id' }
}
```

A lib carrega Clarity lazy só quando `analytics` é concedido. Na revogação, sinaliza pro Clarity parar.

### Meta Pixel

```ts
integrations: {
  meta: { pixelId: 'seu-pixel-id' }
}
```

Usa a API `consent` first-party do Meta. Pixel inicia em `revoke` e só é granted quando `marketing` é true.

### Google Tag Manager

```ts
integrations: { gtm: true }
```

Pusha eventos `lgpd_consent_update` no `window.dataLayer`. Use como trigger no seu container GTM:

```
Trigger Type: Custom Event
Event name: lgpd_consent_update
```
