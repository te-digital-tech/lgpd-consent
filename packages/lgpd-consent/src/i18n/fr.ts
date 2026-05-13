import type { ConsentStrings } from '../types.js';

export const fr: ConsentStrings = {
  locale: 'fr',
  banner: {
    eyebrow: '// cookies et confidentialité',
    title: 'Cookies et confidentialité',
    description:
      "Nous utilisons des cookies essentiels au fonctionnement du site et, avec votre consentement, des cookies d'analyse pour comprendre son utilisation. Détails dans la Politique de Confidentialité.",
    privacyLinkLabel: 'Politique de Confidentialité',
    accept: 'Tout accepter',
    reject: 'Refuser les optionnels',
    customize: 'Personnaliser',
  },
  preferences: {
    title: 'Préférences des cookies',
    description:
      'Contrôlez les cookies pouvant être utilisés. Les cookies essentiels ne peuvent pas être désactivés car ils sont nécessaires au fonctionnement du site.',
    save: 'Enregistrer les préférences',
    accept: 'Tout accepter',
    reject: 'Refuser les optionnels',
    close: 'Fermer',
    enabled: 'activé',
    disabled: 'désactivé',
  },
  categories: {
    essential: {
      title: 'Essentiels',
      description:
        'Nécessaires aux fonctions de base du site (préférences de consentement, sécurité des formulaires, gestion de session). Toujours actifs — non désactivables.',
      locked: true,
    },
    analytics: {
      title: 'Analyse',
      description:
        'Statistiques anonymes de navigation (pages les plus visitées, temps passé, origine du trafic) utilisées pour améliorer le site. Ne vous identifient pas personnellement.',
    },
    marketing: {
      title: 'Marketing',
      description:
        "Permettent de mesurer les campagnes payantes et de personnaliser les publicités sur d'autres plateformes. Nous demandons votre consentement pour un usage futur éventuel.",
    },
  },
};
