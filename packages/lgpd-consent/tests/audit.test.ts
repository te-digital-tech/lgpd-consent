import { describe, expect, it, vi } from 'vitest';
import { createAuditRecorder } from '../src/audit.js';

describe('createAuditRecorder', () => {
  it('emits impression and interaction events to the sink', () => {
    const sink = vi.fn();
    const rec = createAuditRecorder(sink);
    rec.impression('banner');
    rec.interaction('accept', 'banner');
    expect(sink).toHaveBeenCalledTimes(2);
    expect(sink.mock.calls[0]?.[0].type).toBe('banner_impression');
    expect(sink.mock.calls[1]?.[0].type).toBe('banner_interaction');
  });

  it('includes timeToDecisionMs once impression has fired', () => {
    const sink = vi.fn();
    const rec = createAuditRecorder(sink);
    rec.impression('banner');
    rec.interaction('reject', 'banner');
    const last = sink.mock.calls[1]?.[0];
    expect(last.timeToDecisionMs).toBeTypeOf('number');
    expect(last.timeToDecisionMs).toBeGreaterThanOrEqual(0);
  });

  it('omits timeToDecisionMs without a prior impression', () => {
    const sink = vi.fn();
    const rec = createAuditRecorder(sink);
    rec.interaction('reject', 'banner');
    expect(sink.mock.calls[0]?.[0].timeToDecisionMs).toBeUndefined();
  });

  it('swallows sink errors so telemetry never breaks consent', () => {
    const rec = createAuditRecorder(() => {
      throw new Error('boom');
    });
    expect(() => rec.impression('banner')).not.toThrow();
  });
});
