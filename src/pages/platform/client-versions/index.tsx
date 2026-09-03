import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form } from '@arco-design/web-react';

import { ClientVersionFormModal } from '@features/client-version-form';
import { ClientVersionDetailDrawer } from '@widgets/client-version-detail';
import {
  ActionLinks,
  BizListPage,
  DoubleLineCell,
  FilterField,
  FilterInput,
  StatusBadge,
  getTextActionColumnWidth
} from '@widgets/biz-list';
import { postV1AdminClientVersionsList } from '@shared/api/admin/platform';
import { formatDateTime } from '@shared/lib/formatTime';
import useLocale from '@shared/lib/useLocale';

const FormItem = Form.Item;

type ClientVersionFilter = {
  platform?: string;
};

export default function ClientVersionsPage() {
  const t = useLocale();
  const [form] = Form.useForm<ClientVersionFilter>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.ClientVersion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editing, setEditing] =
    useState<AdminAPI.ClientVersion | 'create' | null>(null);

  const fetchData = useCallback(
    async (nextPage = page, nextPageSize = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await postV1AdminClientVersionsList({
          platform: String(values.platform || '').trim() || undefined,
          page: nextPage,
          page_size: nextPageSize
        });
        const list = (res.data?.list || [])
          .map((item) => item.client_version)
          .filter((item): item is AdminAPI.ClientVersion => Boolean(item));
        setData(list);
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
        title={t['platform.clientVersion.title']}
        filter={
          <FilterField>
            <FormItem
              field="platform"
              label={t['platform.clientVersion.field.platform']}
            >
              <FilterInput placeholder={t['platform.placeholder.platform']} />
            </FormItem>
          </FilterField>
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
            {t['platform.clientVersion.create']}
          </Button>
        }
        tableProps={{
          loading,
          data,
          rowKey: (row) => String(row.id),
          columns: [
            {
              title: t['platform.clientVersion.field.identity'],
              width: 176,
              ellipsis: false,
              render: (_: unknown, row: AdminAPI.ClientVersion) => (
                <DoubleLineCell
                  primary={row.version || '--'}
                  secondary={`${t['platform.clientVersion.field.id']}: ${row.id || '--'}`}
                />
              )
            },
            {
              title: t['platform.clientVersion.field.platform'],
              dataIndex: 'platform',
              width: 128
            },
            {
              title: t['platform.clientVersion.field.buildNumber'],
              dataIndex: 'build_number',
              width: 112
            },
            {
              title: t['platform.clientVersion.field.forceUpdate'],
              dataIndex: 'force_update',
              width: 112,
              ellipsis: false,
              render: (value: boolean) => (
                <StatusBadge
                  status={value ? 'warning' : 'default'}
                  text={
                    value
                      ? t['platform.clientVersion.force.required']
                      : t['platform.clientVersion.force.optional']
                  }
                />
              )
            },
            {
              title: t['platform.clientVersion.field.downloadUrl'],
              dataIndex: 'download_url',
              width: 220,
              render: (value: string) => value || '--'
            },
            {
              title: t['platform.clientVersion.field.title'],
              dataIndex: 'title',
              width: 176,
              render: (value: string) => value || '--'
            },
            {
              title: t['platform.clientVersion.field.description'],
              dataIndex: 'description',
              width: 240,
              render: (value: string) => value || '--'
            },
            {
              title: t['platform.clientVersion.field.enabled'],
              dataIndex: 'is_enable',
              width: 104,
              ellipsis: false,
              render: (value: boolean) => (
                <StatusBadge
                  status={value ? 'success' : 'default'}
                  text={value ? t['common.enabled'] : t['common.disabled']}
                />
              )
            },
            {
              title: t['platform.clientVersion.field.createdAt'],
              dataIndex: 'created_at',
              width: 184,
              render: (value: string) => formatDateTime(value)
            },
            {
              title: t['platform.clientVersion.field.updatedAt'],
              dataIndex: 'updated_at',
              width: 184,
              render: (value: string) => formatDateTime(value)
            },
            {
              title: t['common.action'],
              dataIndex: 'op',
              width: getTextActionColumnWidth(
                [t['common.detail'], t['common.edit']],
                t['common.action']
              ),
              render: (_: unknown, row: AdminAPI.ClientVersion) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'detail',
                      label: t['common.detail'],
                      onClick: () => setDetailId(row.id || null)
                    },
                    {
                      key: 'edit',
                      label: t['common.edit'],
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

      <ClientVersionDetailDrawer
        visible={Boolean(detailId)}
        id={detailId}
        onClose={() => setDetailId(null)}
      />

      <ClientVersionFormModal
        visible={Boolean(editing)}
        clientVersion={editing === 'create' ? null : editing}
        onCancel={() => setEditing(null)}
        onSuccess={() => {
          setEditing(null);
          refresh();
        }}
      />
    </>
  );
}
