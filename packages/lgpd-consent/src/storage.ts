import type { ConsentState, StorageStrategy } from './types.js';

const DEFAULT_KEY = 'lgpd-consent';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type StoredPayload = {
  preferences: Record<string, boolean>;
  acceptedAt: string;
  policyVersion: number;
  version: 1;
};

export type StorageAdapter = {
  read(): StoredPayload | null;
  write(payload: StoredPayload): void;
  clear(): void;
};

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function hasDocument(): boolean {
  return typeof document !== 'undefined';
}

function localStorageAdapter(key: string): StorageAdapter {
  return {
    read() {
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as StoredPayload;
        if (parsed.version !== 1) return null;
        return parsed;
      } catch {
        return null;
      }
    },
    write(payload) {
      try {
        window.localStorage.setItem(key, JSON.stringify(payload));
      } catch {
        // Quota exceeded, private mode, etc. Fail silently — caller still has in-memory state.
      }
    },
    clear() {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    },
  };
}

function cookieAdapter(key: string, domain?: string, maxAge = ONE_YEAR_SECONDS): StorageAdapter {
  const domainAttr = domain ? `; domain=${domain}` : '';
  return {
    read() {
      if (!hasDocument()) return null;
      const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
      if (!match?.[1]) return null;
      try {
        const parsed = JSON.parse(decodeURIComponent(match[1])) as StoredPayload;
        if (parsed.version !== 1) return null;
        return parsed;
      } catch {
        return null;
      }
    },
    write(payload) {
      if (!hasDocument()) return;
      const value = encodeURIComponent(JSON.stringify(payload));
      document.cookie = `${key}=${value}; path=/; max-age=${maxAge}; samesite=lax${domainAttr}`;
    },
    clear() {
      if (!hasDocument()) return;
      document.cookie = `${key}=; path=/; max-age=0${domainAttr}`;
    },
  };
}

/**
 * Compose a storage adapter from the configured strategy. `auto` prefers localStorage
 * for ergonomics; cookies are needed when the server must read consent (SSR).
 */
export function createStorage(
  strategy: StorageStrategy = 'auto',
  options: { key?: string; cookieDomain?: string; cookieMaxAge?: number } = {},
): StorageAdapter {
  const key = options.key ?? DEFAULT_KEY;
  const useLs = strategy === 'localStorage' || (strategy === 'auto' && hasLocalStorage());
  if (useLs) return localStorageAdapter(key);
  return cookieAdapter(key, options.cookieDomain, options.cookieMaxAge);
}

export function buildState(
  payload: StoredPayload | null,
  currentPolicyVersion: number,
  categories: string[],
): ConsentState {
  if (!payload) {
    return {
      status: 'pending',
      preferences: buildDefaultPrefs(categories),
      acceptedAt: null,
      policyVersion: null,
    };
  }

  const isStale = payload.policyVersion < currentPolicyVersion;
  if (isStale) {
    return {
      status: 'expired',
      preferences: buildDefaultPrefs(categories),
      acceptedAt: payload.acceptedAt,
      policyVersion: payload.policyVersion,
    };
  }

  return {
    status: 'granted',
    preferences: mergeWithDefaults(payload.preferences, categories),
    acceptedAt: payload.acceptedAt,
    policyVersion: payload.policyVersion,
  };
}

function buildDefaultPrefs(categories: string[]) {
  const out = { essential: true } as Record<string, boolean> & { essential: true };
  for (const cat of categories) {
    if (cat === 'essential') continue;
    out[cat] = false;
  }
  return out as ConsentState['preferences'];
}

function mergeWithDefaults(stored: Record<string, boolean>, categories: string[]) {
  const base = buildDefaultPrefs(categories);
  for (const cat of categories) {
    if (cat === 'essential') continue;
    if (cat in stored) base[cat] = stored[cat] === true;
  }
  return base;
}

export type { StoredPayload };
