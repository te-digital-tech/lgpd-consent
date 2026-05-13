'use client';

import type { ConsentCategory, ConsentPreferences } from '@te-digital/lgpd-consent';
import { type ReactNode, useEffect, useState } from 'react';
import { useConsent } from './useConsent.js';

export type PreferencesModalRenderProps = {
  categories: ConsentCategory[];
  draft: ConsentPreferences;
  setCategory: (cat: ConsentCategory, value: boolean) => void;
  save: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  close: () => void;
};

export type PreferencesModalProps = {
  /** Categories to render. Always include `essential` (it renders as locked). */
  categories: ConsentCategory[];
  /** Render-prop body. */
  children: (render: PreferencesModalRenderProps) => ReactNode;
};

/**
 * Headless preferences modal. Owns the **draft** state (toggles before save) so
 * UI can render checkboxes without committing changes until the user clicks
 * save. Opens/closes via `useConsent().openPreferences()`.
 *
 * @example
 * <PreferencesModal categories={['essential', 'analytics', 'marketing']}>
 *   {({ draft, setCategory, save, close }) => (
 *     <dialog open>
 *       <label>
 *         <input
 *           type="checkbox"
 *           checked={draft.analytics === true}
 *           onChange={(e) => setCategory('analytics', e.target.checked)}
 *         />
 *         Analytics
 *       </label>
 *       <button onClick={save}>Save</button>
 *       <button onClick={close}>Cancel</button>
 *     </dialog>
 *   )}
 * </PreferencesModal>
 */
export function PreferencesModal({ categories, children }: PreferencesModalProps) {
  const { state, set, accept, reject, preferencesOpen, closePreferences } = useConsent();
  const [draft, setDraft] = useState<ConsentPreferences>(state.preferences);

  useEffect(() => {
    if (preferencesOpen) setDraft(state.preferences);
  }, [preferencesOpen, state.preferences]);

  if (!preferencesOpen) return null;

  const render: PreferencesModalRenderProps = {
    categories,
    draft,
    setCategory(cat, value) {
      if (cat === 'essential') return;
      setDraft((prev) => ({ ...prev, [cat]: value }) as ConsentPreferences);
    },
    save() {
      set(draft);
      closePreferences();
    },
    acceptAll() {
      accept();
      closePreferences();
    },
    rejectAll() {
      reject();
      closePreferences();
    },
    close: closePreferences,
  };

  return <>{children(render)}</>;
}
