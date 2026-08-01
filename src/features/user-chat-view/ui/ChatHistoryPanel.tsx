import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Calendar,
  Input,
  List,
  Spin,
  Tabs
} from '@arco-design/web-react';
import {
  IconClose,
  IconFile,
  IconPlayArrowFill
} from '@arco-design/web-react/icon';
import dayjs, { Dayjs } from 'dayjs';
import { searchChatHistory } from '../api/chatStubs';
import iconChatHistorySearch from '../assets/icon-chat-history-search.svg';
import useElementHeight from './useElementHeight';

export type ChatHistoryTab = 'all' | 'media' | 'file' | 'date';

export type ChatHistoryPanelProps = {
  chatType: 'user' | 'group';
  chatId: string;
  onClose: () => void;
  /** 点结果回到会话并定位 */
  onLocate?: (messageId: string) => void;
};

type HistoryItem = {
  id: string;
  senderName: string;
  content: string;
  time: string;
  dateLabel?: string;
  month?: string;
  msgType?: 'text' | 'image' | 'video' | 'file';
  fileName?: string;
  fileSize?: string;
  fileExt?: string;
};

type MediaGroup = {
  month: string;
  items: Array<{ id: string; kind: 'image' | 'video' }>;
};

type FileGroup = {
  month: string;
  items: HistoryItem[];
};

/**
 * 查看聊天记录 — Figma 791:35472 / 35490 / 35572 / 35548 / 35623 / 35517
 * 覆盖：全部搜索 / 无结果 / 图片与视频 / 文件 / 日期
 */
