import React from 'react';
import { Timeline } from '@arco-design/web-react';
import './biz-operation-timeline.less';

export type BizOperationTimelineItem = {
  key: React.Key;
  time: React.ReactNode;
  action: React.ReactNode;
  detail?: React.ReactNode;
};

export type BizOperationTimelineProps = {
  items: BizOperationTimelineItem[];
  empty?: React.ReactNode;
  className?: string;
  /** 时间列宽，默认 140 */
  timeWidth?: number;
  /** 动作列宽，默认 200 */
  actionWidth?: number;
};

/**
 * 详情操作日志 Timeline（稿面竖线 + 时间 / 动作 / 详情）
 * 样式依赖详情 Drawer 的 `.use-user-detail-timeline` 或自带 class。
 */
export default function BizOperationTimeline({
  items,
  empty,
  className,
  timeWidth = 140,
  actionWidth = 200
}: BizOperationTimelineProps) {
  if (!items.length) {
    return empty ? <>{empty}</> : null;
  }

  return (
    <Timeline className={className || 'use-biz-operation-timeline'}>
      {items.map((item, index) => (
        <Timeline.Item
          key={item.key}
          dotColor={
            index === 0
              ? 'rgb(var(--primary-6))'
              : 'var(--color-neutral-3, #c9cdd4)'
          }
        >
          <div className="flex items-start gap-[12px] text-[12px] leading-[20px]">
            <span
              className="shrink-0 whitespace-nowrap text-arco-text-3"
              style={{ width: timeWidth }}
            >
              {item.time}
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-[12px]">
              <span
                className="shrink-0 text-arco-text-1"
                style={{ width: actionWidth }}
              >
                {item.action}
              </span>
              {item.detail != null && item.detail !== '' ? (
                <span className="min-w-0 shrink truncate text-arco-text-3">
                  {item.detail}
                </span>
              ) : null}
            </span>
          </div>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
