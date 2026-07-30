import React, { useCallback, useEffect, useState } from 'react';
import {
  Form,
  Button,
  Message,
  Modal,
  Tooltip
} from '@arco-design/web-react';
import {
  IconExpand,
  IconShrink
} from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import {
  ActionLinks,
  BizListPage,
  FilterField,
  FilterInput,
  FilterSelect,
  StatusBadge
} from '@widgets/biz-list';
import { pageTabsStore } from '@entities/page-tabs';
import { getRoles } from '@shared/api/biz';
import { CreateRoleModal } from '@features/admin-role-create';

const FormItem = Form.Item;

const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '启用', value: '启用' },
  { label: '禁用', value: '禁用' }
];

/**
 * 角色管理 — Figma 741:19446
 * 新建角色 — Figma 666:21515
 */
function RolesPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [createVisible, setCreateVisible] = useState(false);
  const contentFullscreen = pageTabsStore.contentFullscreen;

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await getRoles({ page: p, pageSize: size, ...values });
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
        title="角色列表"
        filterResetText="清除全部"
        showColumnSetting={false}
        filter={
          <>
            <FilterField>
              <FormItem field="name" label="角色名称">
                <FilterInput placeholder="请输入角色名" showSearchIcon />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="desc" label="角色描述">
                <FilterInput placeholder="请输入角色描述" showSearchIcon />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="status" label="状态" initialValue="">
                <FilterSelect placeholder="请选择" options={STATUS_OPTIONS} />
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
            <Tooltip
              content={
                contentFullscreen ? '退出全屏' : '全屏（隐藏导航）'
              }
            >
              <Button
                type="secondary"
                className="use-biz-table-icon-btn"
                icon={contentFullscreen ? <IconShrink /> : <IconExpand />}
                onClick={() => pageTabsStore.toggleContentFullscreen()}
              />
            </Tooltip>
            <Button type="primary" onClick={() => setCreateVisible(true)}>
              新增角色
            </Button>
          </>
        }
        tableProps={{
          loading,
          data,
          rowKey: 'id',
          columns: [
            { title: '角色名称', dataIndex: 'name' },
            {
              title: '角色描述',
              dataIndex: 'desc',
              render: (v?: string) => v || '—'
            },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              width: 180
            },
            {
              title: '修改时间',
              dataIndex: 'updatedAt',
              width: 180
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 100,
              render: (v?: string) => (
                <StatusBadge
                  status={v === '禁用' || v === '停用' ? 'default' : 'success'}
                  text={v === '停用' ? '禁用' : v || '启用'}
                />
              )
            },
            {
              title: '操作',
              width: 120,
              fixed: 'right' as const,
              render: (_: unknown, row: Record<string, unknown>) => (
                <ActionLinks
                  items={[
                    {
                      key: 'detail',
                      label: '详情',
                      onClick: () =>
                        Message.info(`角色详情：${String(row.name)}（后续接入）`)
                    },
                    {
                      key: 'delete',
                      label: '删除',
                      danger: true,
                      onClick: () =>
                        Modal.confirm({
                          title: '删除角色',
                          content: `确认删除角色「${String(row.name)}」？`,
                          okButtonProps: { status: 'danger' },
                          onOk: () => Message.success('已删除（mock）')
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
      <CreateRoleModal
        visible={createVisible}
        onCancel={() => setCreateVisible(false)}
        onSuccess={() => fetchData(page, pageSize)}
      />
    </>
  );
}

export default observer(RolesPage);
