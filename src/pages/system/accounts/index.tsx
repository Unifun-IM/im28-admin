import React, { useCallback, useEffect, useState } from 'react';
import { Form, Button, Message, Modal, Switch } from '@arco-design/web-react';
import { observer } from 'mobx-react-lite';
import {
  ActionLinks,
  BizListPage,
  FilterField,
  FilterInput,
  FilterSelect
} from '@widgets/biz-list';
import {
  postV1AdminSystemUsersList,
  postV1AdminSystemUsersUpdate,
  postV1AdminSystemUsersDelete
} from '@shared/api/admin/systemUsers';
import { CreateAccountModal } from '@features/admin-account-create';
import {
  ResetPasswordModal,
  type ResetPasswordTarget
} from '@features/admin-account-reset-password';
import {
  ResetGaModal,
  type ResetGaTarget
} from '@features/admin-account-reset-ga';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';


const FormItem = Form.Item;

function AccountsPage() {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<AdminAPI.ListSysUserRequest>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.SysUserWrap[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
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
        const body: AdminAPI.ListSysUserRequest = {
          page: p,
          page_size: size,
          keyword: values.keyword || undefined,
          status: values.status || undefined,
          role_id: values.role_id
        };
        const res = await postV1AdminSystemUsersList(body);
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

  const onToggleStatus = async (
    row: AdminAPI.SysUserWrap,
    checked: boolean
  ) => {
    const id = row.sys_user?.id;
    if (id == null) return;
    try {
      await postV1AdminSystemUsersUpdate({
        id,
        status: checked ? 'active' : 'disabled'
      });
      fetchData(page, pageSize);
      Message.success(common['common.success']);
    } catch {
      // request toast
    }
  };

  return (
    <>
      <BizListPage
        form={form}
        title={`${t['accounts.title']}(${total})`}
        filterResetText={common['common.clearAll']}
        filter={
          <>
            <FilterField>
              <FormItem field="keyword" label={common['common.keyword']}>
                <FilterInput placeholder={common['common.keyword']} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="status" label={common['common.status']}>
                <FilterSelect
                  placeholder={common['common.status']}
                  options={[
                    { label: common['common.all'], value: '' },
                    { label: common['common.active'], value: 'active' },
                    { label: common['common.disabled'], value: 'disabled' }
                  ]}
                  allowClear
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
          <Button type="primary" onClick={() => setCreateVisible(true)}>
            {t['accounts.create']}
          </Button>
        }
        tableProps={{
          loading,
          data,
          rowKey: (row: AdminAPI.SysUserWrap) =>
            String(row.sys_user?.id ?? Math.random()),
          columns: [
            {
              title: common['common.username'],
              dataIndex: 'sys_user.username',
              render: (_: unknown, row: AdminAPI.SysUserWrap) =>
                row.sys_user?.username || '--'
            },
            {
              title: t['accounts.col.displayName'],
              dataIndex: 'sys_user.display_name',
              render: (_: unknown, row: AdminAPI.SysUserWrap) =>
                row.sys_user?.display_name || '--'
            },
            {
              title: t['accounts.col.roles'],
              dataIndex: 'rbac.roles',
              render: (_: unknown, row: AdminAPI.SysUserWrap) =>
                (row.rbac?.roles || []).join(', ') || '--'
            },
            {
              title: common['common.status'],
              dataIndex: 'sys_user.status',
              render: (_: unknown, row: AdminAPI.SysUserWrap) => (
                <Switch
                  checked={row.sys_user?.status === 'active'}
                  onChange={(v) => onToggleStatus(row, v)}
                />
              )
            },
            {
              title: t['accounts.col.lastLoginAt'],
              dataIndex: 'sys_user.last_login_at',
              render: (_: unknown, row: AdminAPI.SysUserWrap) =>
                formatDateTime(row.sys_user?.last_login_at)
            },
            {
              title: common['common.action'],
              dataIndex: 'op',
              width: 200,
              render: (_: unknown, row: AdminAPI.SysUserWrap) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'reset',
                      label: t['accounts.resetPassword'],
                      onClick: () =>
                        setResetTarget({
                          id: Number(row.sys_user?.id),
                          username: row.sys_user?.username || ''
                        })
                    },
                    {
                      key: 'ga',
                      label: t['accounts.resetGa'],
                      onClick: () =>
                        setResetGaTarget({
                          id: String(row.sys_user?.id || ''),
                          account: row.sys_user?.username || ''
                        })
                    },
                    {
                      key: 'delete',
                      label: common['common.delete'],
                      onClick: () => {
                        Modal.confirm({
                          title: t['accounts.deleteConfirm'],
                          onOk: async () => {
                            const id = row.sys_user?.id;
                            if (id == null) return;
                            await postV1AdminSystemUsersDelete({ id });
                            fetchData(page, pageSize);
                          }
                        });
                      }
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
        visible={!!resetTarget}
        target={resetTarget}
        onCancel={() => setResetTarget(null)}
        onSuccess={() => fetchData(page, pageSize)}
      />
      <ResetGaModal
        visible={!!resetGaTarget}
        target={resetGaTarget}
        onCancel={() => setResetGaTarget(null)}
      />
    </>
  );
}

export default observer(AccountsPage);
