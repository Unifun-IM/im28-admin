import React from 'react';
import { Avatar } from '@arco-design/web-react';
import cs from 'classnames';

import styles from './style/index.module.less';

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
    <div className={styles.avatarCell}>
      <Avatar size={size} className={styles.avatarCellAvatar}>
        {avatar ? <img alt="" src={avatar} /> : String(name || '?').slice(0, 1)}
      </Avatar>
      <div className={styles.avatarCellMeta}>
        <div className={styles.cellPrimary}>{name}</div>
        {sub != null && sub !== '' && (
          <div className={styles.cellSecondary}>{sub}</div>
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
    <div className={styles.doubleLineCell}>
      <div className={styles.cellPrimary}>{primary}</div>
      {secondary != null && secondary !== '' && (
        <div className={styles.cellSecondary}>{secondary}</div>
      )}
    </div>
  );
}

export type StatusBadgeProps = {
  status: 'success' | 'error' | 'warning' | 'default';
  text: React.ReactNode;
  className?: string;
};

const STATUS_CLASS: Record<StatusBadgeProps['status'], string> = {
  success: styles.statusSuccess,
  error: styles.statusError,
  warning: styles.statusWarning,
  default: styles.statusDefault
};

/** 状态点 + 文案（对齐 Figma badge/status） */
export function StatusBadge({ status, text, className }: StatusBadgeProps) {
  return (
    <span className={cs(styles.statusBadge, STATUS_CLASS[status], className)}>
      <i className={styles.statusDot} />
      {text}
    </span>
  );
}

export type ActionLinkItem = {
  key: string;
  label: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
};

export type ActionLinksProps = {
  items: ActionLinkItem[];
};

/** 操作列文字链接 */
export function ActionLinks({ items }: ActionLinksProps) {
  return (
    <div className={styles.actionLinks}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={cs(styles.actionLink, item.danger && styles.actionLinkDanger)}
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
