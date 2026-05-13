import type { ConsentEvent } from './types.js';

/**
 * Banner-interaction audit trail. Distinct from the consent log (which records
 * accept/reject/update/revoke decisions): this records *user behavior* around
 * the banner so DPOs can defend the implementation. Examples: how long the
 * banner stayed visible before a click, which button was used, whether the
 * preferences modal was opened.
 *
 * Forwarded through the same `log` hook callers already provide, with a
 * dedicated event type so downstream code can route it differently.
 */
export type BannerAuditEvent =
  | { type: 'banner_impression'; at: string; surface: 'banner' | 'preferences' }
  | {
      type: 'banner_interaction';
      at: string;
      surface: 'banner' | 'preferences';
      action: 'accept' | 'reject' | 'customize' | 'save' | 'close';
      timeToDecisionMs?: number;
    };

export type AuditSink = (event: BannerAuditEvent | ConsentEvent) => void | Promise<void>;

export type AuditRecorder = {
  impression(surface?: 'banner' | 'preferences'): void;
  interaction(
    action: 'accept' | 'reject' | 'customize' | 'save' | 'close',
    surface?: 'banner' | 'preferences',
  ): void;
};

/**
 * Build an audit recorder that derives `timeToDecisionMs` from the first
 * `impression()` call on the same surface. Safe to invoke before the impression
 * — the field is simply omitted in that case.
 */
export function createAuditRecorder(sink?: AuditSink): AuditRecorder {
  const firstImpressionAt: Partial<Record<'banner' | 'preferences', number>> = {};

  function emit(event: BannerAuditEvent) {
    if (!sink) return;
    try {
      const result = sink(event);
      if (result instanceof Promise) result.catch(() => {});
    } catch {
      // never throw from telemetry
    }
  }

  return {
    impression(surface = 'banner') {
      if (firstImpressionAt[surface] === undefined) firstImpressionAt[surface] = Date.now();
      emit({ type: 'banner_impression', at: new Date().toISOString(), surface });
    },
    interaction(action, surface = 'banner') {
      const since = firstImpressionAt[surface];
      emit({
        type: 'banner_interaction',
        at: new Date().toISOString(),
        surface,
        action,
        timeToDecisionMs: since ? Date.now() - since : undefined,
      });
    },
  };
}
