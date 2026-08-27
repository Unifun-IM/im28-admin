import React, { useCallback, useEffect, useState } from 'react';
import { Form, Button, Message, Modal } from '@arco-design/web-react';
import { observer } from 'mobx-react-lite';
import {
  ActionLinks,
  BizListPage,
  FilterField,
  FilterInput,
  FilterSelect,
  StatusBadge
} from '@widgets/biz-list';
import {
  postV1AdminRolesList,
  postV1AdminRolesDelete
} from '@shared/api/admin/rbac';
import { CreateRoleModal } from '@features/admin-role-create';
import useLocale from '@shared/lib/useLocale';

const FormItem = Form.Item;

/** 内置超级管理员：不展示编辑 / 删除 */
function isSuperAdminRole(role?: AdminAPI.SysRole) {
  const code = role?.code?.trim().toLowerCase();
  if (code === 'super_admin') return true;
  const name = role?.name?.trim().toLowerCase();
  return name === 'super admin' || name === '超级管理员';
}

export function RolesPage() {
  const t = useLocale();
  const common = t;

  type RoleListForm = {
    keyword?: string;
    /** Select 用字符串，请求时再转 boolean */
    is_enable?: '' | 'true' | 'false';
  };

  const [form] = Form.useForm<RoleListForm>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.SysRoleWrap[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<AdminAPI.SysRoleWrap | null>(
    null
  );

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await postV1AdminRolesList({
          page: p,
          page_size: size,
          keyword: values.keyword || undefined,
          is_enable:
            values.is_enable === undefined || values.is_enable === ''
              ? undefined
              : values.is_enable === 'true'
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

  const openCreate = () => {
    setEditingRole(null);
    setModalVisible(true);
  };

  const openEdit = (row: AdminAPI.SysRoleWrap) => {
    setEditingRole(row);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingRole(null);
  };

  return (
    <>
      <BizListPage
        form={form}
        title={t['roles.title']}
        filterResetText={common['common.clearAll']}
        filter={
          <>
            <FilterField>
              <FormItem field="keyword" label={common['common.keyword']}>
                <FilterInput placeholder={common['common.keyword']} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="is_enable" label={t['roles.filter.isEnable']}>
                <FilterSelect
                  placeholder={t['roles.filter.isEnable']}
                  options={[
                    { label: common['common.all'], value: '' },
                    { label: common['common.enabled'], value: 'true' },
                    { label: common['common.disabled'], value: 'false' }
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
          <Button type="primary" onClick={openCreate}>
            {t['roles.create']}
          </Button>
        }
        tableProps={{
          loading,
          data,
          rowKey: (row: AdminAPI.SysRoleWrap) =>
            String(row.role?.id ?? Math.random()),
          columns: [
            {
              title: t['roles.col.code'],
              dataIndex: 'role.code',
              render: (_: unknown, row: AdminAPI.SysRoleWrap) =>
                row.role?.code || '--'
            },
            {
              title: t['roles.col.name'],
              dataIndex: 'role.name',
              render: (_: unknown, row: AdminAPI.SysRoleWrap) =>
                row.role?.name || '--'
            },
            {
              title: common['common.description'],
              dataIndex: 'role.description',
              render: (_: unknown, row: AdminAPI.SysRoleWrap) =>
                row.role?.description || '--'
            },
            {
              title: t['roles.col.isEnable'],
              dataIndex: 'role.is_enable',
              ellipsis: false,
              render: (_: unknown, row: AdminAPI.SysRoleWrap) => (
                <StatusBadge
                  status={row.role?.is_enable ? 'success' : 'error'}
                  text={
                    row.role?.is_enable
                      ? common['common.enabled']
                      : common['common.disabled']
                  }
                />
              )
            },
            {
              title: common['common.action'],
              dataIndex: 'op',
              width: 120,
              render: (_: unknown, row: AdminAPI.SysRoleWrap) => {
                if (isSuperAdminRole(row.role)) return '--';
                return (
                  <ActionLinks
                    variant="text"
                    items={[
                      {
                        key: 'edit',
                        label: common['common.edit'],
                        onClick: () => openEdit(row)
                      },
                      {
                        key: 'delete',
                        label: common['common.delete'],
                        danger: true,
                        onClick: () => {
                          const id = row.role?.id;
                          if (id == null) return;
                          Modal.confirm({
                            title: t['roles.deleteConfirm'],
                            onOk: async () => {
                              await postV1AdminRolesDelete({ id });
                              Message.success(common['common.success']);
                              fetchData(page, pageSize);
                            }
                          });
                        }
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
            onChange: (p, s) => {
              setPage(p);
              setPageSize(s);
              fetchData(p, s);
            }
          }
        }}
      />
      <CreateRoleModal
        visible={modalVisible}
        role={editingRole}
        onCancel={closeModal}
        onSuccess={() => fetchData(page, pageSize)}
      />
    </>
  );
}

const ObservedRolesPage = observer(RolesPage);

export default ObservedRolesPage;
