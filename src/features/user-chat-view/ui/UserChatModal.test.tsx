import { fireEvent, render, waitFor } from '@testing-library/react';

import { GlobalContext } from '@shared/lib/global-context';
import UserChatModal from './UserChatModal';

describe('UserChatModal responsive flow', () => {
  it('returns from a mobile detail panel to its source list', async () => {
    render(
      <GlobalContext.Provider
        value={{
          lang: 'zh-CN',
          setLang: () => undefined,
          theme: 'light',
          setTheme: () => undefined
        }}
      >
        <UserChatModal
          visible
          scene="group"
          userId={null}
          target={{ type: 'group', id: 'group-1', name: 'Test group' }}
          onClose={() => undefined}
        />
      </GlobalContext.Provider>
    );

    const shell = await waitFor(() => {
      const element = document.querySelector('.use-user-chat-shell');
      expect(element).toHaveClass('is-detail-active');
      return element;
    });

    const chatBack = document.querySelector<HTMLButtonElement>(
      'button[aria-label="返回"]'
    );
    expect(chatBack).toBeTruthy();
    fireEvent.click(chatBack!);

    const listBack = await waitFor(() => {
      const element = document.querySelector<HTMLButtonElement>(
        'button[aria-label="返回列表"]'
      );
      expect(element).toBeTruthy();
      return element;
    });
    fireEvent.click(listBack);

    await waitFor(() => expect(shell).not.toHaveClass('is-detail-active'));
    expect(document.querySelector('.use-user-chat-side')).toBeTruthy();
  });
});
