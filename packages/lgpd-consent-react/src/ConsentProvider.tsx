'use client';

import { createConsentManager } from '@te-digital/lgpd-consent';
import type { ConsentConfig, ConsentManager } from '@te-digital/lgpd-consent';
import { type ReactNode, useMemo, useState } from 'react';
import { ConsentContext } from './ConsentContext.js';

export type ConsentProviderProps = {
  config: ConsentConfig;
  /** Pass a pre-built manager (useful for testing). When provided, `config` is ignored. */
  manager?: ConsentManager;
  children: ReactNode;
};

export function ConsentProvider({ config, manager, children }: ConsentProviderProps) {
  const resolvedManager = useMemo(() => manager ?? createConsentManager(config), [manager, config]);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const value = useMemo(
    () => ({ manager: resolvedManager, preferencesOpen, setPreferencesOpen }),
    [resolvedManager, preferencesOpen],
  );
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}
