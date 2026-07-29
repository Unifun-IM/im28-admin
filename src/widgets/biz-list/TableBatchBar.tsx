import React from 'react';
import { Button, Switch } from '@arco-design/web-react';
import {
  IconDelete,
  IconEdit,
  IconStorage
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

/** 多选时底部浮出的批量操作条 — 布局由 Tailwind 承担 */
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
        'absolute bottom-14 left-1/2 z-20 flex h-8 -translate-x-1/2 items-center overflow-hidden rounded border border-arco-border-2 bg-arco-bg-popup shadow-popover',
        'max-md:left-3 max-md:right-3 max-md:h-auto max-md:w-auto max-md:translate-x-0 max-md:flex-wrap',
        '[&_.arco-btn]:h-8 [&_.arco-btn]:rounded-none [&_.arco-btn]:px-3 [&_.arco-btn]:text-arco-text-1',
        className
      )}
    >
      <div className="flex h-full items-center gap-2 whitespace-nowrap border-r border-arco-border-2 px-3 text-sm text-arco-text-1">
        <span>只显示已选 {count}</span>
        <Switch
          size="small"
          checked={showSelectedOnly}
          onChange={onShowSelectedOnlyChange}
        />
      </div>
      <div className="flex items-center">
        {onArchive && (
          <Button
            type="text"
            size="small"
            icon={<IconStorage />}
            onClick={onArchive}
          >
            归档
          </Button>
        )}
        {onEdit && (
          <Button type="text" size="small" icon={<IconEdit />} onClick={onEdit}>
            编辑
          </Button>
        )}
        {onDelete && (
          <Button
            type="text"
            size="small"
            status="danger"
            icon={<IconDelete />}
            onClick={onDelete}
          >
            删除
          </Button>
        )}
        {extra}
      </div>
    </div>
  );
}
