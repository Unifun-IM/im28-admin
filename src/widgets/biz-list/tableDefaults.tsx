import type { TableColumnProps } from '@arco-design/web-react';

export const BIZ_PAGE_SIZE = 15;
export const BIZ_PAGE_SIZE_OPTIONS = [15, 30, 50];
export const COMPACT_ACTION_COLUMN_WIDTH = 72;
export const TEXT_ACTION_FOLD_WHEN_OVER = 3;
export const DEFAULT_TEXT_ACTION_FOLDED_VISIBLE = 1;

const TEXT_ACTION_FONT_SIZE = 12;
const TEXT_ACTION_GAP = 8;
const TEXT_ACTION_MORE_WIDTH = 14;
const ACTION_COLUMN_HORIZONTAL_PADDING = 24;

export type ActionLabelSlot = string | readonly string[];

function estimateTextWidth(text: string): number {
  return Array.from(text).reduce((width, char) => {
    if (/\s/u.test(char)) return width + 3;
    if (/[\u2e80-\u9fff\uf900-\ufaff\uff01-\uff60]/u.test(char)) {
      return width + TEXT_ACTION_FONT_SIZE;
    }
    if (/[A-Z]/u.test(char)) return width + 7.5;
    if (/[a-z0-9]/u.test(char)) return width + 6.25;
    return width + 5;
  }, 0);
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
      return {
        ...col,
        fixed: col.fixed ?? 'right',
        ellipsis: false,
        width: options.compactActions
          ? COMPACT_ACTION_COLUMN_WIDTH
          : col.width ?? 108,
        align: options.compactActions ? 'center' : 'left'
      };
    }

    return {
      ...col,
      ellipsis: col.ellipsis ?? true,
      width: col.width ?? 160
    };
  });
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
