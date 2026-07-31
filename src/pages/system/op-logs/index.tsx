import React, { useCallback, useEffect, useState } from 'react';
import { Form } from '@arco-design/web-react';
import { observer } from 'mobx-react-lite';
import {
  BizListPage,
  FilterDateRange,
  FilterField,
  FilterInput,
  FilterSelect
} from '@widgets/biz-list';
import { getOpLogs } from '@shared/api/biz';

const FormItem = Form.Item;

const ACTION_OPTIONS = [
  { label: '全部', value: '' },
  { label: '查看用户详情', value: '查看用户详情' },
  { label: '用户查询', value: '用户查询' },
  { label: '用户拉黑', value: '用户拉黑' },
  { label: '新增账号', value: '新增账号' },
  { label: '重置密码', value: '重置密码' },
  { label: '角色管理', value: '角色管理' },
  { label: '系统参数设置', value: '系统参数设置' },
  { label: '操作日志查看', value: '操作日志查看' }
];

const PATH_OPTIONS = [
  { label: '全部', value: '' },
  { label: '用户中心/用户查询', value: '用户中心/用户查询' },
  { label: '系统/后台账号管理', value: '系统/后台账号管理' },
  { label: '系统/角色管理', value: '系统/角色管理' },
  { label: '系统/系统参数设置', value: '系统/系统参数设置' },
  { label: '系统/系统操作日志', value: '系统/系统操作日志' }
];

/**
 * 系统操作日志 — Figma 793:38382
 */
function OpLogsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await getOpLogs({ page: p, pageSize: size, ...values });
        setData((res.list || []) as Record<string, unknown>[]);
        setTotal(res.total || 0);
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

  return (
    <BizListPage
      form={form}
      title="操作日志"
      filterResetText="清除全部"
      filter={
        <>
          <FilterField>
            <FormItem field="account" label="操作账号">
              <FilterInput
                placeholder="输入后台账号查询"
                showSearchIcon
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="action" label="操作类型" initialValue="">
              <FilterSelect placeholder="全部" options={ACTION_OPTIONS} />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="ip" label="操作 IP">
              <FilterInput placeholder="输入来源 IP" showSearchIcon />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="timeRange" label="操作时间">
              <FilterDateRange />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="path" label="操作路径" initialValue="">
              <FilterSelect
                placeholder="可按页面路径查询"
                options={PATH_OPTIONS}
                allowClear
              />
            </FormItem>
          </FilterField>
          <FilterField>
            <FormItem field="content" label="操作内容">
              <FilterInput placeholder="支持关键词查询" showSearchIcon />
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
            title: '操作时间',
            dataIndex: 'time',
            width: 180
          },
          {
            title: '操作账号',
            dataIndex: 'account',
            width: 140
          },
          {
            title: '操作类型',
            dataIndex: 'action',
            width: 140
          },
          {
            title: '操作IP',
            dataIndex: 'ip',
            width: 140
          },
          {
            title: '操作路径',
            dataIndex: 'path',
            width: 200
          },
          {
            title: '操作内容',
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
