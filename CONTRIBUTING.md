# Contributing

[English](#english) · [Português](#português)

---

## English

Thanks for considering a contribution. Issues, PRs, translations, and integration recipes are all welcome.

### Development setup

```bash
git clone https://github.com/te-digital-tech/lgpd-consent.git
cd lgpd-consent
pnpm install
pnpm build
pnpm test
```

### Project structure

```
packages/
├── lgpd-consent/          # core (framework-agnostic)
├── lgpd-consent-react/    # React adapter
└── lgpd-consent-next/     # Next.js adapter
```

### Workflow

1. Open an issue first if proposing a non-trivial change
2. Fork the repo, create a feature branch
3. Make your change. Write tests
4. Run `pnpm lint && pnpm typecheck && pnpm test`
5. Run `pnpm changeset` to describe the change
6. Open a PR against `main`

### Translations

To add a locale, copy `packages/lgpd-consent/src/i18n/en.ts`, translate the strings, and export from `packages/lgpd-consent/src/i18n/index.ts`.

### Code style

- Biome handles lint + format. Run `pnpm lint:fix`
- TypeScript strict mode enforced
- No runtime dependencies in the core package
- Public API changes need a JSDoc block

### License

By contributing you agree your contribution is licensed under MIT.

---

## Português

Obrigado por considerar contribuir. Issues, PRs, traduções e receitas de integração são bem-vindas.

### Setup de desenvolvimento

```bash
git clone https://github.com/te-digital-tech/lgpd-consent.git
cd lgpd-consent
pnpm install
pnpm build
pnpm test
```

### Estrutura do projeto

```
packages/
├── lgpd-consent/          # core (framework-agnostic)
├── lgpd-consent-react/    # adapter React
└── lgpd-consent-next/     # adapter Next.js
```

### Fluxo

1. Abra uma issue antes pra mudanças não-triviais
2. Fork do repo, branch de feature
3. Faça a mudança. Escreva testes
4. Rode `pnpm lint && pnpm typecheck && pnpm test`
5. Rode `pnpm changeset` pra descrever a mudança
6. Abra PR pro `main`

### Traduções

Pra adicionar um locale, copie `packages/lgpd-consent/src/i18n/en.ts`, traduza as strings e exporte em `packages/lgpd-consent/src/i18n/index.ts`.

### Estilo de código

- Biome cuida de lint + format. Roda `pnpm lint:fix`
- TypeScript strict mode obrigatório
- Zero runtime deps no pacote core
- Mudanças na API pública precisam de JSDoc

### Licença

Ao contribuir você concorda que sua contribuição é licenciada sob MIT.
