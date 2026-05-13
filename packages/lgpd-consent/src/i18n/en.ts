import type { ConsentStrings } from '../types.js';

export const en: ConsentStrings = {
  locale: 'en',
  banner: {
    eyebrow: '// cookies & privacy',
    title: 'Cookies & privacy',
    description:
      'We use essential cookies to make the site work and, with your consent, analytics cookies to understand how it is used. Details in the Privacy Policy.',
    privacyLinkLabel: 'Privacy Policy',
    accept: 'Accept all',
    reject: 'Reject optional',
    customize: 'Customize',
  },
  preferences: {
    title: 'Cookie preferences',
    description:
      'Control which cookies can be used. Essential cookies cannot be disabled because they are required for the site to function.',
    save: 'Save preferences',
    accept: 'Accept all',
    reject: 'Reject optional',
    close: 'Close',
    enabled: 'enabled',
    disabled: 'disabled',
  },
  categories: {
    essential: {
      title: 'Essential',
      description:
        'Required for basic site functions (consent preferences, form security, session control). Always active — cannot be disabled.',
      locked: true,
    },
    analytics: {
      title: 'Analytics',
      description:
        'Anonymous browsing statistics (most visited pages, time on page, traffic source) used to improve the site. Does not identify you personally.',
    },
    marketing: {
      title: 'Marketing',
      description:
        'Measure paid campaigns and personalize ads on other platforms. We request consent for potential future use.',
    },
  },
};
