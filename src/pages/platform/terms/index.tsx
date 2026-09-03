import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form } from '@arco-design/web-react';

import { PlatformTermFormModal } from '@features/platform-term-form';
import { PlatformTermDetailDrawer } from '@widgets/platform-term-detail';
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
import { postV1AdminTermsList } from '@shared/api/admin/platform';
import { formatDateTime } from '@shared/lib/formatTime';
import useLocale from '@shared/lib/useLocale';

const FormItem = Form.Item;

type PlatformTermFilter = {
  key?: string;
  enabled?: 'true' | 'false';
};

export default function PlatformTermsPage() {
  const t = useLocale();
  const [form] = Form.useForm<PlatformTermFilter>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.PlatformTerm[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editing, setEditing] =
    useState<AdminAPI.PlatformTerm | 'create' | null>(null);

  const fetchData = useCallback(
    async (nextPage = page, nextPageSize = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await postV1AdminTermsList({
          key: String(values.key || '').trim() || undefined,
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
        title={t['platform.term.title']}
        filter={
          <>
            <FilterField>
              <FormItem field="key" label={t['platform.term.field.key']}>
                <FilterInput placeholder={t['platform.placeholder.termKey']} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="enabled" label={t['platform.term.field.enabled']}>
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
            {t['platform.term.create']}
          </Button>
        }
        tableProps={{
          loading,
          data,
          rowKey: (row) => String(row.id),
          columns: [
            {
              title: t['platform.term.field.identity'],
              width: 224,
              ellipsis: false,
              render: (_: unknown, row: AdminAPI.PlatformTerm) => (
                <DoubleLineCell
                  primary={row.title || '--'}
                  secondary={`${row.key || '--'} · ID: ${row.id || '--'}`}
                />
              )
            },
            {
              title: t['platform.term.field.content'],
              dataIndex: 'content',
              width: 360,
              render: (value: string) => value || '--'
            },
            {
              title: t['platform.term.field.version'],
              dataIndex: 'version',
              width: 112
            },
            {
              title: t['platform.term.field.enabled'],
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
              title: t['platform.term.field.createdAt'],
              dataIndex: 'created_at',
              width: 184,
              render: (value: string) => formatDateTime(value)
            },
            {
              title: t['platform.term.field.updatedAt'],
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
              render: (_: unknown, row: AdminAPI.PlatformTerm) => (
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

      <PlatformTermDetailDrawer
        visible={Boolean(detailId)}
        id={detailId}
        onClose={() => setDetailId(null)}
      />

      <PlatformTermFormModal
        visible={Boolean(editing)}
        term={editing === 'create' ? null : editing}
        onCancel={() => setEditing(null)}
        onSuccess={() => {
          setEditing(null);
          refresh();
        }}
      />
    </>
  );
}
