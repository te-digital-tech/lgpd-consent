import type { ConsentStrings } from '../types.js';

export const ptBR: ConsentStrings = {
  locale: 'pt-BR',
  banner: {
    eyebrow: '// cookies & privacidade',
    title: 'Cookies & privacidade',
    description:
      'Usamos cookies essenciais para o funcionamento do site e, com seu consentimento, cookies de análise para entender como ele é usado. Detalhes na Política de Privacidade.',
    privacyLinkLabel: 'Política de Privacidade',
    accept: 'Aceitar todos',
    reject: 'Recusar opcionais',
    customize: 'Personalizar',
  },
  preferences: {
    title: 'Preferências de cookies',
    description:
      'Controle quais cookies podem ser usados. Cookies essenciais não podem ser desabilitados, pois são necessários para o funcionamento do site.',
    save: 'Salvar preferências',
    accept: 'Aceitar todos',
    reject: 'Recusar opcionais',
    close: 'Fechar',
    enabled: 'ativo',
    disabled: 'inativo',
  },
  categories: {
    essential: {
      title: 'Essenciais',
      description:
        'Necessários para o funcionamento básico do site (preferências de consentimento, segurança do formulário, controle de sessão). Sempre ativos — não podem ser desabilitados.',
      locked: true,
    },
    analytics: {
      title: 'Análise de uso',
      description:
        'Estatísticas anônimas de navegação (páginas mais visitadas, tempo de permanência, origem do tráfego) usadas para melhorar o site. Não identificam você pessoalmente.',
    },
    marketing: {
      title: 'Marketing',
      description:
        'Permitem mensurar campanhas pagas e personalizar anúncios em outras plataformas. Pedimos consentimento para o caso de uso futuro.',
    },
  },
};
