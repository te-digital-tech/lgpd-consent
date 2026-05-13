'use client';

import type { ConsentCategory } from '@te-digital-tech/lgpd-consent';
import { useConsent } from './useConsent.js';

/**
 * Convenience hook to check whether a single category is currently granted.
 *
 * @example
 * function Analytics() {
 *   const ok = useCategory('analytics');
 *   if (!ok) return null;
 *   return <ClarityScript />;
 * }
 */
export function useCategory(category: ConsentCategory): boolean {
  const { state, isAllowed } = useConsent();
  // depend on state so consumers re-render on change
  void state;
  return isAllowed(category);
}
