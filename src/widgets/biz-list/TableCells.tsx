import React from 'react';
import { Avatar, Dropdown, Menu, Tooltip } from '@arco-design/web-react';
import {
  IconDelete,
  IconEdit,
  IconEye,
  IconMore,
  IconSettings
} from '@arco-design/web-react/icon';
import cs from 'classnames';

export type AvatarNameCellProps = {
  name: React.ReactNode;
  sub?: React.ReactNode;
  avatar?: string;
  size?: number;
};

/** 头像 + 主文案 + 副文案 */
export function AvatarNameCell({
  name,
  sub,
  avatar,
  size = 24
}: AvatarNameCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size={size} className="shrink-0">
        {avatar ? <img alt="" src={avatar} /> : String(name || '?').slice(0, 1)}
      </Avatar>
      <div className="min-w-0">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-5 text-arco-text-1">
          {name}
        </div>
        {sub != null && sub !== '' && (
          <div className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-4 text-arco-text-3">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

export type DoubleLineCellProps = {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
};

/** 双行文本单元格 */
export function DoubleLineCell({ primary, secondary }: DoubleLineCellProps) {
  return (
    <div className="flex min-w-0 flex-col justify-center leading-[1.2]">
      <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm leading-5 text-arco-text-1">
        {primary}
      </div>
      {secondary != null && secondary !== '' && (
        <div className="mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-xs leading-4 text-arco-text-3">
          {secondary}
        </div>
      )}
    </div>
  );
}

export type StatusBadgeProps = {
  status: 'success' | 'error' | 'warning' | 'default';
  text: React.ReactNode;
  className?: string;
};

const STATUS_DOT: Record<StatusBadgeProps['status'], string> = {
  success: 'bg-arco-success',
  error: 'bg-arco-danger',
  warning: 'bg-[rgb(var(--warning-6))]',
  default: 'bg-arco-text-4'
};

/** 状态点 + 文案（对齐 Figma badge/status） */
export function StatusBadge({ status, text, className }: StatusBadgeProps) {
  return (
    <span
      className={cs(
        'inline-flex items-center gap-1.5 text-sm leading-5 text-arco-text-1',
        className
      )}
    >
      <i className={cs('h-1.5 w-1.5 shrink-0 rounded-full', STATUS_DOT[status])} />
      {text}
    </span>
  );
}

export type ActionLinkItem = {
  key: string;
  /** Hover Tooltip / 下拉菜单文案 */
  label: React.ReactNode;
  /** 图标；不传时按 key 推断（edit/delete/detail/more…） */
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
};

export type ActionLinksProps = {
  items: ActionLinkItem[];
  /** 直接展示的图标上限（含「更多」占位），默认 3 */
  maxVisible?: number;
  className?: string;
};

const ICON_BTN =
  'inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-arco-text-2 hover:bg-arco-fill-2 hover:text-arco-text-1 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:text-xs';

function resolveActionIcon(item: ActionLinkItem): React.ReactNode {
  if (item.icon) return item.icon;
  const key = item.key.toLowerCase();
  if (key.includes('edit') || key.includes('修改')) return <IconEdit />;
  if (key.includes('delete') || key.includes('del') || key.includes('删除'))
    return <IconDelete />;
  if (key.includes('detail') || key.includes('view') || key.includes('详情'))
    return <IconEye />;
  if (key.includes('setting') || key.includes('config')) return <IconSettings />;
  if (key.includes('more') || key.includes('更多')) return <IconMore />;
  return <IconSettings />;
}

/**
 * 表格操作列（Figma 602:34917）
 * - 最多用 icon 展示 3 个功能，Hover Tooltip 说明
 * - 超出部分收进「…」下拉列表
 */
export function ActionLinks({
  items,
  maxVisible = 3,
  className
}: ActionLinksProps) {
  const safeMax = Math.max(1, maxVisible);
  const needMore = items.length > safeMax;
  const visibleItems = needMore ? items.slice(0, safeMax - 1) : items;
  const moreItems = needMore ? items.slice(safeMax - 1) : [];

  const moreMenu = moreItems.length ? (
    <Menu
      onClickMenuItem={(key) => {
        const item = moreItems.find((it) => it.key === key);
        if (!item || item.disabled) return;
        item.onClick?.();
      }}
    >
      {moreItems.map((item) => (
        <Menu.Item
          key={item.key}
          disabled={item.disabled}
          className={item.danger ? '!text-arco-danger' : undefined}
        >
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex text-xs [&_svg]:text-xs">
              {resolveActionIcon(item)}
            </span>
            {item.label}
          </span>
        </Menu.Item>
      ))}
    </Menu>
  ) : null;

  return (
    <div className={cs('inline-flex items-center justify-end gap-2', className)}>
      {visibleItems.map((item) => (
        <Tooltip key={item.key} content={item.label}>
          <button
            type="button"
            className={cs(ICON_BTN, item.danger && 'hover:!text-arco-danger')}
            disabled={item.disabled}
            aria-label={typeof item.label === 'string' ? item.label : item.key}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick?.();
            }}
          >
            {resolveActionIcon(item)}
          </button>
        </Tooltip>
      ))}
      {moreMenu && (
        <Dropdown droplist={moreMenu} position="br" trigger="click">
          <Tooltip content="更多">
            <button
              type="button"
              className={ICON_BTN}
              aria-label="更多"
              onClick={(e) => e.stopPropagation()}
            >
              <IconMore />
            </button>
          </Tooltip>
        </Dropdown>
      )}
    </div>
  );
}
