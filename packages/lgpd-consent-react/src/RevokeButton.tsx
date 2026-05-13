'use client';

import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { useConsent } from './useConsent.js';

export type RevokeButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  /** Render as a different element (e.g. `<a>` or a styled component). Default `<button>`. */
  asChild?: boolean;
  /** Confirmation copy passed to `window.confirm`. Omit to revoke immediately. */
  confirmMessage?: string;
  /** Called after the revoke completes. Use to e.g. close a menu or toast. */
  onRevoked?: () => void;
  children?: ReactNode;
};

/**
 * Headless button that clears the user's consent and re-prompts. The component
 * owns no styles — pass `className` or `asChild` to slot your own element in.
 *
 * @example
 * <RevokeButton className="text-sm underline" confirmMessage="Reset cookies?">
 *   Reset cookie preferences
 * </RevokeButton>
 */
export const RevokeButton = forwardRef<HTMLButtonElement, RevokeButtonProps>(function RevokeButton(
  { asChild, confirmMessage, onRevoked, children, ...rest },
  ref,
) {
  const { revoke } = useConsent();
  const handleClick = () => {
    if (confirmMessage && typeof window !== 'undefined' && !window.confirm(confirmMessage)) return;
    revoke();
    onRevoked?.();
  };

  if (asChild) {
    // Honor asChild by attaching the click handler via a tiny render-prop bridge:
    // we expect children to be a single element-like ReactNode rendered as-is.
    return (
      <span
        // biome-ignore lint/a11y/useSemanticElements: asChild is opt-in for custom elements
        role="button"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        tabIndex={0}
      >
        {children}
      </span>
    );
  }

  return (
    <button ref={ref} type="button" onClick={handleClick} {...rest}>
      {children}
    </button>
  );
});
