import {
  getTextActionColumnWidth,
  normalizeBizColumns,
  resolveBizTableLayout,
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

  it('raises narrow columns to the current-language header width', () => {
    const zhColumns = normalizeBizColumns([
      { title: '启用状态', dataIndex: 'status', width: 88 }
    ]);
    const enColumns = normalizeBizColumns([
      { title: 'Enabled status', dataIndex: 'status', width: 88 }
    ]);

    expect(zhColumns[0].width).toBeGreaterThan(88);
    expect(enColumns[0].width).toBeGreaterThan(zhColumns[0].width as number);
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

  it('keeps every base width numeric before the container is measured', () => {
    const layout = resolveBizTableLayout(
      [
        { title: 'Group', dataIndex: 'group', width: 240 },
        { title: 'Owner', dataIndex: 'owner', width: 220 },
        { title: 'Members', dataIndex: 'members', width: 80 },
        { title: 'Status', dataIndex: 'status', width: 96 },
        { title: 'Created at', dataIndex: 'createdAt', width: 200 },
        { title: 'Action', dataIndex: 'op', width: 160 }
      ],
      { auxiliaryColumnWidth: 40 }
    );

    expect(layout.scrollX).toBe(1049);
    expect(layout.columns[0].width).toBe(240);
    expect(layout.columns[1].width).toBe(220);
    expect(layout.columns[2].width).toBe(93);
    expect(layout.columns[3].width).toBe(96);
    expect(layout.columns[4].width).toBe(200);
    expect(layout.columns[5].width).toBe(160);
  });

  it('distributes wide-container surplus only to content columns', () => {
    const layout = resolveBizTableLayout(
      [
        { title: 'Group', dataIndex: 'group', width: 240 },
        { title: 'Owner', dataIndex: 'owner', width: 220 },
        { title: 'Members', dataIndex: 'members', width: 80 },
        { title: 'Status', dataIndex: 'status', width: 96 },
        { title: 'Created at', dataIndex: 'createdAt', width: 200 },
        { title: 'Action', dataIndex: 'op', width: 160 }
      ],
      { auxiliaryColumnWidth: 40, availableWidth: 1440 }
    );

    expect(layout.scrollX).toBe(1440);
    expect(layout.columns.map(({ width }) => width)).toEqual([
      382, 350, 93, 96, 319, 160
    ]);
  });

  it('preserves unsupported custom widths instead of guessing a layout', () => {
    const layout = resolveBizTableLayout([
      { title: 'Name', dataIndex: 'name', width: '30%' },
      { title: 'Action', dataIndex: 'op', width: 120 }
    ]);

    expect(layout.scrollX).toBe(true);
    expect(layout.columns[0].width).toBe('30%');
    expect(layout.columns[1].width).toBe(120);
  });

  it('still keeps the action width fixed when every content column is compact', () => {
    const layout = resolveBizTableLayout([
      { title: 'Status', dataIndex: 'status', width: 96 },
      { title: 'Action', dataIndex: 'op', width: 120 }
    ]);

    expect(layout.scrollX).toBe(216);
    expect(layout.columns[0].width).toBe(96);
    expect(layout.columns[1].width).toBe(120);
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
