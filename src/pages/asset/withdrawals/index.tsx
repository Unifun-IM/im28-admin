import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from '@arco-design/web-react';

import { AssetSecureActionModal, type AssetSecureActionTarget } from '@features/asset-secure-action';
import { AssetWithdrawalDetailDrawer } from '@widgets/asset-withdrawal-detail';
import {
  ActionLinks,
  BizListPage,
  FilterDateRange,
  FilterField,
  FilterInput,
  FilterSelect,
  StatusBadge,
  getTextActionColumnWidth,
  type SummaryItem
} from '@widgets/biz-list';
import { postV1AdminAssetWithdrawalList } from '@shared/api/admin/assets';
import { CopyValue } from '@shared/ui';
import { formatDateTime } from '@shared/lib/formatTime';
import useLocale from '@shared/lib/useLocale';

const FormItem = Form.Item;

type WithdrawalStatus = AdminAPI.AdminAssetWithdrawalOrder['status'];

type WithdrawalForm = {
  user_id?: string;
  currency_code?: 'USDT';
  status?: WithdrawalStatus;
  created_at?: unknown[];
};

const STATUS_VALUES: WithdrawalStatus[] = [
  'pending_review',
  'processing',
  'succeeded',
  'rejected',
  'canceled',
  'failed'
];

const STATUS_TONE: Record<
  WithdrawalStatus,
  'success' | 'error' | 'warning' | 'default'
> = {
  pending_review: 'warning',
  processing: 'warning',
  succeeded: 'success',
  rejected: 'error',
  canceled: 'default',
  failed: 'error'
};

function toRfc3339(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  const raw =
    typeof (value as { toDate?: () => Date }).toDate === 'function'
      ? (value as { toDate: () => Date }).toDate()
      : value;
  const date = raw instanceof Date ? raw : new Date(raw as string | number);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export default function WithdrawalPage() {
  const t = useLocale();
  const [form] = Form.useForm<WithdrawalForm>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.AdminAssetWithdrawalOrder[]>([]);
  const [summaries, setSummaries] = useState<AdminAPI.AdminAssetWithdrawalRecordSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<AssetSecureActionTarget | null>(null);

  const statusOptions = useMemo(
    () =>
      STATUS_VALUES.map((value) => ({
        label: t[`asset.withdrawal.status.${value}`],
        value
      })),
    [t]
  );

  const summaryItems = useMemo<SummaryItem[]>(
    () =>
      summaries.flatMap((summary) => [
        {
          label: `${t['asset.summary.totalCount']} (${summary.currency_code})`,
          value: summary.total_count
        },
        {
          label: `${t['asset.summary.totalAmount']} (${summary.currency_code})`,
          value: summary.total_amount
        },
        {
          label: `${t['asset.summary.succeededCount']} (${summary.currency_code})`,
          value: summary.succeeded_count,
          tone: 'success'
        },
        {
          label: `${t['asset.summary.succeededAmount']} (${summary.currency_code})`,
          value: summary.succeeded_amount,
          tone: 'success'
        }
      ]),
    [summaries, t]
  );

  const fetchData = useCallback(
    async (nextPage = page, nextPageSize = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const range = values.created_at;
        const res = await postV1AdminAssetWithdrawalList({
          user_id: String(values.user_id || '').trim() || undefined,
          currency_code: values.currency_code,
          status: values.status,
          started_at: range?.[0] ? toRfc3339(range[0]) : undefined,
          ended_at: range?.[1] ? toRfc3339(range[1]) : undefined,
          page: nextPage,
          page_size: nextPageSize
        });
        setData(res.data?.list || []);
        setSummaries(res.data?.summaries || []);
        setTotal(res.data?.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [form, page, pageSize]
  );

  useEffect(() => {
    fetchData(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = () => fetchData(page, pageSize);

  return (
    <>
      <BizListPage
        form={form}
        title={t['asset.withdrawal.title']}
        summary={summaryItems}
        filter={
          <>
            <FilterField>
              <FormItem field="user_id" label={t['asset.filter.userId']}>
                <FilterInput placeholder={t['asset.placeholder.userId']} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="currency_code" label={t['asset.filter.currency']}>
                <FilterSelect options={[{ label: 'USDT', value: 'USDT' }]} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="status" label={t['asset.filter.status']}>
                <FilterSelect options={statusOptions} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="created_at" label={t['asset.filter.createdAt']}>
                <FilterDateRange showTime />
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
        onRefresh={refresh}
        tableProps={{
          loading,
          data,
          rowKey: 'withdrawal_id',
          columns: [
            {
              title: t['asset.col.withdrawalId'],
              dataIndex: 'withdrawal_id',
              width: 216,
              render: (value: string) => <CopyValue value={value} />
            },
            {
              title: t['asset.col.userId'],
              dataIndex: 'user_id',
              width: 184,
              render: (value: string) => <CopyValue value={value} />
            },
            {
              title: t['asset.col.amount'],
              dataIndex: 'amount',
              width: 120
            },
            {
              title: t['asset.col.feeAmount'],
              dataIndex: 'fee_amount',
              width: 104
            },
            {
              title: t['asset.col.actualAmount'],
              dataIndex: 'actual_amount',
              width: 120
            },
            {
              title: t['asset.col.currency'],
              dataIndex: 'currency_code',
              width: 88
            },
            {
              title: t['asset.col.network'],
              dataIndex: 'network_code',
              width: 96
            },
            {
              title: t['asset.col.address'],
              dataIndex: 'address',
              width: 264,
              render: (value: string) => <CopyValue value={value} />
            },
            {
              title: t['asset.col.status'],
              dataIndex: 'status',
              width: 120,
              render: (value: WithdrawalStatus) => (
                <StatusBadge
                  status={STATUS_TONE[value]}
                  text={t[`asset.withdrawal.status.${value}`]}
                />
              )
            },
            {
              title: t['asset.col.txHash'],
              dataIndex: 'tx_hash',
              width: 240,
              render: (value: string) => <CopyValue value={value} />
            },
            {
              title: t['asset.col.createdAt'],
              dataIndex: 'created_at',
              width: 184,
              render: (value: string) => formatDateTime(value)
            },
            {
              title: t['asset.col.updatedAt'],
              dataIndex: 'updated_at',
              width: 184,
              render: (value: string) => formatDateTime(value)
            },
            {
              title: t['common.action'],
              dataIndex: 'op',
              width: getTextActionColumnWidth(
                [t['common.detail'], t['asset.action.review']],
                t['common.action']
              ),
              render: (_: unknown, row: AdminAPI.AdminAssetWithdrawalOrder) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'detail',
                      label: t['common.detail'],
                      onClick: () => setDetailId(row.withdrawal_id)
                    },
                    ...(row.status === 'pending_review'
                      ? [
                          {
                            key: 'review',
                            label: t['asset.action.review'],
                            onClick: () =>
                              setActionTarget({
                                mode: 'reviewWithdrawal' as const,
                                withdrawal: row
                              })
                          }
                        ]
                      : [])
                  ]}
                />
              )
            }
          ],
          pagination: {
            current: page,
            pageSize,
            total,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
              fetchData(nextPage, nextPageSize);
            }
          }
        }}
      />

      <AssetWithdrawalDetailDrawer
        visible={Boolean(detailId)}
        withdrawalId={detailId}
        onClose={() => setDetailId(null)}
      />

      <AssetSecureActionModal
        target={actionTarget}
        onCancel={() => setActionTarget(null)}
        onSuccess={() => {
          setActionTarget(null);
          refresh();
        }}
      />
    </>
  );
}
