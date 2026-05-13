'use client';

import type { ConsentCategory, ConsentPreferences, ConsentState } from '@te-digital/lgpd-consent';
import { useCallback, useContext, useSyncExternalStore } from 'react';
import { ConsentContext } from './ConsentContext.js';

export type UseConsentReturn = {
  state: ConsentState;
  accept: () => void;
  reject: () => void;
  set: (partial: Partial<ConsentPreferences>) => void;
  revoke: () => void;
  isAllowed: (category: ConsentCategory) => boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  preferencesOpen: boolean;
};

/**
 * Access the consent manager from React.
 *
 * Must be used inside `<ConsentProvider>`.
 */
export function useConsent(): UseConsentReturn {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error('[lgpd-consent-react] useConsent must be used inside <ConsentProvider>');
  }
  const { manager, preferencesOpen, setPreferencesOpen } = ctx;

  const subscribe = useCallback((cb: () => void) => manager.on('change', cb), [manager]);
  const getSnapshot = useCallback(() => manager.get(), [manager]);

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    state,
    accept: useCallback(() => manager.accept(), [manager]),
    reject: useCallback(() => manager.reject(), [manager]),
    set: useCallback((partial) => manager.set(partial), [manager]),
    revoke: useCallback(() => manager.revoke(), [manager]),
    isAllowed: useCallback((cat) => manager.isAllowed(cat), [manager]),
    openPreferences: useCallback(() => setPreferencesOpen(true), [setPreferencesOpen]),
    closePreferences: useCallback(() => setPreferencesOpen(false), [setPreferencesOpen]),
    preferencesOpen,
  };
}
