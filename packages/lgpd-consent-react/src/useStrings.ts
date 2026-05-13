'use client';

import type { ConsentStrings } from '@te-digital/lgpd-consent';
import { useContext } from 'react';
import { ConsentContext } from './ConsentContext.js';

/**
 * Access the localized strings of the configured manager. Useful for building
 * banners and preference modals that match the locale set in the provider.
 */
export function useStrings(): ConsentStrings {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error('[lgpd-consent-react] useStrings must be used inside <ConsentProvider>');
  }
  return ctx.manager.strings;
}
