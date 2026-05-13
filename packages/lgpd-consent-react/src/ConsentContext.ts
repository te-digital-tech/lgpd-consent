import type { ConsentManager } from '@te-digital/lgpd-consent';
import { createContext } from 'react';

export const ConsentContext = createContext<ConsentManager | null>(null);
ConsentContext.displayName = 'ConsentContext';
