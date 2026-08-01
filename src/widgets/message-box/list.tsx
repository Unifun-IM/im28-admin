import React, { useMemo } from 'react';
import { Result } from '@arco-design/web-react';
import useLocale from '@shared/lib/useLocale';
import cs from 'classnames';

export interface MessageItemData {
  id: string;
  title: string;
  subTitle?: string;
  avatar?: string;
  content: string;
  time?: string;
  status: number;
  tag?: {
    text?: string;
    color?: string;
  };
}

export type MessageListType = MessageItemData[];

interface MessageListProps {
  data: MessageItemData[];
  unReadData: MessageItemData[];
  onItemClick?: (item: MessageItemData, index: number) => void;
  onAllBtnClick?: (
    unReadData: MessageItemData[],
    data: MessageItemData[]
  ) => void;
}

function getGroupLabel(time?: string) {
  if (!time) return 'earlier';
  // 简单启发：带日期的归「更早之前」，仅时刻归「今天」
  if (/^\d{1,2}:\d{2}$/.test(time.trim())) return 'today';
  return 'earlier';
}

function MessageList(props: MessageListProps) {
  const t = useLocale();
  const { data } = props;

  const groups = useMemo(() => {
    const today: MessageItemData[] = [];
    const earlier: MessageItemData[] = [];
    data.forEach((item) => {
      if (getGroupLabel(item.time) === 'today') today.push(item);
      else earlier.push(item);
    });
    return [
      { key: 'today', label: t['message.group.today'], items: today },
      { key: 'earlier', label: t['message.group.earlier'], items: earlier }
    ].filter((g) => g.items.length);
  }, [data, t]);

  function onItemClick(item: MessageItemData, index: number) {
    if (item.status) return;
    props.onItemClick?.(item, index);
  }

  if (!data.length) {
    return (
      <div className="use-message-empty py-6 pb-4">
        <Result status="404" subTitle={t['message.empty.tips']} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <div key={group.key}>
          <div className="mb-1 text-xs leading-5 text-arco-text-3">
            {group.label}
          </div>
          {group.items.map((item, index) => {
            const unread = !item.status;
            return (
              <button
                key={item.id}
                type="button"
                className="flex w-full cursor-pointer flex-col gap-1 border-0 border-b border-arco-border-2 bg-transparent py-2 text-left last:border-b-0 hover:opacity-[0.85]"
                onClick={() => onItemClick(item, index)}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-arco-text-1">
                    {item.title}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1">
                    <span className="text-[10px] leading-[14px] text-arco-text-3">
                      {item.time}
                    </span>
                    <span
                      className={cs(
                        'h-2 w-2 rounded-full bg-arco-danger',
                        !unread && 'opacity-0'
                      )}
                    />
                  </span>
                </div>
                <p className="m-0 line-clamp-2 text-xs leading-5 text-arco-text-3">
                  {item.content}
                </p>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default MessageList;
