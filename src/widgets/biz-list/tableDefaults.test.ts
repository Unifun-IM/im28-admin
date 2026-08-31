import { normalizeBizColumns } from './tableDefaults';

describe('normalizeBizColumns', () => {
  it('gives every visible column a non-zero base width', () => {
    const columns = normalizeBizColumns([
      { title: 'Name', dataIndex: 'name' },
      { title: 'Action', dataIndex: 'op' }
    ]);

    expect(columns[0].width).toBe(160);
    expect(columns[1].width).toBe(108);
    expect(columns[1].fixed).toBe('right');
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
  });
});
