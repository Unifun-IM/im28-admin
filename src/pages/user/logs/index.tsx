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
import { UserDetailDrawer } from '@widgets/user-detail';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

type LogsFormValues = {
  keyword?: string;
  keyword_type?: AdminAPI.AdminListUserOperationLogRequest['keyword_type'];
  behavior_type?: string;
  client_type?: AdminAPI.AdminListUserOperationLogRequest['client_type'];
  operated_range?: unknown[];
  sort_order?: AdminAPI.AdminListUserOperationLogRequest['sort_order'];
};

/** OpenAPI 示例行为类型；筛选传 behavior_type 机器标识 */
const BEHAVIOR_TYPES = [
  'registered',
  'logged_in',
  'profile_updated',
  'friend_applied',
  'message_sent',
  'group_created',
  'call_started'
] as const;

const CLIENT_TYPES = [
  'app',
  'pc',
  'h5'
] as const;

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

/**
 * 用户操作日志 — AdminListUserOperationLogRequest / AdminUserOperationLogWrap
 * @see postV1AdminUsersOperationLogsList
 */
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

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const keyword = values.keyword?.trim() || undefined;
        const range = values.operated_range;
        const res = await postV1AdminUsersOperationLogsList({
          page: p,
          page_size: size,
          keyword,
          keyword_type: keyword
            ? values.keyword_type || undefined
            : undefined,
          behavior_type: values.behavior_type || undefined,
          client_type: values.client_type || undefined,
          operated_start_at: range?.[0] ? toRfc3339(range[0]) : undefined,
          operated_end_at: range?.[1] ? toRfc3339(range[1]) : undefined,
          sort_order: values.sort_order || 'desc'
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
        filterCollapsible={false}
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
              ellipsis: false,
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
              render: (_: unknown, record: AdminAPI.AdminUserOperationLogWrap) => {
                const category = record.log?.behavior_category;
                if (!category) return '--';
                return t[`userLogs.category.${category}`] || category;
              }
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
