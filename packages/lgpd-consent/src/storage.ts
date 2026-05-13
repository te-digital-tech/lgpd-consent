import {
  STORED_PAYLOAD_VERSION,
  type StoredPayload,
  defaultPreferences,
  parseStoredPayload,
  preferencesFromPayload,
} from './payload.js';
import type { ConsentState, StorageStrategy } from './types.js';

const DEFAULT_KEY = 'lgpd-consent';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export type StorageAdapter = {
  read(): StoredPayload | null;
  write(payload: StoredPayload): void;
  clear(): void;
  /** Identifies the active backing store so consumers (e.g. SSR audits) can branch. */
  readonly kind: 'localStorage' | 'cookie' | 'memory';
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
    kind: 'localStorage',
    read() {
      try {
        return parseStoredPayload(window.localStorage.getItem(key));
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
    kind: 'cookie',
    read() {
      if (!hasDocument()) return null;
      const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
      return parseStoredPayload(match?.[1]);
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

/** In-memory adapter — used as a last resort (e.g. SSR with no document). */
function memoryAdapter(): StorageAdapter {
  let store: StoredPayload | null = null;
  return {
    kind: 'memory',
    read: () => store,
    write: (p) => {
      store = p;
    },
    clear: () => {
      store = null;
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
  if (strategy === 'cookie') return cookieAdapter(key, options.cookieDomain, options.cookieMaxAge);
  if (strategy === 'localStorage') {
    return hasLocalStorage() ? localStorageAdapter(key) : memoryAdapter();
  }
  if (hasLocalStorage()) return localStorageAdapter(key);
  if (hasDocument()) return cookieAdapter(key, options.cookieDomain, options.cookieMaxAge);
  return memoryAdapter();
}

export function buildState(
  payload: StoredPayload | null,
  currentPolicyVersion: number,
  categories: string[],
): ConsentState {
  if (!payload) {
    return {
      status: 'pending',
      preferences: defaultPreferences(categories),
      acceptedAt: null,
      policyVersion: null,
    };
  }

  const isStale = payload.policyVersion < currentPolicyVersion;
  if (isStale) {
    return {
      status: 'expired',
      preferences: defaultPreferences(categories),
      acceptedAt: payload.acceptedAt,
      policyVersion: payload.policyVersion,
    };
  }

  return {
    status: 'granted',
    preferences: preferencesFromPayload(payload, categories),
    acceptedAt: payload.acceptedAt,
    policyVersion: payload.policyVersion,
  };
}

export { STORED_PAYLOAD_VERSION };
export type { StoredPayload };
