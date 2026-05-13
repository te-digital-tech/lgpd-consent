---
"@te-digital/lgpd-consent": patch
"@te-digital/lgpd-consent-react": patch
"@te-digital/lgpd-consent-next": patch
---

Drop `provenance: true` from each package's `publishConfig`. Provenance is
already enabled in CI via `NPM_CONFIG_PROVENANCE: "true"` in the release
workflow env block, which is the only place we publish from going forward.
Removing the duplicate setting from `package.json` keeps the release-time
behaviour identical and stops blocking ad-hoc `npm publish` runs from
machines without an OIDC provider (which is where provenance fails with
`Automatic provenance generation not supported for provider: null`).

No runtime change. Pure release-tooling cleanup.
