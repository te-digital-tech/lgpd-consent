import type { ConsentEvent, ConsentPreferences } from './types.js';

export type LogContext = {
  policyVersion: number;
  log?: (event: ConsentEvent) => void | Promise<void>;
};

/**
 * Fires a consent change event to the user-provided logger.
 *
 * The logger is intentionally fire-and-forget — we don't await it because consent
 * decisions must apply synchronously in the UI. The caller is responsible for
 * batching, retries, and durable storage on the server side.
 */
export function emitLog(
  type: ConsentEvent['type'],
  preferences: ConsentPreferences,
  ctx: LogContext,
  meta?: Record<string, unknown>,
): void {
  if (!ctx.log) return;

  const event: ConsentEvent = {
    type,
    preferences,
    acceptedAt: new Date().toISOString(),
    policyVersion: ctx.policyVersion,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    meta,
  };

  try {
    const result = ctx.log(event);
    if (result instanceof Promise) {
      result.catch(() => {
        // Swallow — logging failure must never break consent application.
      });
    }
  } catch {
    // Same — never throw from a consent action because the logger broke.
  }
}
