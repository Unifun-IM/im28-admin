import type { TableColumnProps } from '@arco-design/web-react';
import type { ReactNode } from 'react';

export const BIZ_PAGE_SIZE = 15;
export const BIZ_PAGE_SIZE_OPTIONS = [15, 30, 50];
export const COMPACT_ACTION_COLUMN_WIDTH = 72;
export const TEXT_ACTION_FOLD_WHEN_OVER = 3;
export const DEFAULT_TEXT_ACTION_FOLDED_VISIBLE = 1;
export const DEFAULT_AUXILIARY_COLUMN_WIDTH = 40;

const COMPACT_DATA_COLUMN_MAX_WIDTH = 120;

const TEXT_ACTION_FONT_SIZE = 12;
const TABLE_HEADER_FONT_SIZE = 14;
const TEXT_ACTION_GAP = 8;
const TEXT_ACTION_MORE_WIDTH = 14;
const ACTION_COLUMN_HORIZONTAL_PADDING = 24;
const DATA_COLUMN_HEADER_HORIZONTAL_PADDING = 32;
const TABLE_HEADER_WIDTH_BUFFER = 8;

export type ActionLabelSlot = string | readonly string[];

type BizTableLayoutOptions = {
  compactActions?: boolean;
  auxiliaryColumnWidth?: number;
};

function estimateTextWidth(
  text: string,
  fontSize = TEXT_ACTION_FONT_SIZE
): number {
  const scale = fontSize / TEXT_ACTION_FONT_SIZE;
  return Array.from(text).reduce((width, char) => {
    if (/\s/u.test(char)) return width + 3 * scale;
    if (/[\u2e80-\u9fff\uf900-\ufaff\uff01-\uff60]/u.test(char)) {
      return width + fontSize;
    }
    if (/[A-Z]/u.test(char)) return width + 7.5 * scale;
    if (/[a-z0-9]/u.test(char)) return width + 6.25 * scale;
    return width + 5 * scale;
  }, 0);
}

function preserveReadableHeaderWidth(
  width: number | string,
  title: ReactNode,
  horizontalPadding: number
): number | string {
  if (typeof width !== 'number' || typeof title !== 'string') return width;
  const headerWidth =
    estimateTextWidth(title, TABLE_HEADER_FONT_SIZE) +
    horizontalPadding +
    TABLE_HEADER_WIDTH_BUFFER;
  return Math.max(width, Math.ceil(headerWidth));
}

function estimateSlotWidth(slot: ActionLabelSlot): number {
  const candidates = typeof slot === 'string' ? [slot] : slot;
  return candidates.reduce(
    (maxWidth, label) => Math.max(maxWidth, estimateTextWidth(label)),
    0
  );
}

/**
 * 计算桌面文字操作列宽度。数组中的每一项代表一个操作槽位；
 * 动态文案使用字符串数组，按当前语言候选中的最长文案计算。
 */
export function getTextActionColumnWidth(
  slots: readonly ActionLabelSlot[],
  title = 'Action'
): number {
  const folded = slots.length > TEXT_ACTION_FOLD_WHEN_OVER;
  const visibleSlots = folded
    ? slots.slice(0, DEFAULT_TEXT_ACTION_FOLDED_VISIBLE)
    : slots;
  const itemWidths = visibleSlots.map(estimateSlotWidth);
  if (folded) itemWidths.push(TEXT_ACTION_MORE_WIDTH);

  const contentWidth =
    itemWidths.reduce((sum, width) => sum + width, 0) +
    Math.max(0, itemWidths.length - 1) * TEXT_ACTION_GAP;
  const titleWidth = estimateTextWidth(title);

  return Math.ceil(
    Math.max(contentWidth, titleWidth) + ACTION_COLUMN_HORIZONTAL_PADDING
  );
}

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
 * - 操作列默认 fixed: right，桌面左对齐、移动端居中，关闭省略
 */
