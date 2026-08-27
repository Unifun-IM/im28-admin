import { render, screen } from '@testing-library/react';

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
  it('does not reserve an empty more slot for a single action', () => {
    const { container } = renderActions([{ key: 'detail', label: '详情' }]);

    expect(screen.getByRole('button', { name: '详情' })).toBeTruthy();
    expect(container.querySelector('span[aria-hidden]')).toBeNull();
    expect(screen.queryByRole('button', { name: '更多' })).toBeNull();
  });

  it('keeps the more trigger when more than three actions are folded', () => {
    renderActions(
      ['详情', '封禁', '全员禁言', '升级'].map((label, index) => ({
        key: String(index),
        label
      }))
    );

    expect(screen.getByRole('button', { name: '详情' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '更多' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: '封禁' })).toBeNull();
  });
});
