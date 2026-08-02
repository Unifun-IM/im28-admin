import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { GlobalContext } from '@shared/lib/global-context';
import { PageLayout } from './PageLayout';

describe('PageLayout', () => {
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
  });
});
