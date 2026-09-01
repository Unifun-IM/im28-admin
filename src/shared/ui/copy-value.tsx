import React from 'react';
import { Message } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import useLocale from '@shared/lib/useLocale';

export type CopyValueProps = {
  value: string;
  /** 为空时展示文案，默认不渲染复制按钮 */
  emptyText?: string;
  className?: string;
};

/**
 * 详情字段内联复制：文案 + 复制图标
 */
export function CopyValue({
  value,
  emptyText = '--',
  className
}: CopyValueProps) {
  const t = useLocale();
  const text = String(value || '').trim();
  const display = text || emptyText;
  const canCopy = Boolean(text) && text !== emptyText && text !== '--';

  return (
    <span
      className={`inline-flex items-center gap-[8px] ${className || ''}`.trim()}
    >
      <span className="text-xs text-arco-text-1">{display}</span>
      {canCopy ? (
        <button
          type="button"
          className="inline-flex size-[10px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-3 hover:text-arco-text-1"
          aria-label={t['common.copy']}
          onClick={() => {
            copy(text);
            Message.success(t['common.copied']);
          }}
        >
          <IconCopy className="text-[10px]" />
        </button>
      ) : null}
    </span>
  );
}

export default CopyValue;
