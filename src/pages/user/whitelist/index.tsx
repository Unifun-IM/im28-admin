import React, { useCallback, useEffect, useState } from 'react';
import { Form, DatePicker, Button, Message } from '@arco-design/web-react';
import {
  ActionLinks,
  AvatarNameCell,
  BizListPage,
  DoubleLineCell,
  FilterField,
  FilterKeywordInput,
  FilterSelect
} from '@widgets/biz-list';
import { getWhitelist } from '@shared/api/biz';
import WhitelistActionModal from '../WhitelistActionModal';
import UserDetailDrawer from '../detail/UserDetailDrawer';
import iconWarning from '../assets/icon-exclamation-circle-fill.svg';

const FormItem = Form.Item;

const USER_KEYWORD_OPTIONS = [
  { label: '用户ID', value: 'userId' },
  { label: '昵称', value: 'nickname' },
  { label: '手机号', value: 'phone' },
  { label: '邮箱', value: 'email' },
  { label: '账号', value: 'account' }
];

const OPERATE_TYPE_OPTIONS = [
  { label: '全部', value: '' },
  { label: '正常', value: '正常' },
  { label: '黑名单', value: '黑名单' },
  { label: '注销', value: '注销' }
];

/**
 * 白名单列表 — Figma 796:20718
 * 批量操作参考黑名单浅色条；添加 805:20062；移除 805:20148
 */
export default function Page() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [addVisible, setAddVisible] = useState(false);
  const [removeModal, setRemoveModal] = useState<{
    userIds: string[];
    variant: 'single' | 'batch';
  } | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await getWhitelist({ page: p, pageSize: size, ...values });
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

  const openRemove = (ids: string[], variant: 'single' | 'batch') => {
    if (!ids.length) return;
    setRemoveModal({ userIds: ids, variant });
  };

  return (
    <>
      <BizListPage
        form={form}
        title="白名单列表"
        filterCollapsible
        filterDefaultCollapsed={false}
        filterResetText="重置"
        filter={
          <>
            <FilterField span={2}>
              <FormItem field="keyword" label="关键词搜索">
                <FilterKeywordInput
                  typeField="keywordType"
                  typeOptions={USER_KEYWORD_OPTIONS}
                  typeInitialValue="userId"
                  typeWidth={96}
                />
              </FormItem>
            </FilterField>
            <FilterField span="narrow">
              <FormItem field="operateType" label="操作类型" initialValue="">
                <FilterSelect
                  placeholder="全部"
                  options={OPERATE_TYPE_OPTIONS}
                />
              </FormItem>
            </FilterField>
            <FilterField span={2}>
              <FormItem field="operateTime" label="操作时间">
                <DatePicker.RangePicker
                  style={{ width: '100%' }}
                  placeholder={['开始时间', '结束时间']}
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
        toolbar={
          <Button
            className="!bg-[var(--color-fill-2,#f2f3f5)] !text-arco-text-2"
            onClick={() => {
              if (!selectedRowKeys.length) {
                Message.info('请先勾选用户');
                return;
              }
              openRemove(selectedRowKeys.map(String), 'batch');
            }}
          >
            批量操作
          </Button>
        }
        toolbarAlways={
          <Button type="primary" onClick={() => setAddVisible(true)}>
            添加白名单
          </Button>
        }
        batchActions={{
          theme: 'light',
          extra: (
            <button
              type="button"
              className="inline-flex h-8 items-center gap-2 border-0 border-l border-solid border-[rgba(0,0,0,0.08)] bg-transparent px-3 text-[14px] leading-[21px] text-[rgb(var(--danger-6))] hover:bg-[rgba(0,0,0,0.04)]"
              onClick={() => openRemove(selectedRowKeys.map(String), 'batch')}
            >
              <span className="relative inline-block size-[16px] shrink-0">
                <img
                  alt=""
                  src={iconWarning}
                  className="absolute left-[1.33px] top-[1.33px] block size-[13.34px] max-w-none"
                />
              </span>
              批量移除
            </button>
          )
        }}
        tableProps={{
          loading,
          data,
          rowSelection: {
            selectedRowKeys,
            onChange: setSelectedRowKeys
          },
          columns: [
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
                    setDetailUserId(String(row.id || row.userId || ''))
                  }
                />
              )
            },
            {
              title: '联系方式',
              dataIndex: 'phone',
              width: 167,
              ellipsis: false,
              render: (_: unknown, row: Record<string, unknown>) => (
                <DoubleLineCell
                  primary={`手机：${(row.phone as string) || '--'}`}
                  secondary={`邮箱：${(row.email as string) || '--'}`}
                />
              )
            },
            {
              title: '账号',
              dataIndex: 'account',
              width: 120,
              render: (v: string) => v || '--'
            },
            {
              title: '操作人',
              dataIndex: 'operator',
              width: 120
            },
            {
              title: '操作时间',
              dataIndex: 'operateTime',
              width: 168
            },
            {
              title: '原因',
              dataIndex: 'reason',
              width: 120,
              ellipsis: true,
              render: (v: string) => v || '--'
            },
            {
              title: '备注',
              dataIndex: 'remark',
              width: 100,
              render: (v: string) => v || '--'
            },
            {
              title: '操作',
              dataIndex: 'op',
              width: 72,
              fixed: 'right',
              render: (_: unknown, row: Record<string, unknown>) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'remove',
                      label: '移除',
                      onClick: () =>
                        openRemove(
                          [String(row.id || row.userId || '')],
                          'single'
                        )
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
            onChange: (p, s) => {
              setPage(p);
              setPageSize(s);
              fetchData(p, s);
            }
          }
        }}
      />
      <WhitelistActionModal
        visible={addVisible}
        mode="add"
        onCancel={() => setAddVisible(false)}
        onSuccess={() => fetchData(page, pageSize)}
      />
      <WhitelistActionModal
        visible={!!removeModal}
        mode="remove"
        variant={removeModal?.variant || 'single'}
        userIds={removeModal?.userIds || []}
        onCancel={() => setRemoveModal(null)}
        onSuccess={() => {
          setSelectedRowKeys([]);
          fetchData(page, pageSize);
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
