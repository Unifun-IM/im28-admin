import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, vi } from 'vitest';

import { GlobalContext } from '@shared/lib/global-context';
import { PageLayout } from './PageLayout';

describe('PageLayout', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('renders the Arco Pro simple admin shell chrome', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <GlobalContext.Provider
          value={{
            lang: 'zh-CN',
            setLang: () => undefined,
            theme: 'light',
            setTheme: () => undefined
          }}
        >
          <PageLayout
            Exception403={() => null}
            Exception404={() => null}
            getFlattenRoutes={() => []}
          />
        </GlobalContext.Provider>
      </MemoryRouter>
    );

    expect(container.querySelector('.arco-layout')).toBeTruthy();
    expect(container.querySelector('.arco-layout-sider, .arco-menu')).toBeTruthy();
    expect(
      container.querySelector('[data-layout-navbar]')?.getAttribute('style')
    ).toContain('height: 86px');
  });

  it('uses an overlay navigation drawer on mobile', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 768px)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));

    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <GlobalContext.Provider
          value={{
            lang: 'zh-CN',
            setLang: () => undefined,
            theme: 'light',
            setTheme: () => undefined
          }}
        >
          <PageLayout
            Exception403={() => null}
            Exception404={() => null}
            getFlattenRoutes={() => []}
          />
        </GlobalContext.Provider>
      </MemoryRouter>
    );

    expect(container.querySelector('.arco-layout-sider')).toBeNull();
    expect(container.querySelector('.use-page-tabs')).toBeNull();
    expect(
      container.querySelector('[data-layout-navbar]')?.getAttribute('style')
    ).toContain('height: 44px');
    expect(
      container.querySelector('[data-layout-content]')?.getAttribute('style')
    ).toContain('padding-top: 44px');
    fireEvent.click(screen.getByRole('button', { name: '打开导航' }));
    expect(document.querySelector('.arco-drawer')).toBeTruthy();
  });
});
