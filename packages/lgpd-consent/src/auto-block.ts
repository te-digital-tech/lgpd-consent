import type { ConsentCategory, ConsentManager, ConsentPreferences } from './types.js';

/**
 * Replace placeholder script tags with executable ones once consent is granted.
 *
 * Mark third-party scripts in your HTML like:
 *
 * ```html
 * <script type="text/plain" data-consent="marketing"
 *         src="https://connect.facebook.net/en_US/fbevents.js"></script>
 * ```
 *
 * On `accept`, every matching `<script>` is cloned to a new tag with
 * `type="text/javascript"`, which the browser then executes. On `revoke`, the
 * executed clone is removed — note this does **not** unload code already running;
 * you still need a page reload for full cleanup. The library issues a one-time
 * `lgpd-consent:reload-suggested` event so consumers can surface that to the user.
 *
 * Selector defaults to `script[type="text/plain"][data-consent]` but can be
 * customized for other attribute conventions (e.g. `data-category`).
 */
export type AutoBlockOptions = {
  manager: ConsentManager;
  /** CSS selector for placeholder scripts. */
  selector?: string;
  /** Attribute that names the required category on each placeholder. */
  categoryAttr?: string;
  /** Run an initial pass against the current document. Default true. */
  runOnInit?: boolean;
  /** Watch for placeholders added later (SPAs / hydration). Default true. */
  observeMutations?: boolean;
};

type ManagedScript = {
  placeholder: HTMLScriptElement;
  category: ConsentCategory;
  executedClone?: HTMLScriptElement;
};

const EXECUTED_FLAG = 'data-lgpd-consent-executed';
const RELOAD_EVENT = 'lgpd-consent:reload-suggested';

export function autoBlockScripts(options: AutoBlockOptions): () => void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return () => {
      /* noop on server */
    };
  }

  const selector = options.selector ?? 'script[type="text/plain"][data-consent]';
  const attr = options.categoryAttr ?? 'data-consent';
  const managed: ManagedScript[] = [];
  let reloadDispatched = false;

  function track(el: HTMLScriptElement) {
    const category = el.getAttribute(attr);
    if (!category) return;
    if (managed.some((m) => m.placeholder === el)) return;
    managed.push({ placeholder: el, category });
    apply(options.manager.get().preferences);
  }

  function apply(prefs: ConsentPreferences) {
    for (const m of managed) {
      const allowed = prefs[m.category] === true || m.category === 'essential';
      if (allowed && !m.executedClone) {
        const clone = document.createElement('script');
        for (const a of Array.from(m.placeholder.attributes)) {
          if (a.name === 'type') continue;
          clone.setAttribute(a.name, a.value);
        }
        clone.type = 'text/javascript';
        clone.setAttribute(EXECUTED_FLAG, '');
        if (m.placeholder.textContent) clone.textContent = m.placeholder.textContent;
        m.placeholder.parentNode?.insertBefore(clone, m.placeholder.nextSibling);
        m.executedClone = clone;
      } else if (!allowed && m.executedClone) {
        m.executedClone.remove();
        m.executedClone = undefined;
        if (!reloadDispatched) {
          reloadDispatched = true;
          window.dispatchEvent(new CustomEvent(RELOAD_EVENT, { detail: { reason: 'revoked' } }));
        }
      }
    }
  }

  function initialPass() {
    for (const el of Array.from(document.querySelectorAll<HTMLScriptElement>(selector))) {
      track(el);
    }
  }

  let observer: MutationObserver | null = null;
  if (options.observeMutations !== false) {
    observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of Array.from(m.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches(selector)) track(node as HTMLScriptElement);
          const inner = node.querySelectorAll?.(selector);
          if (inner) for (const el of Array.from(inner)) track(el as HTMLScriptElement);
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (options.runOnInit !== false) initialPass();
  const unsubscribe = options.manager.on('change', (state) => apply(state.preferences));

  return () => {
    observer?.disconnect();
    unsubscribe();
  };
}

export { RELOAD_EVENT as AUTO_BLOCK_RELOAD_EVENT };
