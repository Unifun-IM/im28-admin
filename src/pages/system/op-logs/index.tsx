import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from '@arco-design/web-react';
import { observer } from 'mobx-react-lite';
import {
  BizListPage,
  FilterDateRange,
  FilterField,
  FilterInput,
  FilterSelect
} from '@widgets/biz-list';
import { postV1AdminSystemOperationLogsList } from '@shared/api/admin/adminxitongcaozuorizhi';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

type OpLogsForm = {
  operator_account?: string;
  operation_type?: AdminAPI.AdminListSystemOperationLogRequest['operation_type'] | '';
  ip_address?: string;
  operation_path?: string;
  content_keyword?: string;
  timeRange?: unknown[];
};

const OPERATION_TYPES: NonNullable<
  AdminAPI.AdminListSystemOperationLogRequest['operation_type']
>[] = [
  'login_security',
  'system_user_management',
  'role_management',
  'user_query',
  'user_ban',
  'whitelist_management',
  'group_query',
  'message_query',
  'system_setting',
  'operation_log_query',
  'permission_security',
  'access_record'
];

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
 * 系统操作日志 — Figma 793:38382
 * @see postV1AdminSystemOperationLogsList
 */
export function OpLogsPage() {
  const t = useLocale();
  const [form] = Form.useForm<OpLogsForm>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.AdminSystemOperationLogWrap[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const actionOptions = useMemo(
    () => [
      { label: t['common.all'], value: '' },
      ...OPERATION_TYPES.map((value) => ({
        label: t[`opLogs.action.${value}`] || value,
        value
      }))
    ],
    [t]
  );

  const pathOptions = useMemo(
    () => [
      { label: t['common.all'], value: '' },
      { label: t['opLogs.path.userQuery'], value: 'user/query' },
      { label: t['opLogs.path.accounts'], value: 'system/accounts' },
      { label: t['opLogs.path.roles'], value: 'system/roles' },
      { label: t['opLogs.path.systemParams'], value: 'system-params/settings' },
      { label: t['opLogs.path.opLogs'], value: 'system/op-logs' },
      { label: t['opLogs.path.whitelist'], value: 'user/whitelist' },
      { label: t['opLogs.path.blacklist'], value: 'user/blacklist' },
      { label: t['opLogs.path.groupQuery'], value: 'group/query' },
      { label: t['opLogs.path.sessionGroup'], value: 'session/group' },
      { label: t['opLogs.path.sessionUser'], value: 'session/user' }
    ],
    [t]
  );

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const range = values.timeRange;
        const res = await postV1AdminSystemOperationLogsList({
          page: p,
          page_size: size,
          operator_account: values.operator_account?.trim() || undefined,
          operation_type: values.operation_type || undefined,
          ip_address: values.ip_address?.trim() || undefined,
          operation_path: values.operation_path || undefined,
          content_keyword: values.content_keyword?.trim() || undefined,
          operated_start_at: range?.[0] ? toRfc3339(range[0]) : undefined,
          operated_end_at: range?.[1] ? toRfc3339(range[1]) : undefined
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

  const actionLabel = (type?: string) =>
    (type && t[`opLogs.action.${type}`]) || type || '--';

  return (
    <BizListPage
      form={form}
      title={t['opLogs.title']}
      filterResetText={t['common.clearAll']}
      filter={
        <>
          <FilterField>
            <FormItem
              field="operator_account"
              label={t['opLogs.filter.account']}
            >
              <FilterInput
                placeholder={t['opLogs.filter.accountPlaceholder']}
                showSearchIcon
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem
              field="operation_type"
              label={t['opLogs.filter.action']}
              initialValue=""
            >
              <FilterSelect
                placeholder={t['common.all']}
                options={actionOptions}
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="ip_address" label={t['opLogs.filter.ip']}>
              <FilterInput
                placeholder={t['opLogs.filter.ipPlaceholder']}
                showSearchIcon
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="timeRange" label={t['opLogs.filter.time']}>
              <FilterDateRange showTime />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem
              field="operation_path"
              label={t['opLogs.filter.path']}
              initialValue=""
            >
              <FilterSelect
                placeholder={t['opLogs.filter.pathPlaceholder']}
                options={pathOptions}
                allowClear
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem
              field="content_keyword"
              label={t['opLogs.filter.content']}
            >
              <FilterInput
                placeholder={t['opLogs.filter.contentPlaceholder']}
                showSearchIcon
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
      onRefresh={() => fetchData(page, pageSize)}
      tableProps={{
        loading,
        data,
        rowKey: (row: AdminAPI.AdminSystemOperationLogWrap) =>
          row.log?.log_id || String(Math.random()),
        columns: [
          {
            title: t['opLogs.col.time'],
            width: 180,
            render: (_: unknown, row: AdminAPI.AdminSystemOperationLogWrap) =>
              formatDateTime(row.log?.operated_at)
          },
          {
            title: t['opLogs.col.account'],
            width: 140,
            render: (_: unknown, row: AdminAPI.AdminSystemOperationLogWrap) =>
              row.log?.operator_account || '--'
          },
          {
            title: t['opLogs.col.action'],
            width: 140,
            render: (_: unknown, row: AdminAPI.AdminSystemOperationLogWrap) =>
              actionLabel(row.log?.operation_type)
          },
          {
            title: t['opLogs.col.ip'],
            width: 140,
            render: (_: unknown, row: AdminAPI.AdminSystemOperationLogWrap) =>
              row.log?.ip_address || '--'
          },
          {
            title: t['opLogs.col.path'],
            width: 200,
            render: (_: unknown, row: AdminAPI.AdminSystemOperationLogWrap) =>
              row.log?.operation_path || '--'
          },
          {
            title: t['opLogs.col.content'],
            width: 240,
            ellipsis: true,
            render: (_: unknown, row: AdminAPI.AdminSystemOperationLogWrap) =>
              row.log?.operation_content || '--'
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

const ObservedOpLogsPage = observer(OpLogsPage);

export default ObservedOpLogsPage;
