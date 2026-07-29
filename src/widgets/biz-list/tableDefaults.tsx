import React from 'react';
import type { TableColumnProps } from '@arco-design/web-react';

import EllipsisCell from './EllipsisCell';

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
    dataIndex === 'actions' ||
    title === '操作'
  );
}

/**
 * 业务表列规范化：
 * - 文本列默认单行省略 + 溢出时 Tooltip
 * - 操作列默认 fixed: right，关闭省略
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
        align: col.align ?? 'right'
      };
    }

    if (col.ellipsis === false) return col;

    const userRender = col.render;
    return {
      ...col,
      ellipsis: true,
      render: (colValue: unknown, record: T, index: number) => {
        const content = userRender
          ? userRender(colValue, record, index)
          : (colValue as React.ReactNode);
        if (content == null || content === false) return content;
        // 仅纯文本走省略 + Tooltip；自定义节点（状态点/标签等）原样渲染
        if (typeof content !== 'string' && typeof content !== 'number') {
          return content;
        }
        return <EllipsisCell>{content}</EllipsisCell>;
      }
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
