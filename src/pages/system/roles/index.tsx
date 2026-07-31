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

const FormItem = Form.Item;

function RolesPage() {
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
  const [createVisible, setCreateVisible] = useState(false);

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

  return (
    <>
      <BizListPage
        form={form}
        title="角色列表"
        filterResetText="清除全部"
        filter={
          <>
            <FilterField>
              <FormItem field="keyword" label="keyword">
                <FilterInput placeholder="keyword" />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="is_enable" label="is_enable">
                <FilterSelect
                  placeholder="is_enable"
                  options={[
                    { label: '全部', value: '' },
                    { label: 'true', value: 'true' },
                    { label: 'false', value: 'false' }
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
            新增角色
          </Button>
        }
        tableProps={{
          loading,
          data,
          rowKey: (row: AdminAPI.SysRoleWrap) =>
            String(row.role?.id ?? Math.random()),
          columns: [
            {
              title: 'code',
              dataIndex: 'role.code',
              render: (_: unknown, row: AdminAPI.SysRoleWrap) =>
                row.role?.code || '--'
            },
            {
              title: 'name',
              dataIndex: 'role.name',
              render: (_: unknown, row: AdminAPI.SysRoleWrap) =>
                row.role?.name || '--'
            },
            {
              title: 'description',
              dataIndex: 'role.description',
              render: (_: unknown, row: AdminAPI.SysRoleWrap) =>
                row.role?.description || '--'
            },
            {
              title: 'is_enable',
              dataIndex: 'role.is_enable',
              render: (_: unknown, row: AdminAPI.SysRoleWrap) => (
                <StatusBadge
                  status={row.role?.is_enable ? 'success' : 'error'}
                  text={String(row.role?.is_enable)}
                />
              )
            },
            {
              title: '操作',
              dataIndex: 'op',
              width: 120,
              render: (_: unknown, row: AdminAPI.SysRoleWrap) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'delete',
                      label: '删除',
                      onClick: () => {
                        const id = row.role?.id;
                        if (id == null) return;
                        Modal.confirm({
                          title: '删除角色？',
                          onOk: async () => {
                            await postV1AdminRolesDelete({ id });
                            Message.success('ok');
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
      <CreateRoleModal
        visible={createVisible}
        onCancel={() => setCreateVisible(false)}
        onSuccess={() => fetchData(page, pageSize)}
      />
    </>
  );
}

export default observer(RolesPage);
