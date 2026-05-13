import { describe, expect, it } from 'vitest';
import { resolveGeoGate } from '../src/geo.js';

describe('resolveGeoGate', () => {
  it('shows banner when country is in showFor', () => {
    expect(resolveGeoGate('BR', { showFor: ['BR'] }).shouldShowBanner).toBe(true);
    expect(resolveGeoGate('US', { showFor: ['BR'] }).shouldShowBanner).toBe(false);
  });

  it('skips banner when country is in skipFor', () => {
    expect(resolveGeoGate('US', { skipFor: ['US'] }).shouldShowBanner).toBe(false);
    expect(resolveGeoGate('BR', { skipFor: ['US'] }).shouldShowBanner).toBe(true);
  });

  it('defaults to show when country is unknown', () => {
    expect(resolveGeoGate(null, { showFor: ['BR'] }).shouldShowBanner).toBe(true);
  });

  it('honors onUnknown: skip', () => {
    expect(resolveGeoGate(null, { onUnknown: 'skip' }).shouldShowBanner).toBe(false);
  });

  it('normalizes case', () => {
    expect(resolveGeoGate('br', { showFor: ['BR'] }).shouldShowBanner).toBe(true);
  });
});
