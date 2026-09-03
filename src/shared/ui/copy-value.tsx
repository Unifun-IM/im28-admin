import React from 'react';
import { Message, Tooltip } from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import cs from 'classnames';
import copy from 'copy-to-clipboard';
import useLocale from '@shared/lib/useLocale';

export type CopyValueProps = {
  value: string;
  /** 为空时展示文案，默认不渲染复制按钮 */
  emptyText?: string;
  /** 单行省略，并在 Tooltip 中展示完整值 */
  truncate?: boolean;
  className?: string;
};

/**
 * 详情字段内联复制：文案 + 复制图标
 */
export function CopyValue({
  value,
  emptyText = '--',
  truncate = false,
  className
}: CopyValueProps) {
  const t = useLocale();
  const text = String(value || '').trim();
  const display = text || emptyText;
  const canCopy = Boolean(text) && text !== emptyText && text !== '--';

  const valueNode = (
    <span
      className={cs(
        'text-xs text-arco-text-1',
        truncate &&
          'block min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap'
      )}
    >
      {display}
    </span>
  );

  return (
    <span
      className={cs(
        'inline-flex items-center gap-[8px]',
        truncate && 'min-w-0 max-w-full',
        className
      )}
    >
      {truncate && text ? (
        <Tooltip content={text}>{valueNode}</Tooltip>
      ) : (
        valueNode
      )}
      {canCopy ? (
        <button
          type="button"
          className="inline-flex size-[10px] shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-3 hover:text-arco-text-1"
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
