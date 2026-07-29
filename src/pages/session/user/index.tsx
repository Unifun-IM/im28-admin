import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Button } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import { BizListPage } from '@widgets/biz-list';
import { getUserSessions } from '@shared/api/biz';

const FormItem = Form.Item;

export default function UserSessionPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await getUserSessions({ page: p, pageSize: size, ...values });
        setData((res.list || []) as Record<string, unknown>[]);
        setTotal(res.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [form, page, pageSize]
  );

  useEffect(() => {
    fetchData(1, pageSize);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BizListPage
      form={form}
      filter={
        <FormItem field="keyword" label="用户关键词">
          <Input placeholder="用户ID / 昵称" />
        </FormItem>
      }
      onSearch={() => {
        setPage(1);
        fetchData(1, pageSize);
      }}
      onReset={() => {
        form.resetFields();
        setPage(1);
        fetchData(1, pageSize);
      }}
      tableProps={{
        loading,
        data,
        columns: [
          { title: '用户ID', dataIndex: 'userId' },
          { title: '昵称', dataIndex: 'nickname' },
          { title: '对方ID', dataIndex: 'peerId' },
          { title: '对方昵称', dataIndex: 'peerName' },
          { title: '最近消息', dataIndex: 'lastMessage', ellipsis: true },
          { title: '未读', dataIndex: 'unread' },
          { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
          {
            title: '操作',
            width: 120,
            render: (_: unknown, row: Record<string, unknown>) => (
              <Button
                type="text"
                onClick={() => navigate(`/session/chat/user/${row.userId}`)}
              >
                查看消息
              </Button>
            )
          }
        ],
        pagination: {
          current: page,
          pageSize,
          total,
          onChange: (p, s) => {
            setPage(p);
            setPageSize(s);
            fetchData(p, s);
          }
        }
      }}
    />
  );
}
