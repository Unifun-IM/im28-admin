import React from 'react';
import { Switch } from '@arco-design/web-react';
import {
  IconArchive,
  IconClose,
  IconDelete,
  IconEdit
} from '@arco-design/web-react/icon';
import cs from 'classnames';
import useLocale from '@shared/lib/useLocale';

export type BatchBarActionStatus = 'danger' | 'success' | 'default';

export type BatchBarActionProps = {
  status?: BatchBarActionStatus;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  /** dark 浮条内按钮（默认跟随外层 theme） */
  tone?: 'light' | 'dark';
};

const STATUS_COLOR: Record<BatchBarActionStatus, string> = {
  danger: 'text-[rgb(var(--danger-6))]',
  success: 'text-[rgb(var(--success-6))]',
  default: 'text-arco-text-1'
};

/** 批量条内操作按钮 — Figma 804:19957（浅色） */
export function BatchBarAction({
  status = 'default',
  icon,
  children,
  onClick,
  disabled,
  className,
  tone = 'light'
}: BatchBarActionProps) {
  const isDark = tone === 'dark';
  return (
    <button
      type="button"
      disabled={disabled}
      className={cs(
        'inline-flex h-8 items-center gap-2 border-0 border-l border-solid bg-transparent px-3 text-[14px] leading-[21px] disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:text-[16px]',
        isDark
          ? 'border-[#262828] text-[rgba(255,255,255,0.9)] hover:bg-[rgba(255,255,255,0.08)]'
          : cs(
              'border-[var(--color-border-2)] hover:opacity-80',
              STATUS_COLOR[status]
            ),
        className
      )}
      onClick={onClick}
    >
      {icon}
      {children}
    </button>
  );
}

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
   * light — Figma 804:19957 / 796:23138（列表统一）
   * dark — 居中深色浮条（兼容）
   */
  theme?: 'dark' | 'light';
  /** 左侧关闭：清空选中 / 退出批量 — Figma 804:19957 */
  onExit?: () => void;
};

/**
 * 多选时浮出的批量操作条
 * 统一交互：浅色条 = 关闭 +「只显示已选 n」+ Switch + 业务操作
 * @see https://www.figma.com/design/FHxYjuSXz1vHmtIbcfLSV3/?node-id=804-19957
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
  theme = 'light',
  onExit
}: TableBatchBarProps) {
  const t = useLocale();
  if (count <= 0) return null;

  const isLight = theme === 'light';
  const actionTone = isLight ? 'light' : 'dark';

  return (
    <div
      className={cs(
        'use-table-batch-bar flex h-8 max-w-full items-center overflow-x-auto overflow-y-hidden rounded-[8px]',
        isLight
          ? 'use-table-batch-bar-light border border-solid border-[var(--color-fill-3,#e5e6eb)] bg-[var(--color-bg-1,#f7f8fa)]'
          : 'use-table-batch-bar-dark border border-[rgba(255,255,255,0.12)] bg-[#171a21] shadow-popover',
        className
      )}
      role="toolbar"
      aria-label={t['common.batchActions']}
    >
      <div
        className={cs(
          'flex h-8 shrink-0 items-center justify-center gap-2 px-3 text-[14px] leading-[21px]',
          isLight ? 'text-arco-text-1' : 'text-[rgba(255,255,255,0.9)]'
        )}
      >
        {onExit ? (
          <button
            type="button"
            className={cs(
              'inline-flex size-3.5 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0',
              isLight
                ? 'text-arco-text-2 hover:text-arco-text-1'
                : 'text-[rgba(255,255,255,0.7)] hover:text-white'
            )}
            aria-label={t['common.cancel']}
            onClick={onExit}
          >
            <IconClose className="text-[14px]" />
          </button>
        ) : null}
        <span className="whitespace-nowrap">
          {t['common.showSelectedOnly'].replace('{n}', String(count))}
        </span>
        <Switch
          size="small"
          type="circle"
          className="use-table-batch-switch shrink-0"
          checked={showSelectedOnly}
          onChange={onShowSelectedOnlyChange}
        />
      </div>
      <div className="flex shrink-0 items-center">
        {onArchive && (
          <BatchBarAction
            tone={actionTone}
            icon={<IconArchive />}
            onClick={onArchive}
          >
            {t['common.archive']}
          </BatchBarAction>
        )}
        {onEdit && (
          <BatchBarAction
            tone={actionTone}
            icon={<IconEdit />}
            onClick={onEdit}
          >
            {t['common.edit']}
          </BatchBarAction>
        )}
        {onDelete && (
          <BatchBarAction
            tone={actionTone}
            status="danger"
            icon={<IconDelete />}
            onClick={onDelete}
          >
            {t['common.delete']}
          </BatchBarAction>
        )}
        {extra}
      </div>
    </div>
  );
}