export default function ChatHistoryPanel({
  chatType,
  chatId,
  onClose,
  onLocate
}: ChatHistoryPanelProps) {
  const [tab, setTab] = useState<ChatHistoryTab>('all');
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'text'>(
    'all'
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs('2025-10-20'));
  const [showCalendar, setShowCalendar] = useState(true);

  const [allList, setAllList] = useState<HistoryItem[]>([]);
  const [mediaGroups, setMediaGroups] = useState<MediaGroup[]>([]);
  const [fileGroups, setFileGroups] = useState<FileGroup[]>([]);
  const { ref: listWrapRef, height: listHeight } =
    useElementHeight<HTMLDivElement>();

  const runSearch = (nextQuery = keyword, nextTab = tab) => {
    setQuery(nextQuery);
    setSearched(true);
    setLoading(true);
    searchChatHistory({
      type: chatType,
      id: chatId,
      keyword: nextQuery,
      tab: nextTab,
      date: nextTab === 'date' ? selectedDate.format('YYYY-MM-DD') : undefined,
      mediaFilter: nextTab === 'media' ? mediaFilter : undefined
    })
      .then((res) => {
        const data = res as unknown as {
          list?: HistoryItem[];
          mediaGroups?: MediaGroup[];
          fileGroups?: FileGroup[];
        };
        setAllList((data.list || []) as HistoryItem[]);
        setMediaGroups((data.mediaGroups || []) as MediaGroup[]);
        setFileGroups((data.fileGroups || []) as FileGroup[]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // 切到媒体/文件/日期时自动拉一次；全部需点搜索或已搜过
    if (tab === 'all') return;
    runSearch(keyword, tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, mediaFilter, selectedDate]);

  useEffect(() => {
    if (tab === 'date') setShowCalendar(true);
  }, [tab]);

  const dateFiltered = useMemo(() => {
    if (tab !== 'date') return allList;
    const key = selectedDate.format('YYYY年M月D日');
    return allList.filter((m) => (m.dateLabel || key) === key || true);
  }, [allList, selectedDate, tab]);

  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${escapeReg(query)})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="text-[rgb(var(--primary-6))]">
          {part}
        </span>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );
  };

  const empty =
    searched &&
    !loading &&
    ((tab === 'all' && allList.length === 0) ||
      (tab === 'media' && mediaGroups.every((g) => g.items.length === 0)) ||
      (tab === 'file' && fileGroups.every((g) => g.items.length === 0)) ||
      (tab === 'date' && dateFiltered.length === 0 && searched));

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5 bg-white px-4">
      <header className="relative flex h-14 shrink-0 items-center justify-center">
        <button
          type="button"
          aria-label="关闭"
          className="absolute left-0 inline-flex size-5 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-1"
          onClick={onClose}
        >
          <IconClose className="text-[16px]" />
        </button>
        <h3 className="m-0 text-[18px] font-medium leading-[1.5] text-black">
          查看聊天记录
        </h3>
      </header>

      {/* Figma 791:35482：输入 #f0f0f0 40×圆角6 + 品牌色搜索按钮 */}
      <div className="flex shrink-0 flex-col">
        <div className="flex items-center gap-2 pb-2">
          <Input
            allowClear
            value={keyword}
            onChange={setKeyword}
            placeholder="搜索"
            prefix={
              <img
                src={iconChatHistorySearch}
                alt=""
                className="size-6 shrink-0"
              />
            }
            className="use-chat-history-search min-w-0 flex-1"
            onPressEnter={() =>
              runSearch(keyword, tab === 'date' ? 'all' : tab)
            }
          />
          <Button
            type="primary"
            className="use-chat-history-search-btn !h-10 !min-w-0 !rounded-md !border-0 !bg-[#7b61ff] !px-3 !text-[16px] !font-normal !leading-[1.5] !text-white hover:!bg-[#6a52e6]"
            onClick={() => {
              if (tab === 'date') setTab('all');
              runSearch(keyword, tab === 'date' ? 'all' : tab);
            }}
          >
            搜索
          </Button>
        </div>

        <Tabs
          activeTab={tab}
          onChange={(k) => setTab(k as ChatHistoryTab)}
          className={`use-chat-history-tabs shrink-0 ${
            tab === 'all' && searched ? 'is-all-active' : ''
          }`}
        >
          <Tabs.TabPane key="all" title="全部" />
          <Tabs.TabPane key="media" title="图片与视频" />
          <Tabs.TabPane key="file" title="文件" />
          <Tabs.TabPane key="date" title="日期" />
        </Tabs>
      </div>

      {tab === 'media' ? (
        <div className="flex shrink-0 gap-2 py-2">
          {(
            [
              ['all', '全部'],
              ['image', '按图像搜索'],
              ['text', '按文字搜索']
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={`h-7 cursor-pointer rounded-md border-0 px-3 text-[12px] ${
                mediaFilter === k
                  ? 'bg-[var(--color-fill-3,#e5e6eb)] text-arco-text-1'
                  : 'bg-[var(--color-fill-2,#f2f3f5)] text-arco-text-2'
              }`}
              onClick={() => setMediaFilter(k)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      <div ref={listWrapRef} className="relative min-h-0 flex-1 pb-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Spin />
          </div>
        ) : tab === 'all' ? (
          !searched ? (
            <div className="py-16 text-center text-[14px] text-arco-text-3">
              输入关键词后点击搜索
            </div>
          ) : empty ? (
            <EmptyResult />
          ) : listHeight > 0 ? (
            <List
              className="use-chat-virtual-list use-chat-history-result-list"
              bordered={false}
              split={false}
              dataSource={allList}
              virtualListProps={{
                height: listHeight,
                isStaticItemHeight: false,
                itemHeight: 72,
                threshold: 40
              }}
              render={(item: HistoryItem) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full cursor-pointer items-start gap-3 border-0 border-b border-solid border-[rgba(120,120,128,0.12)] bg-transparent py-3 text-left"
                  onClick={() => onLocate?.(item.id)}
                >
                  <Avatar size={40}>{item.senderName.slice(0, 1)}</Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] text-arco-text-3">
                      {item.senderName}
                    </div>
                    <div className="truncate text-[16px] text-arco-text-1">
                      {highlight(item.content)}
                    </div>
                  </div>
                  <span className="shrink-0 text-[12px] text-arco-text-3">
                    {item.time}
                  </span>
                </button>
              )}
            />
          ) : null
        ) : tab === 'media' ? (
          empty ? (
            <EmptyResult />
          ) : (
            <div className="h-full overflow-y-auto">
              {query ? (
                <p className="m-0 mb-3 text-[12px] text-arco-text-3">
                  找到“{query}”相关的图片，共
                  {mediaGroups.reduce((n, g) => n + g.items.length, 0)}个
                </p>
              ) : null}
              {mediaGroups.map((g) => (
                <div key={g.month} className="mb-4">
                  <div className="mb-2 text-[14px] text-arco-text-2">
                    {g.month}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {g.items.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="relative aspect-square cursor-pointer overflow-hidden rounded-md border-0 bg-[var(--color-fill-2,#eee)] p-0"
                        onClick={() => onLocate?.(m.id)}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] text-arco-text-3">
                          {m.kind === 'video' ? '视频' : '图片'}
                        </span>
                        {m.kind === 'video' ? (
                          <IconPlayArrowFill className="absolute bottom-1 left-1 text-[18px] text-white drop-shadow" />
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'file' ? (
          empty ? (
            <EmptyResult />
          ) : (
            <div className="h-full overflow-y-auto">
              {fileGroups.map((g) => (
                <div key={g.month} className="mb-4">
                  <div className="mb-2 text-[14px] text-arco-text-2">
                    {g.month}
                  </div>
                  {g.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="mb-3 flex w-full cursor-pointer flex-col gap-2 border-0 bg-transparent p-0 text-left"
                      onClick={() => onLocate?.(item.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar size={28}>{item.senderName.slice(0, 1)}</Avatar>
                        <span className="min-w-0 flex-1 truncate text-[14px] text-arco-text-1">
                          {item.senderName}
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-[12px] text-arco-text-3">
                          {item.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-[var(--color-fill-2,#f2f3f5)] px-3 py-2">
                        <FileTypeIcon ext={item.fileExt || 'DOC'} />
                        <div className="min-w-0">
                          <div className="truncate text-[14px] text-arco-text-1">
                            {item.fileName}
                          </div>
                          <div className="text-[12px] text-arco-text-3">
                            {item.fileSize}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="relative h-full">
            {showCalendar ? (
              <div className="absolute left-0 top-0 z-10 w-[280px] rounded-xl bg-[var(--color-bg-2,#fff)] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <Calendar
                  panel
                  value={selectedDate}
                  onChange={(v) => {
                    setSelectedDate(v);
                    setShowCalendar(false);
                    setSearched(true);
                  }}
                  className="use-chat-history-calendar"
                />
              </div>
            ) : (
              <button
                type="button"
                className="mb-3 cursor-pointer border-0 bg-transparent p-0 text-[14px] text-[rgb(var(--primary-6))]"
                onClick={() => setShowCalendar(true)}
              >
                {selectedDate.format('YYYY年M月D日')} · 重选日期
              </button>
            )}
            <div
              className={showCalendar ? 'h-full pt-[320px]' : 'h-full'}
              style={{ overflow: showCalendar ? 'hidden' : undefined }}
            >
              <div className="mb-2 text-[14px] text-arco-text-2">
                {selectedDate.format('YYYY年M月D日')}
              </div>
              {dateFiltered.length === 0 ? (
                <EmptyResult />
              ) : listHeight > 0 ? (
                <List
                  className="use-chat-virtual-list use-chat-history-result-list"
                  bordered={false}
                  split={false}
                  dataSource={dateFiltered}
                  virtualListProps={{
                    height: Math.max(120, listHeight - (showCalendar ? 360 : 40)),
                    isStaticItemHeight: false,
                    itemHeight: 72,
                    threshold: 40
                  }}
                  render={(item: HistoryItem) => (
                    <button
                      key={item.id}
                      type="button"
                      className="flex w-full cursor-pointer items-start gap-3 border-0 border-b border-solid border-[rgba(120,120,128,0.12)] bg-transparent py-3 text-left"
                      onClick={() => onLocate?.(item.id)}
                    >
                      <Avatar size={40}>{item.senderName.slice(0, 1)}</Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] text-arco-text-3">
                          {item.senderName}
                        </div>
                        <div className="truncate text-[16px] text-arco-text-1">
                          {highlight(item.content)}
                        </div>
                      </div>
                      <span className="shrink-0 text-[12px] text-arco-text-3">
                        {item.time}
                      </span>
                    </button>
                  )}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="flex h-48 items-center justify-center text-[14px] text-arco-text-3">
      无结果
    </div>
  );
}

function FileTypeIcon({ ext }: { ext: string }) {
  const color =
    ext === 'PDF' ? '#F53F3F' : ext === 'ZIP' ? '#00B42A' : '#3491FA';
  return (
    <span
      className="inline-flex size-8 shrink-0 items-center justify-center rounded text-[10px] font-semibold text-white"
      style={{ background: color }}
    >
      {ext || <IconFile />}
    </span>
  );
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
