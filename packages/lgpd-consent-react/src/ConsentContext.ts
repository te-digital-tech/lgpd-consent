import type { ConsentManager } from '@te-digital/lgpd-consent';
import { type Dispatch, type SetStateAction, createContext } from 'react';

export type ConsentContextValue = {
  manager: ConsentManager;
  preferencesOpen: boolean;
  setPreferencesOpen: Dispatch<SetStateAction<boolean>>;
};

export const ConsentContext = createContext<ConsentContextValue | null>(null);
ConsentContext.displayName = 'ConsentContext';
