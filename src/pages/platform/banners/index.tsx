import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Image } from '@arco-design/web-react';

import { BannerFormModal } from '@features/banner-form';
import { BannerDetailDrawer } from '@widgets/banner-detail';
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
import { postV1AdminBannersList } from '@shared/api/admin/platform';
import { formatDateTime } from '@shared/lib/formatTime';
import useLocale from '@shared/lib/useLocale';

const FormItem = Form.Item;

type BannerForm = {
  type?: AdminAPI.ListBannerRequest['type'];
  platform?: AdminAPI.ListBannerRequest['platform'];
  language?: string;
  enabled?: 'true' | 'false';
};

export default function BannerPage() {
  const t = useLocale();
  const [form] = Form.useForm<BannerForm>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.Banner[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminAPI.Banner | 'create' | null>(null);

  const typeOptions = useMemo(
    () =>
      (['asset_profile', 'asset_ledger_detail'] as const).map((value) => ({
        label: t[`asset.banner.type.${value}`],
        value
      })),
    [t]
  );
  const platformOptions = useMemo(
    () =>
      (['app', 'pc', 'h5'] as const).map((value) => ({
        label: t[`asset.banner.platform.${value}`],
        value
      })),
    [t]
  );

  const fetchData = useCallback(
    async (nextPage = page, nextPageSize = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await postV1AdminBannersList({
          type: values.type,
          platform: values.platform,
          language: String(values.language || '').trim() || undefined,
          is_enable:
            values.enabled == null ? undefined : values.enabled === 'true',
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
        title={t['asset.banner.title']}
        filter={
          <>
            <FilterField>
              <FormItem field="type" label={t['asset.banner.field.type']}>
                <FilterSelect options={typeOptions} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="platform" label={t['asset.banner.field.platform']}>
                <FilterSelect options={platformOptions} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="language" label={t['asset.banner.field.language']}>
                <FilterInput placeholder={t['asset.banner.placeholder.language']} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="enabled" label={t['asset.banner.field.enabled']}>
                <FilterSelect
                  options={[
                    { label: t['common.enabled'], value: 'true' },
                    { label: t['common.disabled'], value: 'false' }
                  ]}
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
        onRefresh={refresh}
        toolbarAlways={
          <Button type="primary" onClick={() => setEditing('create')}>
            {t['asset.banner.create']}
          </Button>
        }
        tableProps={{
          loading,
          data,
          rowKey: 'banner_id',
          columns: [
            {
              title: t['asset.banner.field.image'],
              dataIndex: 'image_url',
              width: 128,
              render: (value: string) => (
                <Image
                  src={value}
                  width={96}
                  height={48}
                  className="[&_.arco-image-img]:object-cover"
                  alt=""
                />
              )
            },
            {
              title: t['asset.banner.field.title'],
              width: 220,
              ellipsis: false,
              render: (_: unknown, row: AdminAPI.Banner) => (
                <DoubleLineCell
                  primary={row.title || '--'}
                  secondary={`${t['asset.banner.field.bannerId']}: ${row.banner_id}`}
                />
              )
            },
            {
              title: t['asset.banner.field.type'],
              dataIndex: 'type',
              width: 152,
              render: (value: AdminAPI.Banner['type']) => t[`asset.banner.type.${value}`]
            },
            {
              title: t['asset.banner.field.platforms'],
              dataIndex: 'platforms',
              width: 144,
              render: (values: AdminAPI.Banner['platforms']) =>
                values.map((value) => t[`asset.banner.platform.${value}`]).join(' / ')
            },
            {
              title: t['asset.banner.field.language'],
              dataIndex: 'language',
              width: 104
            },
            {
              title: t['asset.banner.field.actionType'],
              dataIndex: 'action_type',
              width: 136,
              render: (value: AdminAPI.Banner['action_type']) =>
                t[`asset.banner.actionType.${value}`]
            },
            {
              title: t['asset.banner.field.actionValue'],
              dataIndex: 'action_value',
              width: 220,
              render: (value: string) => value || '--'
            },
            {
              title: t['asset.banner.field.sort'],
              dataIndex: 'sort',
              width: 80
            },
            {
              title: t['asset.banner.field.enabled'],
              dataIndex: 'is_enable',
              width: 104,
              render: (value: boolean) => (
                <StatusBadge
                  status={value ? 'success' : 'default'}
                  text={value ? t['common.enabled'] : t['common.disabled']}
                />
              )
            },
            {
              title: t['asset.banner.field.startsAt'],
              dataIndex: 'starts_at',
              width: 184,
              render: (value: string) => formatDateTime(value)
            },
            {
              title: t['asset.banner.field.endsAt'],
              dataIndex: 'ends_at',
              width: 184,
              render: (value: string) => formatDateTime(value)
            },
            {
              title: t['common.action'],
              dataIndex: 'op',
              width: getTextActionColumnWidth(
                [t['common.detail'], t['asset.banner.edit']],
                t['common.action']
              ),
              render: (_: unknown, row: AdminAPI.Banner) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'detail',
                      label: t['common.detail'],
                      onClick: () => setDetailId(row.id)
                    },
                    {
                      key: 'edit',
                      label: t['asset.banner.edit'],
                      onClick: () => setEditing(row)
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

      <BannerDetailDrawer
        visible={Boolean(detailId)}
        id={detailId}
        onClose={() => setDetailId(null)}
      />

      <BannerFormModal
        visible={Boolean(editing)}
        banner={editing === 'create' ? null : editing}
        onCancel={() => setEditing(null)}
        onSuccess={() => {
          setEditing(null);
          refresh();
        }}
      />
    </>
  );
}
