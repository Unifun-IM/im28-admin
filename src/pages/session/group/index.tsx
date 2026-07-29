import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Select, Button, Tag } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import { BizListPage } from '@widgets/biz-list';
import { getGroupSessions } from '@shared/api/biz';

const FormItem = Form.Item;

export default function GroupQueryPage() {
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
        const res = await getGroupSessions({ page: p, pageSize: size, ...values });
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
        <>
          <FormItem field="keyword" label="群关键词">
            <Input placeholder="群ID / 名称" />
          </FormItem>
          <FormItem field="status" label="群状态">
            <Select
              allowClear
              placeholder="全部"
              options={['正常', '已解散', '禁言'].map((v) => ({ label: v, value: v }))}
            />
          </FormItem>
        </>
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
          { title: '群ID', dataIndex: 'groupId' },
          { title: '群名称', dataIndex: 'name' },
          { title: '群主ID', dataIndex: 'ownerId' },
          { title: '群主', dataIndex: 'ownerName' },
          { title: '成员数', dataIndex: 'memberCount' },
          {
            title: '状态',
            dataIndex: 'status',
            render: (v: string) => <Tag>{v}</Tag>
          },
          { title: '创建时间', dataIndex: 'createdAt', width: 180 },
          {
            title: '操作',
            width: 160,
            render: (_: unknown, row: Record<string, unknown>) => (
              <>
                <Button
                  type="text"
                  onClick={() => navigate(`/session/group-detail/${row.id}`)}
                >
                  详情
                </Button>
                <Button
                  type="text"
                  onClick={() => navigate(`/session/chat/group/${row.groupId}`)}
                >
                  查看消息
                </Button>
              </>
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
