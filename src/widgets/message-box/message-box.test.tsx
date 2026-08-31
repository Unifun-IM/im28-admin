import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

import { GlobalContext } from '@shared/lib/global-context';
import MessageBox from './index';

describe('MessageBox', () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('keeps the notification panel responsive on mobile', () => {
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

    render(
      <GlobalContext.Provider value={{ lang: 'zh-CN' }}>
        <MessageBox>
          <button type="button">打开通知</button>
        </MessageBox>
      </GlobalContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: '打开通知' }));

    expect(document.querySelector('.use-message-box')).toBeTruthy();
    expect(document.querySelector('.use-message-box-tabs')).toBeTruthy();
    expect(screen.getByRole('button', { name: '全部' })).toHaveClass('shrink-0');
    expect(screen.getByRole('button', { name: '未读' })).toHaveClass('shrink-0');
    expect(screen.getByRole('button', { name: '分类1' })).toHaveClass('shrink-0');
    expect(screen.getByRole('button', { name: '分类2' })).toHaveClass('shrink-0');
  });
});
