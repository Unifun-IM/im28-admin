import { render } from '@testing-library/react';

import { GlobalContext } from '@shared/lib/global-context';
import BizDetailDrawer from './BizDetailDrawer';

describe('BizDetailDrawer', () => {
  it('keeps the shared responsive class and desktop default width', () => {
    render(
      <GlobalContext.Provider
        value={{
          lang: 'zh-CN',
          setLang: () => undefined,
          theme: 'light',
          setTheme: () => undefined
        }}
      >
        <BizDetailDrawer
          visible
          title="Detail"
          fields={[{ label: 'Name', value: 'Alice' }]}
        />
      </GlobalContext.Provider>
    );

    const drawer = document.querySelector<HTMLElement>(
      '.use-biz-detail-drawer'
    );
    expect(drawer).toBeTruthy();
    expect(drawer?.style.width).toBe('50%');
    expect(drawer?.querySelector('.use-biz-detail-descriptions')).toBeTruthy();
  });
});
