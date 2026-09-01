import { render } from '@testing-library/react';

import { GlobalContext } from '@shared/lib/global-context';
import UnsavedChangesModal from './UnsavedChangesModal';

describe('UnsavedChangesModal', () => {
  it('uses the shared modal shell and responsive footer layout', () => {
    render(
      <GlobalContext.Provider
        value={{
          lang: 'zh-CN',
          setLang: () => undefined,
          theme: 'light',
          setTheme: () => undefined
        }}
      >
        <UnsavedChangesModal
          visible
          onStay={() => undefined}
          onLeave={() => undefined}
        />
      </GlobalContext.Provider>
    );

    const modal = document.querySelector('.use-biz-form-modal');
    const footerLayout = modal?.querySelector('.arco-modal-footer > div');

    expect(modal).toBeTruthy();
    expect(footerLayout).toHaveClass('w-full', 'flex-wrap', 'justify-end');
  });
});
