import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from '@arco-design/web-react';

import { AssetSecureActionModal, type AssetSecureActionTarget } from '@features/asset-secure-action';
import { BizDetailDrawer } from '@widgets/biz-detail-drawer';
import {
  ActionLinks,
  BizListPage,
  DoubleLineCell,
  FilterField,
  FilterInput,
  FilterSelect,
  StatusBadge,
  getTextActionColumnWidth
} from '@widgets/biz-list';
import { postV1AdminAssetDepositAddressList } from '@shared/api/admin/assets';
import { CopyValue } from '@shared/ui';
import { formatDateTime } from '@shared/lib/formatTime';
import useLocale from '@shared/lib/useLocale';

const FormItem = Form.Item;

type DepositAddressForm = {
  user_id?: string;
  wallet_id?: string;
  currency_code?: 'USDT';
  network_code?: 'TRC20';
  status?: 'active' | 'unavailable';
};

export default function DepositAddressPage() {
  const t = useLocale();
  const [form] = Form.useForm<DepositAddressForm>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.AdminAssetDepositAddress[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detail, setDetail] = useState<AdminAPI.AdminAssetDepositAddress | null>(null);
  const [actionTarget, setActionTarget] = useState<AssetSecureActionTarget | null>(null);

  const statusOptions = useMemo(
    () => [
      { label: t['asset.status.active'], value: 'active' },
      { label: t['asset.status.unavailable'], value: 'unavailable' }
    ],
    [t]
  );

  const fetchData = useCallback(
    async (nextPage = page, nextPageSize = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await postV1AdminAssetDepositAddressList({
          user_id: String(values.user_id || '').trim() || undefined,
          wallet_id: String(values.wallet_id || '').trim() || undefined,
          currency_code: values.currency_code,
          network_code: values.network_code,
          status: values.status,
          page: nextPage,
          page_size: nextPageSize
        });
        setData(res.data?.list || []);
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
        title={t['asset.deposit.title']}
        filter={
          <>
            <FilterField>
              <FormItem field="user_id" label={t['asset.filter.userId']}>
                <FilterInput placeholder={t['asset.placeholder.userId']} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="wallet_id" label={t['asset.filter.walletId']}>
                <FilterInput placeholder={t['asset.placeholder.walletId']} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="currency_code" label={t['asset.filter.currency']}>
                <FilterSelect options={[{ label: 'USDT', value: 'USDT' }]} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="network_code" label={t['asset.filter.network']}>
                <FilterSelect options={[{ label: 'TRC20', value: 'TRC20' }]} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="status" label={t['asset.filter.status']}>
                <FilterSelect options={statusOptions} />
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
          rowKey: 'address_id',
          columns: [
            {
              title: t['asset.col.address'],
              dataIndex: 'address',
              width: 320,
              render: (
                _: string,
                row: AdminAPI.AdminAssetDepositAddress
              ) => (
                <DoubleLineCell
                  primary={row.address}
                  secondary={row.address_id}
                  copyPrimary
                  copySecondary
                />
              )
            },
            {
              title: t['asset.col.userId'],
              dataIndex: 'user_id',
              width: 184,
              render: (value: string) => <CopyValue value={value} truncate />
            },
            {
              title: t['asset.col.walletId'],
              dataIndex: 'wallet_id',
              width: 184,
              render: (value: string) => <CopyValue value={value} truncate />
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
              title: t['asset.col.memo'],
              dataIndex: 'memo',
              width: 136,
              render: (value: string) => value || '--'
            },
            {
              title: t['asset.col.status'],
              dataIndex: 'status',
              width: 104,
              render: (value: AdminAPI.AdminAssetDepositAddress['status']) => (
                <StatusBadge
                  status={value === 'active' ? 'success' : 'default'}
                  text={t[`asset.status.${value}`]}
                />
              )
            },
            {
              title: t['asset.col.reason'],
              dataIndex: 'unavailable_reason',
              width: 200,
              render: (value: string) => value || '--'
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
                [
                  t['common.detail'],
                  t['asset.action.replace'],
                  [t['asset.action.enable'], t['asset.action.disable']]
                ],
                t['common.action']
              ),
              render: (_: unknown, row: AdminAPI.AdminAssetDepositAddress) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'detail',
                      label: t['common.detail'],
                      onClick: () => setDetail(row)
                    },
                    {
                      key: 'replace',
                      label: t['asset.action.replace'],
                      onClick: () =>
                        setActionTarget({ mode: 'replaceAddress', address: row })
                    },
                    {
                      key: 'status',
                      label:
                        row.status === 'active'
                          ? t['asset.action.disable']
                          : t['asset.action.enable'],
                      danger: row.status === 'active',
                      onClick: () =>
                        setActionTarget({
                          mode: 'updateAddressStatus',
                          address: row,
                          nextStatus:
                            row.status === 'active' ? 'unavailable' : 'active'
                        })
                    }
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

      <BizDetailDrawer
        visible={Boolean(detail)}
        title={t['asset.detail.depositTitle']}
        onCancel={() => setDetail(null)}
        fields={
          detail
            ? [
                { label: t['asset.col.address'], value: <CopyValue value={detail.address} />, span: 2 },
                { label: t['asset.col.addressId'], value: <CopyValue value={detail.address_id} /> },
                { label: t['asset.col.userId'], value: <CopyValue value={detail.user_id} /> },
                { label: t['asset.col.walletId'], value: <CopyValue value={detail.wallet_id} /> },
                { label: t['asset.col.currency'], value: detail.currency_code },
                { label: t['asset.col.network'], value: detail.network_code },
                { label: t['asset.col.memo'], value: detail.memo },
                {
                  label: t['asset.col.status'],
                  value: (
                    <StatusBadge
                      status={detail.status === 'active' ? 'success' : 'default'}
                      text={t[`asset.status.${detail.status}`]}
                    />
                  )
                },
                { label: t['asset.col.reason'], value: detail.unavailable_reason, span: 2 },
                { label: t['asset.col.createdAt'], value: formatDateTime(detail.created_at) },
                { label: t['asset.col.updatedAt'], value: formatDateTime(detail.updated_at) }
              ]
            : []
        }
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
