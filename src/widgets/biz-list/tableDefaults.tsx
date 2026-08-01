import type { TableColumnProps } from '@arco-design/web-react';

export const BIZ_PAGE_SIZE = 15;
export const BIZ_PAGE_SIZE_OPTIONS = [15, 30, 50];

/** 是否为操作列（默认右侧固定） */
export function isActionColumn<T>(col: TableColumnProps<T>): boolean {
  const title = typeof col.title === 'string' ? col.title : '';
  const key = col.key != null ? String(col.key) : '';
  const dataIndex = typeof col.dataIndex === 'string' ? col.dataIndex : '';
  return (
    col.fixed === 'right' ||
    key === 'actions' ||
    key === 'op' ||
    dataIndex === 'actions' ||
    dataIndex === 'op' ||
    // i18n 后 title 可能是「操作」或 Action，不能只认中文
    title === '操作' ||
    title === 'Action'
  );
}

/**
 * 业务表列规范化：
 * - 文本列默认开启 Table ellipsis（截断）；组合单元格见 TruncateText（Tooltip）
 * - 操作列默认 fixed: right、align: center，关闭省略；投影由 Arco Table fixed + 横向滚动标准机制提供
 */
export function normalizeBizColumns<T>(
  columns: TableColumnProps<T>[] = []
): TableColumnProps<T>[] {
  return columns.map((col) => {
    if (isActionColumn(col)) {
      return {
        ...col,
        fixed: col.fixed ?? 'right',
        ellipsis: false,
        width: col.width ?? 108,
        align: col.align ?? 'center'
      };
    }

    return {
      ...col,
      ellipsis: col.ellipsis ?? true
    };
  });
}

/** total ≤ 15 时不展示分页器；默认 15 条/页，可选 15/30/50 */
export function resolveBizPagination(
  pagination: false | undefined | Record<string, unknown>,
  dataLength: number
): false | Record<string, unknown> {
  if (pagination === false) return false;

  const incoming =
    typeof pagination === 'object' && pagination ? { ...pagination } : {};
  const total =
    typeof incoming.total === 'number' ? incoming.total : dataLength;

  if (total <= BIZ_PAGE_SIZE) return false;

  const sizeOptions =
    (incoming.sizeOptions as number[] | undefined) || BIZ_PAGE_SIZE_OPTIONS;

  return {
    showTotal: true,
    sizeCanChange: true,
    pageSize: BIZ_PAGE_SIZE,
    ...incoming,
    sizeOptions
  };
}
