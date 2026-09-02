import { render } from '@testing-library/react';

import { GlobalContext } from '@shared/lib/global-context';
import { BizListPage } from './BizListPage';

describe('BizListPage responsive toolbar', () => {
  it('keeps the mobile title and right-aligned actions on one row when space allows', () => {
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
    const title = toolbar?.children.item(0);
    const actions = toolbar?.children.item(1);

    expect(title).toHaveClass('min-w-0', 'flex-1');
    expect(actions).toHaveClass('ml-auto', 'items-center', 'justify-end');
    expect(actions).not.toHaveClass('max-md:w-full');
  });
});
