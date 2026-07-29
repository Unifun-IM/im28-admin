import React, { useEffect, useState } from 'react';
import groupBy from 'lodash/groupBy';
import {
  Trigger,
  Tabs,
  Avatar,
  Spin,
  Button,
  Switch
} from '@arco-design/web-react';
import {
  IconMessage,
  IconCustomerService,
  IconFile,
  IconDesktop
} from '@arco-design/web-react/icon';
import { getApiMessageList, postApiMessageRead } from '@shared/api/message';
import useLocale from '@shared/lib/useLocale';
import MessageList, { MessageListType } from './list';
import styles from './style/index.module.less';

function DropContent() {
  const t = useLocale();
  const [loading, setLoading] = useState(false);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [groupData, setGroupData] = useState<{
    [key: string]: MessageListType;
  }>({});
  const [sourceData, setSourceData] = useState<MessageListType>([]);

  function fetchSourceData(showLoading = true) {
    showLoading && setLoading(true);
    getApiMessageList()
      .then((data) => {
        setSourceData((data || []) as MessageListType);
      })
      .finally(() => {
        showLoading && setLoading(false);
      });
  }

  function readMessage(data: MessageListType) {
    const ids = data.map((item) => item.id);
    postApiMessageRead({ ids }).then(() => {
      fetchSourceData();
    });
  }

  useEffect(() => {
    fetchSourceData();
  }, []);

  useEffect(() => {
    const next = groupBy(sourceData, 'type');
    setGroupData(next);
  }, [sourceData]);

  const tabList = [
    {
      key: 'message',
      title: t['message.tab.title.message'],
      titleIcon: <IconMessage />
    },
    {
      key: 'notice',
      title: t['message.tab.title.notice'],
      titleIcon: <IconCustomerService />
    },
    {
      key: 'todo',
      title: t['message.tab.title.todo'],
      titleIcon: <IconFile />,
      avatar: (
        <Avatar style={{ backgroundColor: '#0FC6C2' }}>
          <IconDesktop />
        </Avatar>
      )
    }
  ];

  return (
    <div className={styles['message-box']}>
      <div className={styles['message-header']}>
        <span className={styles['message-header-title']}>
          {t['message.box.title']}
        </span>
        <div className={styles['message-header-extra']}>
          <span>{t['message.onlyUnread']}</span>
          <Switch size="small" checked={onlyUnread} onChange={setOnlyUnread} />
        </div>
      </div>
      <Spin loading={loading} style={{ display: 'block' }}>
        <Tabs
          overflow="dropdown"
          type="rounded"
          defaultActiveTab="message"
          destroyOnHide
        >
          {tabList.map((item) => {
            const { key, title } = item;
            const data = groupData[key] || [];
            const unReadData = data.filter((row) => !row.status);
            const listData = onlyUnread ? unReadData : data;
            return (
              <Tabs.TabPane
                key={key}
                title={
                  <span>
                    {title}
                    {unReadData.length ? `(${unReadData.length})` : ''}
                  </span>
                }
              >
                <MessageList
                  data={listData}
                  unReadData={unReadData}
                  onItemClick={(row) => {
                    readMessage([row]);
                  }}
                  onAllBtnClick={(rows) => {
                    readMessage(rows);
                  }}
                />
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </Spin>
      <div className={styles.footer}>
        <Button type="text" long onClick={() => setSourceData([])}>
          {t['message.empty']}
        </Button>
        <Button
          type="text"
          long
          onClick={() => readMessage(sourceData.filter((i) => !i.status))}
        >
          {t['message.allRead']}
        </Button>
      </div>
    </div>
  );
}

function MessageBox({ children }: { children: React.ReactNode }) {
  return (
    <Trigger
      trigger="click"
      popup={() => <DropContent />}
      position="br"
      unmountOnExit={false}
      popupAlign={{ bottom: 4 }}
    >
      {children}
    </Trigger>
  );
}

export default MessageBox;
