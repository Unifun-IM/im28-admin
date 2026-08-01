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
import useLocale from '@shared/lib/useLocale';

const FormItem = Form.Item;

/**
 * 系统操作日志 — Figma 793:38382
 * Admin OpenAPI 暂无契约：保留筛选 / 表格交互，列表为空
 */
function OpLogsPage() {
  const t = useLocale();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const actionOptions = useMemo(
    () => [
      { label: t['common.all'], value: '' },
      { label: t['opLogs.action.viewUser'], value: 'view_user' },
      { label: t['opLogs.action.queryUser'], value: 'query_user' },
      { label: t['opLogs.action.blacklist'], value: 'blacklist' },
      { label: t['opLogs.action.createAccount'], value: 'create_account' },
      { label: t['opLogs.action.resetPassword'], value: 'reset_password' },
      { label: t['opLogs.action.role'], value: 'role' },
      { label: t['opLogs.action.systemParams'], value: 'system_params' },
      { label: t['opLogs.action.viewLogs'], value: 'view_logs' }
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
      { label: t['opLogs.path.opLogs'], value: 'system/op-logs' }
    ],
    [t]
  );

  const fetchData = useCallback(async (_p = page, _size = pageSize) => {
    setLoading(true);
    try {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData(1, pageSize);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BizListPage
      form={form}
      title={t['opLogs.title']}
      filterResetText={t['common.clearAll']}
      filter={
        <>
          <FilterField>
            <FormItem field="account" label={t['opLogs.filter.account']}>
              <FilterInput
                placeholder={t['opLogs.filter.accountPlaceholder']}
                showSearchIcon
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="action" label={t['opLogs.filter.action']} initialValue="">
              <FilterSelect
                placeholder={t['common.all']}
                options={actionOptions}
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="ip" label={t['opLogs.filter.ip']}>
              <FilterInput
                placeholder={t['opLogs.filter.ipPlaceholder']}
                showSearchIcon
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="timeRange" label={t['opLogs.filter.time']}>
              <FilterDateRange />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="path" label={t['opLogs.filter.path']} initialValue="">
              <FilterSelect
                placeholder={t['opLogs.filter.pathPlaceholder']}
                options={pathOptions}
                allowClear
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="content" label={t['opLogs.filter.content']}>
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
        rowKey: 'id',
        columns: [
          {
            title: t['opLogs.col.time'],
            dataIndex: 'time',
            width: 180
          },
          {
            title: t['opLogs.col.account'],
            dataIndex: 'account',
            width: 140
          },
          {
            title: t['opLogs.col.action'],
            dataIndex: 'action',
            width: 140
          },
          {
            title: t['opLogs.col.ip'],
            dataIndex: 'ip',
            width: 140
          },
          {
            title: t['opLogs.col.path'],
            dataIndex: 'path',
            width: 200
          },
          {
            title: t['opLogs.col.content'],
            dataIndex: 'content',
            ellipsis: true
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

export default observer(OpLogsPage);
