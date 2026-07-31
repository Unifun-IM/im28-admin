import React, { useCallback, useEffect, useState } from 'react';
import {
  Form,
  Button,
  Message,
  Modal,
  Switch
} from '@arco-design/web-react';
import { observer } from 'mobx-react-lite';
import {
  ActionLinks,
  BizListPage,
  FilterField,
  FilterInput,
  FilterSelect
} from '@widgets/biz-list';
import {
  getAccounts,
  updateAccountStatus
} from '@shared/api/biz';
import { CreateAccountModal } from '@features/admin-account-create';
import {
  ResetPasswordModal,
  type ResetPasswordTarget
} from '@features/admin-account-reset-password';
import {
  ResetGaModal,
  type ResetGaTarget
} from '@features/admin-account-reset-ga';

const FormItem = Form.Item;

const ROLE_OPTIONS = [
  { label: '全部', value: '' },
  { label: '超级管理员', value: '超级管理员' },
  { label: '管理员', value: '管理员' },
  { label: '客服', value: '客服' },
  { label: '财务', value: '财务' },
  { label: 'AAA', value: 'AAA' }
];

const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '启用', value: '启用' },
  { label: '停用', value: '停用' }
];

/**
 * 后台账号管理 — Figma 741:21002
 * 新增账号 666:21799 / 成功 921:44334
 */
function AccountsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    []
  );
  const [createVisible, setCreateVisible] = useState(false);
  const [resetTarget, setResetTarget] = useState<ResetPasswordTarget | null>(
    null
  );
  const [resetGaTarget, setResetGaTarget] = useState<ResetGaTarget | null>(
    null
  );

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await getAccounts({ page: p, pageSize: size, ...values });
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

  const onToggleStatus = async (row: Record<string, unknown>, checked: boolean) => {
    const next = checked ? '启用' : '停用';
    try {
      await updateAccountStatus({
        id: String(row.id),
        status: next
      });
      setData((prev) =>
        prev.map((item) =>
          item.id === row.id ? { ...item, status: next } : item
        )
      );
      Message.success(checked ? '已启用' : '已停用');
    } catch {
      Message.error('状态更新失败');
    }
  };

  return (
    <>
      <BizListPage
        form={form}
        title={`后台账号管理列表(${total})`}
        filterResetText="清除全部"
        filter={
          <>
            <FilterField>
              <FormItem field="account" label="账号">
                <FilterInput
                  placeholder="请输入账号"
                  showSearchIcon
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="role" label="角色" initialValue="">
                <FilterSelect
                  placeholder="请选择"
                  options={ROLE_OPTIONS}
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="status" label="状态" initialValue="">
                <FilterSelect
                  placeholder="请选择"
                  options={STATUS_OPTIONS}
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
          <>
            <Button
              className="use-biz-table-secondary-btn"
              onClick={() => {
                if (!selectedRowKeys.length) {
                  Message.info('请先勾选账号');
                  return;
                }
                Modal.confirm({
                  title: '批量操作',
                  content: `已选 ${selectedRowKeys.length} 个账号，确认执行批量操作？`,
                  onOk: () => {
                    Message.success('批量操作已提交（mock）');
                    setSelectedRowKeys([]);
                  }
                });
              }}
            >
              批量操作
            </Button>
            <Button type="primary" onClick={() => setCreateVisible(true)}>
              新增账号
            </Button>
          </>
        }
        tableProps={{
          loading,
          data,
          rowKey: 'id',
          rowSelection: {
            selectedRowKeys,
            onChange: setSelectedRowKeys
          },
          columns: [
            { title: '账号', dataIndex: 'account' },
            { title: '角色', dataIndex: 'role' },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              width: 180
            },
            {
              title: '最后登录',
              dataIndex: 'lastLogin',
              width: 180
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 100,
              render: (v: string, row: Record<string, unknown>) => (
                <Switch
                  checked={v === '启用'}
                  checkedText=""
                  uncheckedText=""
                  className="use-switch-success"
                  onChange={(checked) => onToggleStatus(row, checked)}
                />
              )
            },
            {
              title: '操作',
              width: 160,
              fixed: 'right' as const,
              render: (_: unknown, row: Record<string, unknown>) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'resetPwd',
                      label: '重置密码',
                      onClick: () =>
                        setResetTarget({
                          id: String(row.id),
                          account: String(row.account || ''),
                          name: row.name ? String(row.name) : undefined
                        })
                    },
                    {
                      key: 'resetGa',
                      label: '重置谷歌',
                      onClick: () =>
                        setResetGaTarget({
                          id: String(row.id),
                          account: String(row.account || ''),
                          name: row.name ? String(row.name) : undefined
                        })
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
      <CreateAccountModal
        visible={createVisible}
        onCancel={() => setCreateVisible(false)}
        onSuccess={() => fetchData(page, pageSize)}
      />
      <ResetPasswordModal
        visible={Boolean(resetTarget)}
        target={resetTarget}
        onCancel={() => setResetTarget(null)}
      />
      <ResetGaModal
        visible={Boolean(resetGaTarget)}
        target={resetGaTarget}
        onCancel={() => setResetGaTarget(null)}
      />
    </>
  );
}

export default observer(AccountsPage);
