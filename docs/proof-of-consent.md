# Proof of consent

[English](#english) · [Português](#português)

---

## English

LGPD Art. 8 requires that the controller (your company) be able to **prove** the data subject consented. This library provides a `log` hook that fires on every consent change. You are responsible for persisting it durably.

### Minimum event payload

The hook receives:

```ts
{
  type: 'accepted' | 'rejected' | 'updated' | 'revoked',
  preferences: { essential: true, analytics: boolean, marketing: boolean },
  acceptedAt: string,    // ISO 8601
  policyVersion: number,
  userAgent: string,     // browser-provided
  meta?: Record<string, unknown>,
}
```

### Recommended backend schema

```sql
CREATE TABLE consent_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id),
  session_id      text,
  event_type      text NOT NULL,
  preferences     jsonb NOT NULL,
  accepted_at     timestamptz NOT NULL,
  policy_version  int NOT NULL,
  user_agent      text,
  ip_hash         text,             -- SHA-256(ip + daily_salt) — pseudonymize
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX consent_log_user_id_idx ON consent_log (user_id);
CREATE INDEX consent_log_session_id_idx ON consent_log (session_id);
```

### Why hash the IP

Storing raw IPs is itself personal data under LGPD. Hashing with a rotating daily salt lets you correlate sessions within a window without retaining identifiable data.

### Retention

Retain consent logs for **at least the lifetime of any data processed under that consent + applicable statutes of limitations**. For consumer relationships in Brazil this typically means 5 years post-relationship.

### Implementation example (Next.js route handler)

```ts
// app/api/consent-log/route.ts
import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { sql } from '@/lib/db';

const DAILY_SALT = process.env.CONSENT_IP_SALT!;

export async function POST(req: Request) {
  const event = await req.json();
  const ip = req.headers.get('x-forwarded-for') ?? '';
  const ipHash = createHash('sha256').update(ip + DAILY_SALT).digest('hex');

  await sql`
    INSERT INTO consent_log
      (event_type, preferences, accepted_at, policy_version, user_agent, ip_hash)
    VALUES
      (${event.type}, ${JSON.stringify(event.preferences)}, ${event.acceptedAt},
       ${event.policyVersion}, ${event.userAgent}, ${ipHash})
  `;

  return NextResponse.json({ ok: true });
}
```

---

## Português

A LGPD (Art. 8) exige que o controlador (sua empresa) consiga **provar** que o titular consentiu. Esta lib expõe um hook `log` disparado em cada mudança. Você é responsável por persistir de forma durável.

### Payload mínimo do evento

O hook recebe:

```ts
{
  type: 'accepted' | 'rejected' | 'updated' | 'revoked',
  preferences: { essential: true, analytics: boolean, marketing: boolean },
  acceptedAt: string,    // ISO 8601
  policyVersion: number,
  userAgent: string,
  meta?: Record<string, unknown>,
}
```

### Schema recomendado no backend

```sql
CREATE TABLE consent_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES users(id),
  session_id      text,
  event_type      text NOT NULL,
  preferences     jsonb NOT NULL,
  accepted_at     timestamptz NOT NULL,
  policy_version  int NOT NULL,
  user_agent      text,
  ip_hash         text,             -- SHA-256(ip + salt_diario) — pseudonimiza
  created_at      timestamptz NOT NULL DEFAULT now()
);
```

### Por que hash do IP

IP cru é dado pessoal pela LGPD. Hash com salt diário rotativo permite correlacionar sessões num intervalo sem reter dado identificável.

### Retenção

Mantenha os logs por **pelo menos o tempo de vida do tratamento amparado por aquele consentimento + prazos prescricionais aplicáveis**. Pra relações de consumo no Brasil geralmente significa 5 anos pós-relação.

### Exemplo (Next.js route handler)

```ts
// app/api/consent-log/route.ts
import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { sql } from '@/lib/db';

const DAILY_SALT = process.env.CONSENT_IP_SALT!;

export async function POST(req: Request) {
  const event = await req.json();
  const ip = req.headers.get('x-forwarded-for') ?? '';
  const ipHash = createHash('sha256').update(ip + DAILY_SALT).digest('hex');

  await sql`
    INSERT INTO consent_log
      (event_type, preferences, accepted_at, policy_version, user_agent, ip_hash)
    VALUES
      (${event.type}, ${JSON.stringify(event.preferences)}, ${event.acceptedAt},
       ${event.policyVersion}, ${event.userAgent}, ${ipHash})
  `;

  return NextResponse.json({ ok: true });
}
```
