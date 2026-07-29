import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, Card, Table, Tag } from '@arco-design/web-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getChatMessages } from '@shared/api/biz';

export default function ChatHistoryPage() {
  const { type = 'user', id = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const res = await getChatMessages({ type, id, page: p, pageSize: size });
        setData((res.list || []) as Record<string, unknown>[]);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [type, id, page, pageSize]
  );

  useEffect(() => {
    fetchData(1, pageSize);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id]);

  return (
    <Card
      bordered={false}
      title={`查看聊天记录 · ${type === 'group' ? '群' : '用户'} ${id}`}
      extra={<Button onClick={() => navigate(-1)}>返回</Button>}
    >
      <Alert
        type="warning"
        style={{ marginBottom: 16 }}
        content="只读模式：您正在以管理员权限查看用户通讯记录。系统仅保留最近 180 天的消息内容。所有查阅操作均会被记录。"
      />
      <Table
        rowKey="id"
        loading={loading}
        data={data}
        columns={[
          { title: '发送者ID', dataIndex: 'senderId', width: 120 },
          { title: '发送者', dataIndex: 'senderName', width: 120 },
          {
            title: '类型',
            dataIndex: 'type',
            width: 90,
            render: (v: string) => <Tag>{v}</Tag>
          },
          { title: '内容', dataIndex: 'content', ellipsis: true },
          { title: '时间', dataIndex: 'time', width: 180 }
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
