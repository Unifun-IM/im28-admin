import React, { useMemo, useState } from 'react';
import groupBy from 'lodash/groupBy';
import { Trigger, Spin, Button, Switch } from '@arco-design/web-react';
import useLocale from '@shared/lib/useLocale';
import cs from 'classnames';
import MessageList, { MessageListType } from './list';
import './message-box.less';

type TabKey = 'all' | 'unread' | 'message' | 'notice';

function DropContent() {
  const t = useLocale();
  const [loading] = useState(false);
  const [alertSound, setAlertSound] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [sourceData, setSourceData] = useState<MessageListType>([]);

  function readMessage(data: MessageListType) {
    const ids = new Set(data.map((item) => item.id));
    setSourceData((prev) =>
      prev.map((row) => (ids.has(row.id) ? { ...row, status: 1 } : row))
    );
  }

  const groupData = useMemo(() => groupBy(sourceData, 'type'), [sourceData]);
  const unreadAll = useMemo(
    () => sourceData.filter((row) => !row.status),
    [sourceData]
  );

  const listData = useMemo(() => {
    if (activeTab === 'all') return sourceData;
    if (activeTab === 'unread') return unreadAll;
    return groupData[activeTab] || [];
  }, [activeTab, sourceData, unreadAll, groupData]);

  const tabs: { key: TabKey; label: React.ReactNode }[] = [
    { key: 'all', label: t['message.tab.all'] },
    {
      key: 'unread',
      label: `${t['message.tab.unread']}${
        unreadAll.length ? `(${unreadAll.length})` : ''
      }`
    },
    { key: 'message', label: t['message.tab.category1'] },
    { key: 'notice', label: t['message.tab.category2'] }
  ];

  return (
    <div className="flex max-h-[520px] w-96 flex-col overflow-hidden rounded-xl bg-arco-bg-popup shadow-popover">
      <div className="box-border flex h-12 items-center justify-between gap-2 border-b border-arco-border-2 bg-arco-bg-popup p-2">
        <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-arco-text-1">
          {t['message.box.title']}
        </span>
        <div className="flex shrink-0 items-center gap-2 text-xs leading-5 text-arco-text-1">
          <span>{t['message.onlyUnread']}</span>
          <Switch size="small" checked={alertSound} onChange={setAlertSound} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2">
        <div className="mb-2 flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={cs(
                'h-6 cursor-pointer appearance-none rounded-sm border-0 bg-transparent px-2 text-xs leading-5 text-arco-text-2 hover:text-arco-text-1',
                activeTab === tab.key && 'bg-arco-fill-2 text-arco-text-1'
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Spin loading={loading} style={{ display: 'block' }}>
          <MessageList
            data={listData}
            unReadData={unreadAll}
            onItemClick={(row) => {
              readMessage([row]);
            }}
            onAllBtnClick={(rows) => {
              readMessage(rows);
            }}
          />
        </Spin>
      </div>
      <div className="box-border flex h-12 items-center justify-end gap-2 border-t border-arco-border-2 bg-arco-bg-popup p-2">
        <Button
          type="secondary"
          size="small"
          className="!rounded"
          onClick={() => readMessage(unreadAll)}
        >
          {t['message.allRead']}
        </Button>
        <Button type="primary" size="small" className="!rounded">
          {t['message.seeMore']}
        </Button>
      </div>
    </div>
  );
}

function MessageBox({
  children,
  onVisibleChange
}: {
  children: React.ReactNode;
  onVisibleChange?: (visible: boolean) => void;
}) {
  return (
    <Trigger
      trigger="click"
      popup={() => <DropContent />}
      position="br"
      unmountOnExit={false}
      popupAlign={{ bottom: 4 }}
      onVisibleChange={onVisibleChange}
    >
      {children}
    </Trigger>
  );
}

export default MessageBox;
