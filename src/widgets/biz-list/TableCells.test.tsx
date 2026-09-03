import { render, screen } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { GlobalContext } from '@shared/lib/global-context';
import {
  ActionLinks,
  DoubleLineCell,
  type ActionLinkItem
} from './TableCells';

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

describe('DoubleLineCell', () => {
  it('keeps paired machine values truncated and independently copyable', () => {
    render(
      <GlobalContext.Provider value={contextValue}>
        <DoubleLineCell
          primary="THjyozbWDPWaALWBb2f4bf6Pa6ZuDBDTz"
          secondary="82958095-89f8-4d3c-a36e-6ac760be175a"
          copyPrimary
          copySecondary
        />
      </GlobalContext.Provider>
    );

    expect(screen.getAllByRole('button', { name: '复制' })).toHaveLength(2);
    expect(screen.getByText('THjyozbWDPWaALWBb2f4bf6Pa6ZuDBDTz')).toHaveClass(
      'text-ellipsis',
      'text-arco-text-1'
    );
    expect(
      screen.getByText('82958095-89f8-4d3c-a36e-6ac760be175a')
    ).toHaveClass('text-ellipsis', 'text-arco-text-3');
  });
});

describe('ActionLinks text layout', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('does not reserve an empty more slot for a single action', () => {
    const { container } = renderActions([{ key: 'detail', label: '详情' }]);

    expect(screen.getByRole('button', { name: '详情' })).toBeTruthy();
    expect(container.firstElementChild?.className).toContain('justify-start');
    expect(container.querySelector('span[aria-hidden]')).toBeNull();
    expect(screen.queryByRole('button', { name: '更多' })).toBeNull();
  });

  it('shows all three desktop text actions without a more trigger', () => {
    renderActions(
      ['详情', '封禁', '升级'].map((label, index) => ({
        key: String(index),
        label
      }))
    );

    expect(screen.getByRole('button', { name: '详情' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '封禁' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '升级' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '更多' })).toBeNull();
  });

  it('shows one desktop text action before the more trigger when over three', () => {
    renderActions(
      ['详情', '编辑', '封禁', '删除'].map((label, index) => ({
        key: String(index),
        label
      }))
    );

    expect(screen.getByRole('button', { name: '详情' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '更多' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '编辑' })).toBeNull();
    expect(screen.queryByRole('button', { name: '封禁' })).toBeNull();
    expect(screen.queryByRole('button', { name: '删除' })).toBeNull();
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
    expect(trigger.parentElement?.className).toContain('justify-center');
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
