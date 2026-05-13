import type { ConsentManager, ConsentState } from './types.js';

/**
 * Portable, machine-readable consent record produced for Art. 18 data subject
 * access requests. Includes the current decision, the policy version active at
 * the time, and the user agent for non-repudiation context.
 */
export type ConsentLogRecord = {
  /** Stable identifier for the data subject. Optional — useful when bundling. */
  subjectId?: string;
  /** ISO timestamp the export was generated at (not the consent decision time). */
  exportedAt: string;
  /** Status snapshot. */
  status: ConsentState['status'];
  /** Categories the user has currently granted. */
  granted: string[];
  /** Categories the user has currently denied. */
  denied: string[];
  /** When the user last saved a decision. */
  acceptedAt: string | null;
  /** Policy version active when the user saved. */
  policyVersion: number | null;
  /** Locale used when the banner was presented (so DPOs know what copy applied). */
  locale: string;
  /** Browser user agent string at export time. */
  userAgent?: string;
};

/**
 * Build a portable record of the user's current consent decision. Pair with a
 * server-side endpoint to fulfil LGPD Art. 18 access/portability requests.
 */
export function exportConsentLog(
  manager: ConsentManager,
  options: { subjectId?: string } = {},
): ConsentLogRecord {
  const state = manager.get();
  const granted: string[] = [];
  const denied: string[] = [];
  for (const [cat, value] of Object.entries(state.preferences)) {
    if (value === true) granted.push(cat);
    else denied.push(cat);
  }
  return {
    subjectId: options.subjectId,
    exportedAt: new Date().toISOString(),
    status: state.status,
    granted,
    denied,
    acceptedAt: state.acceptedAt,
    policyVersion: state.policyVersion,
    locale: manager.strings.locale,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };
}

/**
 * Convenience: stringify the export with pretty-printed JSON for download via
 * `URL.createObjectURL(new Blob([json], { type: 'application/json' }))`.
 */
export function exportConsentLogJson(
  manager: ConsentManager,
  options: { subjectId?: string } = {},
): string {
  return JSON.stringify(exportConsentLog(manager, options), null, 2);
}
