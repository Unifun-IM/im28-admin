import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Tag, Switch, Message } from '@arco-design/web-react';
import { BizListPage } from '@widgets/biz-list';
import { getWithdrawChannels } from '@shared/api/biz';

const FormItem = Form.Item;

export default function Page() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async (p = page, size = pageSize) => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const res = await getWithdrawChannels({ page: p, pageSize: size, ...values });
      setData((res.list || []) as Record<string, unknown>[]);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [form, page, pageSize]);

  useEffect(() => {
    fetchData(1, pageSize);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BizListPage
      form={form}
      filter={
        <FormItem field="keyword" label="渠道名">
          <Input placeholder="请输入" />
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
          { title: '渠道', dataIndex: 'name' },
          { title: '币种', dataIndex: 'currency' },
          { title: '最小金额', dataIndex: 'minAmount' },
          { title: '最大金额', dataIndex: 'maxAmount' },
          {
            title: '状态',
            dataIndex: 'status',
            render: (v: string) => <Tag>{v}</Tag>
          },
          { title: '更新时间', dataIndex: 'updatedAt', width: 180 },
          {
            title: '启用',
            width: 100,
            render: (_: unknown, row: Record<string, unknown>) => (
              <Switch
                checked={row.status === '启用'}
                onChange={() => Message.success('已更新（mock）')}
              />
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
