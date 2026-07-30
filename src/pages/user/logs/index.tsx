import React, { useCallback, useEffect, useState } from 'react';
import { Form, Button, Select, Message } from '@arco-design/web-react';
import {
  AvatarNameCell,
  BizListPage,
  DoubleLineCell,
  FilterDateRange,
  FilterField,
  FilterInput,
  FilterKeywordInput,
  FilterSelect,
  StatusBadge
} from '@widgets/biz-list';
import { getUserLogs } from '@shared/api/biz';
import { USER_ACTION_CATEGORIES } from '@shared/config/user-action-types';
import { UserDetailDrawer } from '@features/user-detail';

const FormItem = Form.Item;
const Option = Select.Option;
const OptGroup = Select.OptGroup;

const USER_KEYWORD_OPTIONS = [
  { label: '用户ID', value: 'userId' },
  { label: '昵称', value: 'nickname' },
  { label: '手机号', value: 'phone' },
  { label: '邮箱', value: 'email' },
  { label: '账号', value: 'account' }
];

const CLIENT_TYPE_OPTIONS = [
  { label: '全部', value: '' },
  { label: 'iOS', value: 'iOS' },
  { label: 'Android', value: 'Android' },
  { label: 'Web', value: 'Web' },
  { label: 'PC', value: 'PC' }
];

function splitDateTime(value?: string) {
  if (!value) return { date: '--', time: '' };
  const [date, time] = String(value).split(/\s+/);
  return { date: date || '--', time: time || '' };
}

/**
 * 用户日志 — Figma 741:25934
 */
export default function Page() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await getUserLogs({ page: p, pageSize: size, ...values });
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
    <>
      <BizListPage
        form={form}
        title={`用户日志(${total})`}
        filterCollapsible
        filterDefaultCollapsed={false}
        filterResetText="重置"
        filter={
          <>
            <FilterField>
              <FormItem field="keyword" label="关键词搜索">
                <FilterKeywordInput
                  typeField="keywordType"
                  typeOptions={USER_KEYWORD_OPTIONS}
                  typeInitialValue="userId"
                  typeWidth={96}
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="actionType" label="行为类型" initialValue="">
                <FilterSelect
                  placeholder="全部"
                  showSearch
                  allowClear
                  triggerProps={{ autoAlignPopupWidth: false }}
                >
                  <Option value="">全部</Option>
                  {USER_ACTION_CATEGORIES.map((group) => (
                    <OptGroup key={group.category} label={group.category}>
                      {group.actions.map((action) => (
                        <Option key={action} value={action}>
                          {action}
                        </Option>
                      ))}
                    </OptGroup>
                  ))}
                </FilterSelect>
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="clientType" label="客户端类型" initialValue="">
                <FilterSelect
                  placeholder="全部"
                  options={CLIENT_TYPE_OPTIONS}
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="operateTime" label="操作时间">
                <FilterDateRange />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="logId" label="日志ID">
                <FilterInput placeholder="日志ID" />
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
        toolbar={
          <Button
            onClick={() => Message.info('导出报表功能开发中')}
          >
            导出报表
          </Button>
        }
        tableProps={{
          loading,
          data,
          columns: [
            {
              title: '日志ID',
              dataIndex: 'logId',
              width: 140,
              render: (v: string, row: Record<string, unknown>) =>
                v || String(row.id || '--')
            },
            {
              title: '操作时间',
              dataIndex: 'operateTime',
              width: 120,
              ellipsis: false,
              sorter: (a, b) =>
                String(a.operateTime || '').localeCompare(
                  String(b.operateTime || '')
                ),
              render: (v: string) => {
                const { date, time } = splitDateTime(v);
                return <DoubleLineCell primary={date} secondary={time} />;
              }
            },
            {
              title: '用户信息',
              dataIndex: 'nickname',
              width: 160,
              ellipsis: false,
              render: (_: unknown, row: Record<string, unknown>) => (
                <AvatarNameCell
                  name={row.nickname as string}
                  sub={`ID：${row.userId}`}
                  copyText={String(row.userId || '')}
                  avatar={row.avatar as string | undefined}
                  nameClassName="!text-[rgb(var(--link-6))]"
                  onNameClick={() =>
                    setDetailUserId(String(row.userId || row.id || ''))
                  }
                />
              )
            },
            {
              title: '行为类型',
              dataIndex: 'action',
              width: 120,
              ellipsis: false,
              render: (_: unknown, row: Record<string, unknown>) => (
                <DoubleLineCell
                  primary={(row.action as string) || '--'}
                  secondary={(row.actionCategory as string) || '--'}
                />
              )
            },
            {
              title: '行为状态',
              dataIndex: 'actionStatus',
              width: 88,
              render: (v: string) => (
                <StatusBadge
                  status={v === '失败' ? 'error' : 'success'}
                  text={v || '成功'}
                />
              )
            },
            {
              title: '版本号',
              dataIndex: 'version',
              width: 100,
              render: (v: string) => v || '--'
            },
            {
              title: '客户端信息',
              dataIndex: 'clientOs',
              width: 120,
              ellipsis: false,
              render: (_: unknown, row: Record<string, unknown>) => (
                <DoubleLineCell
                  primary={(row.clientOs as string) || '--'}
                  secondary={(row.clientDevice as string) || '--'}
                />
              )
            },
            {
              title: 'IP/地区',
              dataIndex: 'ip',
              width: 130,
              ellipsis: false,
              render: (_: unknown, row: Record<string, unknown>) => (
                <DoubleLineCell
                  primary={(row.ip as string) || '--'}
                  secondary={(row.region as string) || '--'}
                />
              )
            },
            {
              title: '备注',
              dataIndex: 'remark',
              width: 100,
              ellipsis: true,
              render: (v: string) => v || '--'
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
      <UserDetailDrawer
        visible={!!detailUserId}
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
      />
    </>
  );
}
