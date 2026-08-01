import React from 'react';
import cs from 'classnames';

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
        'use-status-badge inline-flex items-center gap-[8px] text-[12px] leading-[20px] text-arco-text-1',
        className
      )}
    >
      <i className={cs('size-[6px] shrink-0 rounded-full', STATUS_DOT[status])} />
      {text}
    </span>
  );
}
