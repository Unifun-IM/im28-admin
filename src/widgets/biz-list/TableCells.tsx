import React from 'react';
import { Dropdown, Menu, Message, Tooltip } from '@arco-design/web-react';
import {
  IconCopy,
  IconDelete,
  IconEdit,
  IconEye,
  IconMore,
  IconSettings
} from '@arco-design/web-react/icon';
import cs from 'classnames';
import copy from 'copy-to-clipboard';
import useMediaQuery, { MOBILE_MEDIA_QUERY } from '@shared/lib/useMediaQuery';
import useLocale from '@shared/lib/useLocale';
import { UserAvatar } from '@shared/ui';
import IconMoreDots from '@assets/icon/icon-more-dots.svg?react';

export { StatusBadge, type StatusBadgeProps } from '@shared/ui';

/** 组合单元格内单行截断；悬停用 Tooltip 展示全文 */
function TruncateText({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const tip =
    typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : undefined;
  const text = (
    <span
      className={cs(
        'block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
        className
      )}
    >
      {children}
    </span>
  );
  if (!tip) return text;
  return <Tooltip content={tip}>{text}</Tooltip>;
}

export type AvatarNameCellProps = {
  name: React.ReactNode;
  sub?: React.ReactNode;
  avatar?: string;
  /** 用户 ID，无头像时用于稳定配色哈希 */
  userId?: string;
  size?: number;
  /** 不展示头像（邀请人列等） */
  hideAvatar?: boolean;
  /** 副文案可复制内容；有值时展示复制图标 */
  copyText?: string;
  /** 主文案 class，如蓝链 */
  nameClassName?: string;
  onNameClick?: () => void;
};

/** 头像 + 主文案 + 副文案 */
export function AvatarNameCell({
  name,
  sub,
  avatar,
  userId,
  size = 24,
  hideAvatar,
  copyText,
  nameClassName,
  onNameClick
}: AvatarNameCellProps) {
  const t = useLocale();
  const displayName =
    typeof name === 'string' || typeof name === 'number'
      ? String(name)
      : undefined;
  return (
    <div className="flex min-w-0 items-center gap-[8px]">
      {!hideAvatar && (
        <UserAvatar
          size={size}
          className="shrink-0"
          userId={userId || copyText}
          name={displayName}
          src={avatar}
        />
      )}
      <div className="min-w-0 flex-1">
        <div
          className={cs(onNameClick && 'cursor-pointer')}
          onClick={
            onNameClick
              ? (e) => {
                  e.stopPropagation();
                  onNameClick();
                }
              : undefined
          }
          onKeyDown={
            onNameClick
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNameClick();
                  }
                }
              : undefined
          }
          role={onNameClick ? 'button' : undefined}
          tabIndex={onNameClick ? 0 : undefined}
        >
          <TruncateText className={nameClassName}>{name}</TruncateText>
        </div>
        {sub != null && sub !== '' && (
          <div className="mt-[4px] flex min-w-0 items-center gap-[4px]">
            <div className="min-w-0 flex-1">
              <TruncateText className="text-[10px] leading-[10px] text-arco-text-3">
                {sub}
              </TruncateText>
            </div>
            {copyText != null && copyText !== '' && (
              <button
                type="button"
                className="inline-flex size-[10px] shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-4 hover:text-arco-text-2"
                aria-label={t['common.copy']}
                onClick={(e) => {
                  e.stopPropagation();
                  copy(copyText);
                  Message.success(t['common.copied']);
                }}
              >
                <IconCopy className="text-[10px]" />
              </button>
            )}
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
    <div className="flex min-w-0 flex-col justify-center gap-[4px]">
      <TruncateText className="text-[10px] leading-[10px]">{primary}</TruncateText>
      {secondary != null && secondary !== '' && (
        <TruncateText className="text-[10px] leading-[10px] text-arco-text-3">
          {secondary}
        </TruncateText>
      )}
    </div>
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
  /**
   * 折叠后外露条数。
   * - text：仅当 items.length > 3 时折叠为「外露 + 更多」，默认外露 2
   * - icon：默认 3（含「更多」占位；溢出时可见数 = maxVisible - 1）
   */
  maxVisible?: number;
  /** icon：图标操作列；text：文字链接 */
  variant?: 'icon' | 'text';
  className?: string;
};

/** text：最多 3 项全部展示；超过后保留两个首要动作，其余收进更多 */
const TEXT_FOLD_WHEN_OVER = 3;
const DEFAULT_TEXT_FOLDED_VISIBLE = 2;
/** icon：最多 3 个槽位 */
const DEFAULT_ICON_MAX_VISIBLE = 3;

const ICON_BTN =
  'inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent p-0 text-arco-text-2 hover:bg-arco-fill-2 hover:text-arco-text-1 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:text-xs';

const TEXT_BTN =
  'inline-flex cursor-pointer items-center border-0 bg-transparent p-0 text-[12px] leading-[12px] text-[rgb(var(--primary-6))] hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40';

/** 更多触发器 — Figma interactive-button/more 14×14 */
const MORE_BTN =
  'inline-flex size-[14px] shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[rgb(var(--primary-6))] hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-[14px]';

const COMPACT_ACTION_BTN =
  'inline-flex size-[32px] shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 text-arco-text-2 hover:bg-arco-fill-2 hover:text-arco-text-1 disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:text-sm';

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

function buildMoreMenu(
  moreItems: ActionLinkItem[],
  opts?: { textOnly?: boolean }
) {
  return (
    <Menu
      style={{ minWidth: 120 }}
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
          className={
            item.danger ? '!text-[rgb(var(--danger-6))]' : undefined
          }
        >
          {opts?.textOnly ? (
            item.label
          ) : (
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex text-xs [&_svg]:text-xs">
                {resolveActionIcon(item)}
              </span>
              {item.label}
            </span>
          )}
        </Menu.Item>
      ))}
    </Menu>
  );
}

