import {
  getTextActionColumnWidth,
  normalizeBizColumns,
  resolveBizPagination
} from './tableDefaults';

describe('normalizeBizColumns', () => {
  it('gives every visible column a non-zero base width', () => {
    const columns = normalizeBizColumns([
      { title: 'Name', dataIndex: 'name' },
      { title: 'Action', dataIndex: 'op' }
    ]);

    expect(columns[0].width).toBe(160);
    expect(columns[1].width).toBe(108);
    expect(columns[1].fixed).toBe('right');
    expect(columns[1].align).toBe('left');
  });

  it('preserves explicitly analyzed widths', () => {
    const columns = normalizeBizColumns([
      { title: 'Description', dataIndex: 'description', width: 280 }
    ]);

    expect(columns[0].width).toBe(280);
  });

  it('compacts action columns on mobile without changing data columns', () => {
    const columns = normalizeBizColumns(
      [
        { title: 'Name', dataIndex: 'name', width: 240 },
        { title: 'Action', dataIndex: 'op', width: 200 }
      ],
      { compactActions: true }
    );

    expect(columns[0].width).toBe(240);
    expect(columns[1].width).toBe(72);
    expect(columns[1].align).toBe('center');
  });

  it('calculates text action widths from visible slots and dynamic labels', () => {
    expect(
      getTextActionColumnWidth(
        ['详情', ['封禁', '解除封禁'], ['禁言', '解除禁言']],
        '操作'
      )
    ).toBe(160);
    expect(
      getTextActionColumnWidth(['详情', '编辑', '封禁', '删除'], '操作')
    ).toBe(70);
    expect(
      getTextActionColumnWidth(
        ['重置密码', '重置谷歌', 'IP白名单'],
        '操作'
      )
    ).toBe(187);
    expect(
      getTextActionColumnWidth(
        ['Reset password', 'Reset Google Auth', 'IP whitelist'],
        'Action'
      )
    ).toBe(304);
  });

  it('uses compact pagination on mobile without changing page behavior', () => {
    const pagination = resolveBizPagination(
      {
        current: 2,
        pageSize: 30,
        total: 120,
        onChange: () => undefined
      },
      15,
      { compact: true }
    );

    expect(pagination).toMatchObject({
      current: 2,
      pageSize: 30,
      total: 120,
      simple: true,
      showTotal: false,
      sizeCanChange: false
    });
  });
});
