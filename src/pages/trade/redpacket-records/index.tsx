import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Select, Button, Tag } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import { BizListPage } from '@widgets/biz-list';
import { getRedpacketRecords } from '@shared/api/biz';

const FormItem = Form.Item;

export default function RedpacketRecordsPage() {
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
        const res = await getRedpacketRecords({ page: p, pageSize: size, ...values });
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
          <FormItem field="keyword" label="关键词">
            <Input placeholder="红包号 / 用户ID" />
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
          <FormItem field="type" label="红包类型">
            <Select
              allowClear
              placeholder="全部"
              options={[
                { label: '拼手气', value: '拼手气' },
                { label: '等额', value: '等额' }
              ]}
            />
          </FormItem>
          <FormItem field="status" label="状态">
            <Select
              allowClear
              placeholder="全部"
              options={['未开始', '进行中', '已结束', '已过期', '已退回'].map((v) => ({
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
          { title: '红包号', dataIndex: 'packetNo' },
          { title: '发送者', dataIndex: 'senderName' },
          { title: '类型', dataIndex: 'type' },
          { title: '币种', dataIndex: 'currency' },
          { title: '总额', dataIndex: 'totalAmount' },
          {
            title: '领取',
            render: (_: unknown, r: Record<string, unknown>) =>
              `${r.claimed}/${r.count}`
          },
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
              <Button
                type="text"
                onClick={() => navigate(`/trade/redpacket-detail/${row.id}`)}
              >
                详情
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
