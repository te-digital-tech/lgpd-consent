import { act, cleanup, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Banner } from '../src/Banner.js';
import { ConsentProvider } from '../src/ConsentProvider.js';
import { PreferencesModal } from '../src/PreferencesModal.js';
import { RevokeButton } from '../src/RevokeButton.js';
import { useConsent } from '../src/useConsent.js';

const config = {
  categories: ['essential', 'analytics', 'marketing'],
  policyVersion: 1,
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <ConsentProvider config={config}>{children}</ConsentProvider>;
}

beforeEach(() => {
  if (typeof localStorage !== 'undefined') localStorage.clear();
});
afterEach(() => {
  cleanup();
  if (typeof localStorage !== 'undefined') localStorage.clear();
});

describe('useConsent', () => {
  it('throws outside a provider', () => {
    expect(() => renderHook(() => useConsent())).toThrow(/ConsentProvider/);
  });

  it('exposes state and reacts to mutations', () => {
    const { result } = renderHook(() => useConsent(), { wrapper });
    expect(result.current.state.status).toBe('pending');
    act(() => result.current.accept());
    expect(result.current.state.status).toBe('granted');
    expect(result.current.isAllowed('analytics')).toBe(true);
  });
});

describe('<Banner>', () => {
  it('renders only while pending/expired', () => {
    function Probe() {
      const { accept } = useConsent();
      return (
        <>
          <button type="button" onClick={accept}>
            accept
          </button>
          <Banner>{() => <div data-testid="banner">visible</div>}</Banner>
        </>
      );
    }
    render(<Probe />, { wrapper });
    expect(screen.getByTestId('banner')).toBeTruthy();
    act(() => screen.getByText('accept').click());
    expect(screen.queryByTestId('banner')).toBeNull();
  });
});

describe('<RevokeButton>', () => {
  it('revokes consent and runs onRevoked', () => {
    let revoked = 0;
    function Probe() {
      const { accept, state } = useConsent();
      return (
        <>
          <button type="button" onClick={accept}>
            accept
          </button>
          <RevokeButton
            onRevoked={() => {
              revoked++;
            }}
          >
            revoke
          </RevokeButton>
          <span data-testid="status">{state.status}</span>
        </>
      );
    }
    render(<Probe />, { wrapper });
    act(() => screen.getByText('accept').click());
    expect(screen.getByTestId('status').textContent).toBe('granted');
    act(() => screen.getByText('revoke').click());
    expect(screen.getByTestId('status').textContent).toBe('pending');
    expect(revoked).toBe(1);
  });
});

describe('<PreferencesModal>', () => {
  it('renders only when preferencesOpen is true', () => {
    function Probe() {
      const { openPreferences } = useConsent();
      return (
        <>
          <button type="button" onClick={openPreferences}>
            open
          </button>
          <PreferencesModal categories={['essential', 'analytics']}>
            {({ draft, setCategory, save }) => (
              <div data-testid="modal">
                <label>
                  <input
                    type="checkbox"
                    data-testid="cb"
                    checked={draft.analytics === true}
                    onChange={(e) => setCategory('analytics', e.target.checked)}
                  />
                  analytics
                </label>
                <button type="button" onClick={save}>
                  save
                </button>
              </div>
            )}
          </PreferencesModal>
        </>
      );
    }
    const { rerender: _ } = render(<Probe />, { wrapper });
    expect(screen.queryByTestId('modal')).toBeNull();
    act(() => screen.getByText('open').click());
    expect(screen.getByTestId('modal')).toBeTruthy();
  });
});
