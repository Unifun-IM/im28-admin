import React from 'react';
import { Switch } from '@arco-design/web-react';
import {
  IconArchive,
  IconDelete,
  IconEdit
} from '@arco-design/web-react/icon';
import cs from 'classnames';

export type TableBatchBarProps = {
  count: number;
  showSelectedOnly?: boolean;
  onShowSelectedOnlyChange?: (checked: boolean) => void;
  onArchive?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  extra?: React.ReactNode;
  className?: string;
};

const ACTION_BTN =
  'inline-flex h-8 items-center gap-2 border-0 border-l border-solid border-[#262828] bg-transparent px-3 text-sm leading-[21px] text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:text-base';

/**
 * 多选时浮出的批量操作条 — Figma 602:34650
 * 深色底 / 8px 圆角 / 顶栏水平居中
 */
export default function TableBatchBar({
  count,
  showSelectedOnly = false,
  onShowSelectedOnlyChange,
  onArchive,
  onEdit,
  onDelete,
  extra,
  className
}: TableBatchBarProps) {
  if (count <= 0) return null;

  return (
    <div
      className={cs(
        'use-table-batch-bar flex h-8 items-center overflow-hidden rounded border border-[rgba(255,255,255,0.12)] bg-[#171a21] shadow-popover',
        className
      )}
      role="toolbar"
      aria-label="批量操作"
    >
      <div className="flex items-center justify-center gap-2 px-3 text-sm leading-[21px] text-[rgba(255,255,255,0.9)]">
        <span className="whitespace-nowrap">只显示已选 {count}</span>
        <Switch
          size="small"
          checked={showSelectedOnly}
          onChange={onShowSelectedOnlyChange}
        />
      </div>
      <div className="flex items-center">
        {onArchive && (
          <button type="button" className={ACTION_BTN} onClick={onArchive}>
            <IconArchive />
            归档
          </button>
        )}
        {onEdit && (
          <button type="button" className={ACTION_BTN} onClick={onEdit}>
            <IconEdit />
            编辑
          </button>
        )}
        {onDelete && (
          <button type="button" className={ACTION_BTN} onClick={onDelete}>
            <IconDelete />
            删除
          </button>
        )}
        {extra}
      </div>
    </div>
  );
}
