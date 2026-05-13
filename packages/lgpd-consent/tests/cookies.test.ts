import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_COOKIE_CATALOG, clearCookiesByCategory, scanCookies } from '../src/cookies.js';

beforeEach(() => {
  if (typeof document !== 'undefined') {
    for (const c of document.cookie.split('; ')) {
      const name = c.split('=')[0];
      if (name) document.cookie = `${name}=; max-age=0; path=/`;
    }
  }
});

describe('scanCookies', () => {
  it('tags known cookies by category', () => {
    document.cookie = '_ga=GA1.1.123; path=/';
    document.cookie = '_fbp=fb.123; path=/';
    document.cookie = 'random=xyz; path=/';
    const found = scanCookies();
    const byName = Object.fromEntries(found.map((c) => [c.name, c.category]));
    expect(byName._ga).toBe('analytics');
    expect(byName._fbp).toBe('marketing');
    expect(byName.random).toBe('unknown');
  });

  it('honors wildcard patterns', () => {
    document.cookie = '_ga_ABCDEF=value; path=/';
    expect(scanCookies().find((c) => c.name === '_ga_ABCDEF')?.category).toBe('analytics');
  });
});

describe('clearCookiesByCategory', () => {
  it('removes cookies in the requested categories only', () => {
    document.cookie = '_ga=GA1; path=/';
    document.cookie = '_fbp=fb; path=/';
    document.cookie = 'session=keep; path=/';
    clearCookiesByCategory(['analytics']);
    expect(document.cookie).not.toMatch(/_ga=/);
    expect(document.cookie).toMatch(/_fbp=/);
    expect(document.cookie).toMatch(/session=/);
  });

  it('never touches essential', () => {
    document.cookie = 'lgpd-consent=keep; path=/';
    clearCookiesByCategory(['essential']);
    expect(document.cookie).toMatch(/lgpd-consent=/);
  });

  it('uses the catalog passed in', () => {
    document.cookie = 'my_tracker=x; path=/';
    clearCookiesByCategory(['analytics'], { ...DEFAULT_COOKIE_CATALOG, analytics: ['my_tracker'] });
    expect(document.cookie).not.toMatch(/my_tracker=/);
  });
});
