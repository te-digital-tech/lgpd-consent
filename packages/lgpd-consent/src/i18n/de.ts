import type { ConsentStrings } from '../types.js';

export const de: ConsentStrings = {
  locale: 'de',
  banner: {
    eyebrow: '// Cookies & Datenschutz',
    title: 'Cookies & Datenschutz',
    description:
      'Wir verwenden essentielle Cookies, damit die Website funktioniert, und – mit Ihrer Einwilligung – Analyse-Cookies, um die Nutzung zu verstehen. Details in der Datenschutzerklärung.',
    privacyLinkLabel: 'Datenschutzerklärung',
    accept: 'Alle akzeptieren',
    reject: 'Optionale ablehnen',
    customize: 'Anpassen',
  },
  preferences: {
    title: 'Cookie-Einstellungen',
    description:
      'Steuern Sie, welche Cookies verwendet werden dürfen. Essentielle Cookies können nicht deaktiviert werden, da sie für die Funktion der Website erforderlich sind.',
    save: 'Einstellungen speichern',
    accept: 'Alle akzeptieren',
    reject: 'Optionale ablehnen',
    close: 'Schließen',
    enabled: 'aktiviert',
    disabled: 'deaktiviert',
  },
  categories: {
    essential: {
      title: 'Essentiell',
      description:
        'Erforderlich für grundlegende Funktionen (Einwilligungspräferenzen, Formularsicherheit, Sitzungskontrolle). Immer aktiv – nicht deaktivierbar.',
      locked: true,
    },
    analytics: {
      title: 'Analyse',
      description:
        'Anonyme Nutzungsstatistiken (meistbesuchte Seiten, Verweildauer, Traffic-Quellen), um die Website zu verbessern. Identifizieren Sie nicht persönlich.',
    },
    marketing: {
      title: 'Marketing',
      description:
        'Messen bezahlter Kampagnen und Personalisierung von Anzeigen auf anderen Plattformen. Wir bitten um Einwilligung für mögliche zukünftige Nutzung.',
    },
  },
};
