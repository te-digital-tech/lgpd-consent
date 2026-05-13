'use client';

import { createConsentManager } from '@te-digital/lgpd-consent';
import type { ConsentConfig, ConsentManager } from '@te-digital/lgpd-consent';
import { type ReactNode, useMemo } from 'react';
import { ConsentContext } from './ConsentContext.js';

export type ConsentProviderProps = {
  config: ConsentConfig;
  /** Pass a pre-built manager (useful for testing). When provided, `config` is ignored. */
  manager?: ConsentManager;
  children: ReactNode;
};

export function ConsentProvider({ config, manager, children }: ConsentProviderProps) {
  const value = useMemo(() => manager ?? createConsentManager(config), [manager, config]);
  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}
