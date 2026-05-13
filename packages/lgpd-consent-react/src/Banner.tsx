'use client';

import type { ConsentState } from '@te-digital/lgpd-consent';
import { type ReactNode, useEffect, useRef } from 'react';
import { useConsent } from './useConsent.js';

export type BannerRenderProps = {
  state: ConsentState;
  accept: () => void;
  reject: () => void;
  openPreferences: () => void;
};

export type BannerProps = {
  /** Optionally suppress the banner outside Brazil. Skips render when false. */
  active?: boolean;
  /** Render children only when status is `pending` or `expired`. */
  children: ReactNode | ((render: BannerRenderProps) => ReactNode);
  /** Called the first time the banner becomes visible (per session). */
  onImpression?: () => void;
};

/**
 * Headless cookie banner. Renders children only while consent is `pending` or
 * `expired`. Pass a function-as-child to receive render props with bound
 * handlers, or pass JSX and use `useConsent` inside it.
 *
 * @example
 * <Banner>
 *   {({ accept, reject, openPreferences }) => (
 *     <div role="dialog" aria-live="polite">
 *       <p>...</p>
 *       <button onClick={accept}>Accept all</button>
 *       <button onClick={reject}>Reject optional</button>
 *       <button onClick={openPreferences}>Preferences</button>
 *     </div>
 *   )}
 * </Banner>
 */
export function Banner({ active = true, children, onImpression }: BannerProps) {
  const { state, accept, reject, openPreferences } = useConsent();
  const fired = useRef(false);
  const visible = active && (state.status === 'pending' || state.status === 'expired');

  useEffect(() => {
    if (visible && !fired.current) {
      fired.current = true;
      onImpression?.();
    }
  }, [visible, onImpression]);

  if (!visible) return null;
  if (typeof children === 'function')
    return <>{children({ state, accept, reject, openPreferences })}</>;
  return <>{children}</>;
}
