import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Tag } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import {
  BizListPage,
  FilterField,
  FilterInput,
  FilterSelect
} from '@widgets/biz-list';
import useLocale from '@shared/lib/useLocale';

const FormItem = Form.Item;

/**
 * 红包记录 — Admin OpenAPI 暂无契约：保留筛选 / 表格交互，列表为空
 */
export default function RedpacketRecordsPage() {
  const t = useLocale();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const currencyOptions = useMemo(
    () => [
      { label: 'CNY', value: 'CNY' },
      { label: 'USDT', value: 'USDT' }
    ],
    []
  );

  const typeOptions = useMemo(
    () => [
      { label: t['redpacket.type.lucky'], value: 'lucky' },
      { label: t['redpacket.type.equal'], value: 'equal' }
    ],
    [t]
  );

  const statusOptions = useMemo(
    () =>
      (
        ['pending', 'active', 'finished', 'expired', 'refunded'] as const
      ).map((value) => ({
        label: t[`redpacket.status.${value}`],
        value
      })),
    [t]
  );

  const fetchData = useCallback(async (p = page, size = pageSize) => {
    void p;
    void size;
    setLoading(true);
    try {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BizListPage
      form={form}
      title={t['redpacket.records.title']}
      filterResetText={t['common.clearAll']}
      filter={
        <>
          <FilterField>
            <FormItem field="keyword" label={t['redpacket.filter.keyword']}>
              <FilterInput
                placeholder={t['redpacket.filter.keywordPlaceholder']}
                showSearchIcon
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="currency" label={t['redpacket.filter.currency']}>
              <FilterSelect
                allowClear
                placeholder={t['common.all']}
                options={currencyOptions}
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="type" label={t['redpacket.filter.type']}>
              <FilterSelect
                allowClear
                placeholder={t['common.all']}
                options={typeOptions}
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="status" label={t['redpacket.filter.status']}>
              <FilterSelect
                allowClear
                placeholder={t['common.all']}
                options={statusOptions}
              />
            </FormItem>
          </FilterField>
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
        rowKey: 'id',
        columns: [
          { title: t['redpacket.col.packetNo'], dataIndex: 'packetNo' },
          { title: t['redpacket.col.sender'], dataIndex: 'senderName' },
          { title: t['redpacket.col.type'], dataIndex: 'type' },
          { title: t['redpacket.col.currency'], dataIndex: 'currency' },
          { title: t['redpacket.col.totalAmount'], dataIndex: 'totalAmount' },
          {
            title: t['redpacket.col.claim'],
            render: (_: unknown, r: Record<string, unknown>) =>
              `${r.claimed ?? 0}/${r.count ?? 0}`
          },
          {
            title: t['redpacket.col.status'],
            dataIndex: 'status',
            render: (v: string) => <Tag>{v || '--'}</Tag>
          },
          {
            title: t['redpacket.col.createdAt'],
            dataIndex: 'createdAt',
            width: 180
          },
          {
            title: t['common.action'],
            width: 100,
            render: (_: unknown, row: Record<string, unknown>) => (
              <Button
                type="text"
                onClick={() => navigate(`/trade/redpacket-detail/${row.id}`)}
              >
                {t['common.detail']}
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
