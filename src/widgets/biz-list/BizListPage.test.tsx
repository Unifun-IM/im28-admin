import { render } from '@testing-library/react';

import { GlobalContext } from '@shared/lib/global-context';
import { BizListPage } from './BizListPage';

describe('BizListPage responsive toolbar', () => {
  it('right-aligns table actions on mobile', () => {
    const { container } = render(
      <GlobalContext.Provider
        value={{
          lang: 'zh-CN',
          setLang: () => undefined,
          theme: 'light',
          setTheme: () => undefined
        }}
      >
        <BizListPage
          title="白名单列表"
          toolbar={<button type="button">添加白名单</button>}
          onRefresh={() => undefined}
          tableProps={{
            columns: [{ title: '用户信息', dataIndex: 'name', width: 160 }],
            data: [],
            pagination: false
          }}
        />
      </GlobalContext.Provider>
    );

    const toolbar = container.querySelector('.use-biz-table-toolbar');
    const actions = toolbar?.children.item(1);

    expect(actions).toHaveClass('max-md:w-full', 'max-md:justify-end');
    expect(actions).not.toHaveClass('max-md:justify-start');
  });
});
