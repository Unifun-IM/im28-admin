import React, { useMemo, useState } from 'react';
import { Tooltip } from '@arco-design/web-react';
import { IconDown, IconQuestionCircle, IconUp } from '@arco-design/web-react/icon';
import cs from 'classnames';

export type SummaryItem = {
  label: string;
  value: string | number;
  suffix?: string;
  /** 问号提示文案；有值时展示图标 */
  tip?: string;
  /**
   * 数值色：success 绿 / danger 红；
   * auto 根据正负号推断；默认正文色
   */
  tone?: 'default' | 'success' | 'danger' | 'auto';
};

export type DataSummaryProps = {
  items: SummaryItem[];
  /** 每行列数，默认按数量自动：≤3→3，≤4→4，否则 5 */
  columns?: 3 | 4 | 5;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  title?: string;
  className?: string;
};

function resolveColumns(count: number, columns?: 3 | 4 | 5): 3 | 4 | 5 {
  if (columns) return columns;
  if (count <= 3) return 3;
  if (count <= 4) return 4;
  return 5;
}

function resolveTone(
  value: string | number,
  tone: SummaryItem['tone'] = 'default'
): 'default' | 'success' | 'danger' {
  if (tone === 'success' || tone === 'danger') return tone;
  if (tone === 'auto') {
    const text = String(value).trim();
    if (text.startsWith('+')) return 'success';
    if (text.startsWith('-')) return 'danger';
  }
  return 'default';
}

/**
 * 数据汇总 — Figma 688:24685
 * 行高 32 / 字号 12·行高 20；标签 text-3 + 14 问号；数值 text-1 / success / danger
 */
export default function DataSummary({
  items,
  columns,
  collapsible = true,
  defaultCollapsed = false,
  title = '数据汇总',
  className
}: DataSummaryProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const cols = resolveColumns(items.length, columns);

  const cells = useMemo(() => {
    const list = [...items];
    const remainder = list.length % cols;
    if (remainder !== 0) {
      for (let i = 0; i < cols - remainder; i += 1) {
        list.push({ label: '', value: '' });
      }
    }
    return list;
  }, [items, cols]);

  if (!items.length) return null;

  if (collapsed) {
    return (
      <button
        type="button"
        className={cs(
          'use-biz-summary box-border flex h-[32px] w-full cursor-pointer items-center justify-center gap-[4px] px-[12px] text-[12px] leading-[20px] text-arco-text-1',
          className
        )}
        onClick={() => setCollapsed(false)}
      >
        <span>{title}</span>
        <IconDown className="text-[12px]" />
      </button>
    );
  }

  return (
    <div
      className={cs(
        'use-biz-summary box-border w-full overflow-hidden',
        className
      )}
    >
      <div className="box-border flex h-[32px] items-center justify-between gap-[10px] border-b border-arco-border-2 px-[12px]">
        <span className="min-w-0 flex-1 text-[12px] font-normal leading-[20px] text-arco-text-1">
          {title}
        </span>
        {collapsible && (
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-[4px] border-0 bg-transparent p-0 text-[12px] leading-[20px] text-arco-text-2 hover:text-arco-text-1"
            onClick={() => setCollapsed(true)}
          >
            收起
            <IconUp className="text-[12px]" />
          </button>
        )}
      </div>
      <div
        className="grid w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cells.map((item, index) => {
          const empty = !item.label && (item.value === '' || item.value == null);
          const isLastCol = (index + 1) % cols === 0;
          const isLastRow = index >= cells.length - cols;
          const cellBorder = cs(
            'box-border flex h-[32px] min-w-0 items-center justify-between gap-[8px] border-solid border-arco-border-2 px-[12px]',
            !isLastCol && 'border-r',
            !isLastRow && 'border-b'
          );

          if (empty) {
            return <div key={`empty-${index}`} className={cellBorder} aria-hidden />;
          }

          const tone = resolveTone(item.value, item.tone);
          return (
            <div key={`${item.label}-${index}`} className={cellBorder}>
              <div className="flex min-w-0 flex-1 items-center gap-[4px]">
                <span className="truncate text-[12px] leading-[20px] text-arco-text-3">
                  {item.label}
                </span>
                {item.tip != null && item.tip !== '' && (
                  <Tooltip content={item.tip}>
                    <IconQuestionCircle className="shrink-0 cursor-help text-[14px] text-arco-text-4" />
                  </Tooltip>
                )}
              </div>
              <span
                className={cs(
                  'shrink-0 text-[12px] leading-[20px] tabular-nums',
                  tone === 'success' && 'text-[rgb(var(--success-6))]',
                  tone === 'danger' && 'text-[rgb(var(--danger-6))]',
                  tone === 'default' && 'text-arco-text-1'
                )}
              >
                {item.value}
                {item.suffix != null ? item.suffix : null}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