/**
 * 表格操作列
 * - 移动端：单操作直接使用图标，多操作统一收进一个 32px 更多菜单
 * - text：≤3 全部展示；>3 折叠为「前两项 + 更多」
 * - icon：最多 3 个槽位（含更多）
 */
export function ActionLinks({
  items,
  maxVisible,
  variant = 'icon',
  className
}: ActionLinksProps) {
  const t = useLocale();
  const compact = useMediaQuery(MOBILE_MEDIA_QUERY);

  if (compact) {
    const onlyItem = items.length === 1 ? items[0] : undefined;
    const compactMenu = items.length > 1 ? buildMoreMenu(items) : null;

    return (
      <div className={cs('flex w-full items-center justify-center', className)}>
        {onlyItem ? (
          <button
            type="button"
            className={cs(
              COMPACT_ACTION_BTN,
              onlyItem.danger && 'hover:!text-arco-danger'
            )}
            disabled={onlyItem.disabled}
            aria-label={
              typeof onlyItem.label === 'string' ? onlyItem.label : onlyItem.key
            }
            onClick={(e) => {
              e.stopPropagation();
              onlyItem.onClick?.();
            }}
          >
            {resolveActionIcon(onlyItem)}
          </button>
        ) : compactMenu ? (
          <Dropdown droplist={compactMenu} position="br" trigger="click">
            <button
              type="button"
              className={COMPACT_ACTION_BTN}
              aria-label={t['common.more']}
              onClick={(e) => e.stopPropagation()}
            >
              <IconMore />
            </button>
          </Dropdown>
        ) : null}
      </div>
    );
  }

  if (variant === 'text') {
    const foldedVisible = Math.max(
      0,
      maxVisible ?? DEFAULT_TEXT_FOLDED_VISIBLE
    );
    const needFold = items.length > TEXT_FOLD_WHEN_OVER;
    const visibleItems = needFold ? items.slice(0, foldedVisible) : items;
    const moreItems = needFold ? items.slice(foldedVisible) : [];
    const moreMenu = moreItems.length
      ? buildMoreMenu(moreItems, { textOnly: true })
      : null;
    return (
      <div
        className={cs(
          'flex w-full items-center justify-center gap-[8px]',
          className
        )}
      >
        {visibleItems.map((item) => (
          <button
            key={item.key}
            type="button"
            className={cs(TEXT_BTN, item.danger && '!text-[rgb(var(--danger-6))]')}
            disabled={item.disabled}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick?.();
            }}
          >
            {item.label}
          </button>
        ))}
        {moreMenu ? (
          <Dropdown droplist={moreMenu} position="br" trigger="click">
            <button
              type="button"
              className={MORE_BTN}
              aria-label={t['common.more']}
              onClick={(e) => e.stopPropagation()}
            >
              <IconMoreDots aria-hidden />
            </button>
          </Dropdown>
        ) : null}
      </div>
    );
  }

  const safeMax = Math.max(1, maxVisible ?? DEFAULT_ICON_MAX_VISIBLE);
  const needMore = items.length > safeMax;
  const visibleItems = needMore ? items.slice(0, safeMax - 1) : items;
  const moreItems = needMore ? items.slice(safeMax - 1) : [];
  const moreMenu = moreItems.length ? buildMoreMenu(moreItems) : null;

  return (
    <div
      className={cs(
        'flex w-full items-center justify-center gap-2',
        className
      )}
    >
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
          <Tooltip content={t['common.more']}>
            <button
              type="button"
              className={ICON_BTN}
              aria-label={t['common.more']}
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
