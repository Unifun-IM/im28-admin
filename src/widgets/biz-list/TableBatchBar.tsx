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
  /**
   * dark — Figma 602:34650 深色浮条（用户查询）
   * light — Figma 804:20186 浅色条（黑名单批量）
   */
  theme?: 'dark' | 'light';
};

const ACTION_BTN_DARK =
  'inline-flex h-8 items-center gap-2 border-0 border-l border-solid border-[#262828] bg-transparent px-3 text-sm leading-[21px] text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.08)] disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:text-base';

const ACTION_BTN_LIGHT =
  'inline-flex h-8 items-center gap-2 border-0 border-l border-solid border-[rgba(0,0,0,0.08)] bg-transparent px-3 text-[14px] leading-[21px] text-[rgb(var(--success-6))] hover:bg-[rgba(0,0,0,0.04)] disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:text-[16px]';

/**
 * 多选时浮出的批量操作条
 * dark: Figma 602:34650；light: Figma 804:20186
 */
export default function TableBatchBar({
  count,
  showSelectedOnly = false,
  onShowSelectedOnlyChange,
  onArchive,
  onEdit,
  onDelete,
  extra,
  className,
  theme = 'dark'
}: TableBatchBarProps) {
  if (count <= 0) return null;

  const isLight = theme === 'light';
  const actionBtn = isLight ? ACTION_BTN_LIGHT : ACTION_BTN_DARK;

  return (
    <div
      className={cs(
        'use-table-batch-bar flex h-8 items-center overflow-hidden rounded-[8px]',
        isLight
          ? 'border border-solid border-[var(--color-fill-3,#e5e6eb)] bg-[var(--color-bg-1,#f7f8fa)]'
          : 'border border-[rgba(255,255,255,0.12)] bg-[#171a21] shadow-popover',
        className
      )}
      role="toolbar"
      aria-label="批量操作"
    >
      <div
        className={cs(
          'flex items-center justify-center gap-2 px-3 text-[14px] leading-[21px]',
          isLight ? 'text-arco-text-1' : 'text-[rgba(255,255,255,0.9)]'
        )}
      >
        <span className="whitespace-nowrap">只显示已选 {count}</span>
        <Switch
          size="small"
          checked={showSelectedOnly}
          onChange={onShowSelectedOnlyChange}
        />
      </div>
      <div className="flex items-center">
        {onArchive && (
          <button type="button" className={actionBtn} onClick={onArchive}>
            <IconArchive />
            归档
          </button>
        )}
        {onEdit && (
          <button type="button" className={actionBtn} onClick={onEdit}>
            <IconEdit />
            编辑
          </button>
        )}
        {onDelete && (
          <button type="button" className={actionBtn} onClick={onDelete}>
            <IconDelete />
            删除
          </button>
        )}
        {extra}
      </div>
    </div>
  );
}
