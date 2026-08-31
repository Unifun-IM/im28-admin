import { render, screen } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { GlobalContext } from '@shared/lib/global-context';
import { ActionLinks, type ActionLinkItem } from './TableCells';

const contextValue = {
  lang: 'zh-CN',
  setLang: () => undefined,
  theme: 'light' as const,
  setTheme: () => undefined
};

function renderActions(items: ActionLinkItem[]) {
  return render(
    <GlobalContext.Provider value={contextValue}>
      <ActionLinks variant="text" items={items} />
    </GlobalContext.Provider>
  );
}

describe('ActionLinks text layout', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('does not reserve an empty more slot for a single action', () => {
    const { container } = renderActions([{ key: 'detail', label: '详情' }]);

    expect(screen.getByRole('button', { name: '详情' })).toBeTruthy();
    expect(container.querySelector('span[aria-hidden]')).toBeNull();
    expect(screen.queryByRole('button', { name: '更多' })).toBeNull();
  });

  it('keeps the more trigger when more than two actions are folded', () => {
    renderActions(
      ['详情', '封禁', '升级'].map((label, index) => ({
        key: String(index),
        label
      }))
    );

    expect(screen.getByRole('button', { name: '详情' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '更多' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '封禁' })).toBeNull();
  });

  it('uses one compact menu trigger for multiple mobile actions', () => {
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

    renderActions([
      { key: 'detail', label: '详情' },
      { key: 'delete', label: '删除', danger: true }
    ]);

    const trigger = screen.getByRole('button', { name: '更多' });
    expect(trigger).toBeTruthy();
    expect(trigger.className).toContain('size-[32px]');
    expect(screen.queryByRole('button', { name: '详情' })).toBeNull();
    expect(screen.queryByRole('button', { name: '删除' })).toBeNull();
  });

  it('keeps a single mobile action directly reachable', () => {
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

    renderActions([{ key: 'detail', label: '详情' }]);

    const action = screen.getByRole('button', { name: '详情' });
    expect(action).toBeTruthy();
    expect(action.className).toContain('size-[32px]');
    expect(screen.queryByRole('button', { name: '更多' })).toBeNull();
  });
});
