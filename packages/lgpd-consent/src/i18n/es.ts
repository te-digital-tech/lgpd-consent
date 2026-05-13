import type { ConsentStrings } from '../types.js';

export const es: ConsentStrings = {
  locale: 'es',
  banner: {
    eyebrow: '// cookies y privacidad',
    title: 'Cookies y privacidad',
    description:
      'Usamos cookies esenciales para el funcionamiento del sitio y, con tu consentimiento, cookies de análisis para entender cómo se utiliza. Detalles en la Política de Privacidad.',
    privacyLinkLabel: 'Política de Privacidad',
    accept: 'Aceptar todo',
    reject: 'Rechazar opcionales',
    customize: 'Personalizar',
  },
  preferences: {
    title: 'Preferencias de cookies',
    description:
      'Controla qué cookies se pueden utilizar. Las cookies esenciales no se pueden desactivar porque son necesarias para el funcionamiento del sitio.',
    save: 'Guardar preferencias',
    accept: 'Aceptar todo',
    reject: 'Rechazar opcionales',
    close: 'Cerrar',
    enabled: 'activado',
    disabled: 'desactivado',
  },
  categories: {
    essential: {
      title: 'Esenciales',
      description:
        'Necesarias para las funciones básicas del sitio (preferencias de consentimiento, seguridad de formularios, control de sesión). Siempre activas — no se pueden desactivar.',
      locked: true,
    },
    analytics: {
      title: 'Análisis',
      description:
        'Estadísticas anónimas de navegación (páginas más visitadas, tiempo en página, origen del tráfico) utilizadas para mejorar el sitio. No te identifican personalmente.',
    },
    marketing: {
      title: 'Marketing',
      description:
        'Permiten medir campañas pagadas y personalizar anuncios en otras plataformas. Solicitamos consentimiento para un eventual uso futuro.',
    },
  },
};
