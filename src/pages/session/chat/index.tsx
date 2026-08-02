import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Table, Tag } from '@arco-design/web-react';
import { useNavigate, useParams } from 'react-router-dom';
import useLocale from '@shared/lib/useLocale';

/**
 * 聊天记录页 — 独立路由占位。
 * 消息契约见 postV1AdminConversationMessagesList（需 user_id + conversation_id）；
 * 业务查聊天走 UserChatModal，本页暂不接线。
 */
export default function ChatHistoryPage() {
  const t = useLocale();
  const { type = 'user', id = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchData = useCallback(async (_p = page, _size = pageSize) => {
    setLoading(true);
    try {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData(1, pageSize);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id]);

  const title = t['chatHistory.title']
    .replace('{type}', type === 'group' ? t['chatHistory.type.group'] : t['chatHistory.type.user'])
    .replace('{id}', id);

  return (
    <Card
      bordered={false}
      title={title}
      extra={<Button onClick={() => navigate(-1)}>{t['common.back']}</Button>}
    >
      <Alert
        type="warning"
        style={{ marginBottom: 16 }}
        content={t['chatHistory.alert']}
      />
      <Table
        rowKey="id"
        loading={loading}
        data={data}
        columns={[
          {
            title: t['chatHistory.col.senderId'],
            dataIndex: 'senderId',
            width: 120
          },
          {
            title: t['chatHistory.col.sender'],
            dataIndex: 'senderName',
            width: 120
          },
          {
            title: t['chatHistory.col.type'],
            dataIndex: 'type',
            width: 90,
            render: (v: string) => <Tag>{v || '--'}</Tag>
          },
          {
            title: t['chatHistory.col.content'],
            dataIndex: 'content',
            ellipsis: true
          },
          {
            title: t['chatHistory.col.time'],
            dataIndex: 'time',
            width: 180
          }
        ]}
        pagination={{
          current: page,
          pageSize,
          total,
          showTotal: true,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
            fetchData(p, s);
          }
        }}
      />
    </Card>
  );
}
