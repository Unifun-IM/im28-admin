import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Select, Button, Drawer, Descriptions, Message, Tag } from '@arco-design/web-react';
import { BizListPage } from '@widgets/biz-list';
import { getWithdrawAbnormal } from '@shared/api/biz';

const FormItem = Form.Item;

export default function Page() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [current, setCurrent] = useState<Record<string, unknown> | null>(null);

  const fetchData = useCallback(async (p = page, size = pageSize) => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const res = await getWithdrawAbnormal({ page: p, pageSize: size, ...values });
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
    <>
      <BizListPage
        form={form}
        filter={
          <>
            <FormItem field="keyword" label="关键词">
              <Input placeholder="订单号 / 用户ID" />
            </FormItem>
            <FormItem field="currency" label="币种">
              <Select
                allowClear
                placeholder="全部"
                options={[
                  { label: 'CNY', value: 'CNY' },
                  { label: 'USDT', value: 'USDT' }
                ]}
              />
            </FormItem>
            <FormItem field="status" label="状态">
              <Select
                allowClear
                placeholder="全部"
                options={['成功', '处理中', '失败', '异常'].map((v) => ({
                  label: v,
                  value: v
                }))}
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
            { title: '订单号', dataIndex: 'orderNo' },
            { title: '用户ID', dataIndex: 'userId' },
            { title: '昵称', dataIndex: 'nickname' },
            { title: '金额', dataIndex: 'amount' },
            { title: '币种', dataIndex: 'currency' },
            { title: '渠道', dataIndex: 'channel' },
            {
              title: '状态',
              dataIndex: 'status',
              render: (v: string) => <Tag>{v}</Tag>
            },
            { title: '创建时间', dataIndex: 'createdAt', width: 180 },
            {
              title: '操作',
              width: 100,
              render: (_: unknown, row: Record<string, unknown>) => (
                <Button type="text" onClick={() => setCurrent(row)}>
                  处理
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
      <Drawer
        width={420}
        title="订单处理"
        visible={!!current}
        onCancel={() => setCurrent(null)}
        footer={
          <Button
            type="primary"
            onClick={() => {
              Message.success('已提交处理');
              setCurrent(null);
            }}
          >
            确认处理
          </Button>
        }
      >
        {current && (
          <Descriptions
            column={1}
            data={Object.entries(current).map(([label, value]) => ({
              label,
              value: String(value)
            }))}
          />
        )}
      </Drawer>
    </>
  );
}