export function normalizeBizColumns<T>(
  columns: TableColumnProps<T>[] = [],
  options: { compactActions?: boolean } = {}
): TableColumnProps<T>[] {
  return columns.map((col) => {
    if (isActionColumn(col)) {
      const width = options.compactActions
        ? COMPACT_ACTION_COLUMN_WIDTH
        : col.width ?? 108;
      return {
        ...col,
        fixed: col.fixed ?? 'right',
        ellipsis: false,
        width: options.compactActions
          ? width
          : preserveReadableHeaderWidth(
              width,
              col.title,
              ACTION_COLUMN_HORIZONTAL_PADDING
            ),
        align: options.compactActions ? 'center' : 'left'
      };
    }

    const width = col.width ?? 160;
    return {
      ...col,
      ellipsis: col.ellipsis ?? true,
      width: preserveReadableHeaderWidth(
        width,
        col.title,
        DATA_COLUMN_HEADER_HORIZONTAL_PADDING
      )
    };
  });
}

function getNumericColumnWidth<T>(column: TableColumnProps<T>): number | null {
  if (typeof column.width === 'number') return column.width;
  if (typeof column.width !== 'string') return null;

  const match = column.width.trim().match(/^(\d+(?:\.\d+)?)px$/u);
  return match ? Number(match[1]) : null;
}

/**
 * 把基础列宽转换成最终表格布局：紧凑列保持像素宽度，内容列吸收宽屏余量；
 * scrollX 保留所有基础列宽，窄屏只在 Table 内容区滚动。
 */
export function resolveBizTableLayout<T>(
  columns: TableColumnProps<T>[] = [],
  options: BizTableLayoutOptions = {}
): { columns: TableColumnProps<T>[]; scrollX: number | true } {
  const normalized = normalizeBizColumns(columns, options);
  const measured = normalized.map((column) => ({
    column,
    width: getNumericColumnWidth(column)
  }));

  if (measured.some(({ width }) => width == null)) {
    return { columns: normalized, scrollX: true };
  }

  const auxiliaryColumnWidth = options.auxiliaryColumnWidth ?? 0;
  const contentColumns = measured.filter(
    ({ column }) => !isActionColumn(column) && column.fixed == null
  );
  const preferredElastic = contentColumns.filter(
    ({ width }) => (width as number) > COMPACT_DATA_COLUMN_MAX_WIDTH
  );
  const elastic =
    preferredElastic.length > 0
      ? preferredElastic
      : contentColumns.reduce<typeof contentColumns>((widest, item) => {
          if (widest.length === 0) return [item];
          return (item.width as number) > (widest[0].width as number)
            ? [item]
            : widest;
        }, []);
  const elasticWidth = elastic.reduce(
    (sum, item) => sum + (item.width as number),
    0
  );
  const scrollX = measured.reduce(
    (sum, item) => sum + (item.width as number),
    auxiliaryColumnWidth
  );

  if (elasticWidth === 0) return { columns: normalized, scrollX };

  const fixedWidth = scrollX - elasticWidth;
  const elasticColumns = new Set(elastic.map(({ column }) => column));
  const fittedColumns = measured.map(({ column, width }) => {
    if (!elasticColumns.has(column)) return column;

    const ratio = (width as number) / elasticWidth;
    const percentage = Number((ratio * 100).toFixed(6));
    const offset = Number((ratio * fixedWidth).toFixed(3));
    return {
      ...column,
      width: `calc(${percentage}% - ${offset}px)`
    };
  });

  return { columns: fittedColumns, scrollX };
}

/** total ≤ 15 时不展示分页器；默认 15 条/页，可选 15/30/50 */
export function resolveBizPagination(
  pagination: false | undefined | Record<string, unknown>,
  dataLength: number,
  options: { compact?: boolean } = {}
): false | Record<string, unknown> {
  if (pagination === false) return false;

  const incoming =
    typeof pagination === 'object' && pagination ? { ...pagination } : {};
  const total =
    typeof incoming.total === 'number' ? incoming.total : dataLength;

  if (total <= BIZ_PAGE_SIZE) return false;

  const sizeOptions =
    (incoming.sizeOptions as number[] | undefined) || BIZ_PAGE_SIZE_OPTIONS;

  const resolved = {
    showTotal: true,
    sizeCanChange: true,
    pageSize: BIZ_PAGE_SIZE,
    ...incoming,
    sizeOptions
  };

  if (!options.compact) return resolved;

  return {
    ...resolved,
    simple: true,
    showTotal: false,
    sizeCanChange: false
  };
}
