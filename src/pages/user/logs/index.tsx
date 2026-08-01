import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from '@arco-design/web-react';
import {
  ActionLinks,
  AvatarNameCell,
  BizListPage,
  FilterDateRange,
  FilterField,
  FilterKeywordInput,
  FilterSelect
} from '@widgets/biz-list';
import { postV1AdminUsersOperationLogsList } from '@shared/api/admin/users';
import { UserDetailDrawer } from '@features/user-detail';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

type LogsFormValues = AdminAPI.AdminListUserOperationLogRequest & {
  operated_range?: unknown[];
};

function toRfc3339(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  const raw =
    typeof (value as { toDate?: () => Date }).toDate === 'function'
      ? (value as { toDate: () => Date }).toDate()
      : value;
  const d = raw instanceof Date ? raw : new Date(raw as string | number);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

const BEHAVIOR_TYPES = [
  'register',
  'login',
  'login_failed',
  'logout',
  'update_avatar',
  'update_profile',
  'send_message'
] as const;

const CLIENT_TYPES = ['ios', 'android', 'web', 'server'] as const;

/** 用户操作日志 — AdminListUserOperationLogRequest / AdminUserOperationLogWrap */
export default function Page() {
  const t = useLocale();
  const common = t;

  const keywordTypeOptions = useMemo(
    () =>
      (
        [
          'user_id',
          'phone',
          'email',
          'account',
          'nickname'
        ] as const
      ).map((value) => ({
        label: t[`userLogs.keywordType.${value}`],
        value
      })),
    [t]
  );

  const behaviorOptions = useMemo(
    () =>
      BEHAVIOR_TYPES.map((value) => ({
        label: t[`userLogs.behavior.${value}`] || value,
        value
      })),
    [t]
  );

  const clientOptions = useMemo(
    () =>
      CLIENT_TYPES.map((value) => ({
        label: t[`userLogs.client.${value}`],
        value
      })),
    [t]
  );

  const [form] = Form.useForm<LogsFormValues>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.AdminUserOperationLogWrap[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const buildBody = useCallback(
    (p: number, size: number): AdminAPI.AdminListUserOperationLogRequest => {
      const values = form.getFieldsValue();
      const keyword = (values.keyword || '').trim() || undefined;
      const range = values.operated_range;
      const start = Array.isArray(range) ? toRfc3339(range[0]) : undefined;
      const end = Array.isArray(range) ? toRfc3339(range[1]) : undefined;
      return {
        page: p,
        page_size: size,
        keyword,
        keyword_type: keyword ? values.keyword_type || undefined : undefined,
        behavior_type: values.behavior_type || undefined,
        client_type: values.client_type || undefined,
        operated_start_at: start,
        operated_end_at: end,
        sort_order: values.sort_order || undefined
      };
    },
    [form]
  );

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const res = await postV1AdminUsersOperationLogsList(buildBody(p, size));
        setData(res.data?.list || []);
        setTotal(res.data?.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [buildBody, page, pageSize]
  );

  useEffect(() => {
    fetchData(1, pageSize);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusLabel = (status?: AdminAPI.AdminUserOperationLog['status']) => {
    if (status === 'success') return t['userLogs.status.success'];
    if (status === 'failed') return t['userLogs.status.failed'];
    return status || '--';
  };

  return (
    <>
      <BizListPage
        form={form}
        title={t['userLogs.title']}
        filter={
          <>
            <FilterField>
              <FormItem field="keyword" label={common['common.keyword']}>
                <FilterKeywordInput
                  typeField="keyword_type"
                  typeOptions={keywordTypeOptions}
                  typeInitialValue="user_id"
                  typeWidth={100}
                  placeholder={common['common.placeholder']}
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem
                field="behavior_type"
                label={t['userLogs.filter.behaviorType']}
              >
                <FilterSelect
                  allowClear
                  placeholder={t['userLogs.filter.all']}
                  options={behaviorOptions}
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem
                field="client_type"
                label={t['userLogs.filter.clientType']}
              >
                <FilterSelect
                  allowClear
                  placeholder={t['userLogs.filter.all']}
                  options={clientOptions}
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem
                field="operated_range"
                label={t['userLogs.filter.operatedAt']}
              >
                <FilterDateRange showTime />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem
                field="sort_order"
                label={t['userLogs.filter.sortOrder']}
                initialValue="desc"
              >
                <FilterSelect
                  options={[
                    { label: t['userLogs.sort.desc'], value: 'desc' },
                    { label: t['userLogs.sort.asc'], value: 'asc' }
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
          form.setFieldsValue({ sort_order: 'desc' });
          setPage(1);
          fetchData(1, pageSize);
        }}
        onRefresh={() => fetchData(page, pageSize)}
        tableProps={{
          loading,
          data,
          rowKey: (record: AdminAPI.AdminUserOperationLogWrap, index?: number) =>
            record.log?.log_id || String(index),
          columns: [
            {
              title: t['userLogs.col.user'],
              dataIndex: 'user',
              width: 200,
              render: (_: unknown, record: AdminAPI.AdminUserOperationLogWrap) => {
                const user = record.user;
                if (!user?.user_id) return '--';
                return (
                  <AvatarNameCell
                    avatar={user.avatar_url}
                    name={user.nickname || user.account || user.user_id}
                    sub={`${t['userLogs.cell.userId']}：${user.user_id}`}
                    copyText={user.user_id}
                  />
                );
              }
            },
            {
              title: t['userLogs.col.operatedAt'],
              dataIndex: 'log.operated_at',
              width: 180,
              render: (_: unknown, record: AdminAPI.AdminUserOperationLogWrap) =>
                formatDateTime(record.log?.operated_at)
            },
            {
              title: t['userLogs.col.behaviorType'],
              dataIndex: 'log.behavior_type',
              width: 140,
              render: (_: unknown, record: AdminAPI.AdminUserOperationLogWrap) => {
                const type = record.log?.behavior_type;
                if (!type) return '--';
                return t[`userLogs.behavior.${type}`] || type;
              }
            },
            {
              title: t['userLogs.col.behaviorCategory'],
              dataIndex: 'log.behavior_category',
              width: 140,
              render: (_: unknown, record: AdminAPI.AdminUserOperationLogWrap) =>
                record.log?.behavior_category || '--'
            },
            {
              title: t['userLogs.col.status'],
              dataIndex: 'log.status',
              width: 100,
              render: (_: unknown, record: AdminAPI.AdminUserOperationLogWrap) =>
                statusLabel(record.log?.status)
            },
            {
              title: t['userLogs.col.client'],
              dataIndex: 'log.client',
              width: 160,
              render: (_: unknown, record: AdminAPI.AdminUserOperationLogWrap) => {
                const client = record.log?.client;
                if (!client?.type) return '--';
                const label =
                  t[`userLogs.client.${client.type}`] || client.type;
                return client.version
                  ? `${label} ${client.version}`
                  : label;
              }
            },
            {
              title: t['userLogs.col.location'],
              dataIndex: 'log.location',
              width: 180,
              render: (_: unknown, record: AdminAPI.AdminUserOperationLogWrap) => {
                const loc = record.log?.location;
                if (!loc?.ip && !loc?.region) return '--';
                return [loc.region, loc.ip].filter(Boolean).join(' / ');
              }
            },
            {
              title: t['userLogs.col.remark'],
              dataIndex: 'log.remark',
              ellipsis: true,
              render: (_: unknown, record: AdminAPI.AdminUserOperationLogWrap) =>
                record.log?.remark || '--'
            },
            {
              title: common['common.action'],
              dataIndex: 'action',
              width: 100,
              fixed: 'right' as const,
              render: (_: unknown, record: AdminAPI.AdminUserOperationLogWrap) => {
                const uid = record.user?.user_id;
                if (!uid) return null;
                return (
                  <ActionLinks
                    variant="text"
                    items={[
                      {
                        key: 'detail',
                        label: t['userLogs.action.openUserDetail'],
                        onClick: () => setDetailUserId(uid)
                      }
                    ]}
                  />
                );
              }
            }
          ],
          pagination: {
            current: page,
            pageSize,
            total,
            showTotal: true,
            sizeCanChange: true,
            onChange: (p: number, size: number) => {
              setPage(p);
              setPageSize(size);
              fetchData(p, size);
            }
          }
        }}
      />
      <UserDetailDrawer
        visible={!!detailUserId}
        userId={detailUserId}
        defaultTab="logs"
        onClose={() => setDetailUserId(null)}
      />
    </>
  );
}
