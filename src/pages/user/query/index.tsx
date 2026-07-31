import React, { useCallback, useEffect, useState } from 'react';
import { Form, Input, Button, Tag, Dropdown, Menu } from '@arco-design/web-react';
import {
  ActionLinks,
  AvatarNameCell,
  BizListPage,
  DoubleLineCell,
  FilterField,
  FilterKeywordInput,
  FilterSelect,
  StatusBadge
} from '@widgets/biz-list';
import { postV1AdminUsersList } from '@shared/api/admin/users';
import { BlacklistActionModal } from '@features/user-blacklist-action';
import { UserDetailDrawer } from '@features/user-detail';

const FormItem = Form.Item;

const KEYWORD_TYPE_OPTIONS: {
  label: string;
  value: NonNullable<AdminAPI.AdminListUserRequest['keyword_type']>;
}[] = [
  { label: 'user_id', value: 'user_id' },
  { label: 'nickname', value: 'nickname' },
  { label: 'phone', value: 'phone' },
  { label: 'email', value: 'email' },
  { label: 'account', value: 'account' }
];

function statusBadge(
  status?: AdminAPI.AccountStatus
): 'success' | 'error' | 'default' {
  if (status === 'active') return 'success';
  if (status === 'disabled') return 'error';
  return 'default';
}

/** 用户查询 — AdminAPI.AdminListUserRequest / AdminUserWrap */
export default function UserQueryPage() {
  const [form] = Form.useForm<AdminAPI.AdminListUserRequest & { batchUserIds?: string }>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.AdminUserWrap[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    []
  );
  const [batchMode, setBatchMode] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [blacklistModal, setBlacklistModal] = useState<{
    mode: 'add' | 'remove';
    variant: 'single' | 'batch';
    userIds: string[];
  } | null>(null);

  const buildBody = useCallback(
    (p: number, size: number): AdminAPI.AdminListUserRequest => {
      const values = form.getFieldsValue();
      const body: AdminAPI.AdminListUserRequest = {
        page: p,
        page_size: size,
        keyword: values.keyword || undefined,
        keyword_type: values.keyword_type || undefined,
        status: values.status || undefined,
        online_status: values.online_status || undefined,
        registered_start_at: values.registered_start_at,
        registered_end_at: values.registered_end_at,
        last_operated_start_at: values.last_operated_start_at,
        last_operated_end_at: values.last_operated_end_at,
        sort_by: values.sort_by,
        sort_order: values.sort_order
      };
      if (batchMode && values.batchUserIds) {
        body.user_ids = String(values.batchUserIds)
          .split(/[\s,，]+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return body;
    },
    [form, batchMode]
  );

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const res = await postV1AdminUsersList(buildBody(p, size));
        setData(res.data?.list || []);
        setTotal(res.data?.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [buildBody, page, pageSize]
  );

  useEffect(() => {
    fetchData(1, pageSize);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openBlacklistModal = (
    mode: 'add' | 'remove',
    userIds: string[],
    variant: 'single' | 'batch'
  ) => {
    if (!userIds.length) return;
    setBlacklistModal({ mode, userIds, variant });
  };

  const sharedFilters = (
    <>
      <FilterField>
        <FormItem field="status" label="status" initialValue={undefined}>
          <FilterSelect
            placeholder="status"
            options={[
              { label: '全部', value: '' },
              { label: 'active', value: 'active' },
              { label: 'disabled', value: 'disabled' }
            ]}
            allowClear
          />
        </FormItem>
      </FilterField>
      <FilterField>
        <FormItem field="online_status" label="online_status">
          <FilterSelect
            placeholder="online_status"
            options={[
              { label: '全部', value: '' },
              { label: 'online', value: 'online' },
              { label: 'offline', value: 'offline' },
              { label: 'unknown', value: 'unknown' }
            ]}
            allowClear
          />
        </FormItem>
      </FilterField>
    </>
  );

  return (
    <>
      <BizListPage
        form={form}
        title="用户列表"
        filterCollapsible={false}
        filterDefaultCollapsed={false}
        filterResetText="重置"
        filterExtraActions={
          batchMode ? (
            <Button
              type="text"
              className="use-biz-filter-action-text is-danger"
              onClick={() => {
                setBatchMode(false);
                form.setFieldValue('batchUserIds', undefined);
              }}
            >
              取消批量搜索
            </Button>
          ) : (
            <Button
              type="text"
              className="use-biz-filter-action-text"
              onClick={() => setBatchMode(true)}
            >
              批量搜索
            </Button>
          )
        }
        filter={
          batchMode ? (
            <>
              <FilterField span="full">
                <FormItem field="batchUserIds" label="user_ids">
                  <Input.TextArea
                    placeholder="user_ids"
                    style={{ minHeight: 56 }}
                  />
                </FormItem>
              </FilterField>
              {sharedFilters}
            </>
          ) : (
            <>
              <FilterField>
                <FormItem field="keyword" label="keyword">
                  <FilterKeywordInput
                    typeField="keyword_type"
                    typeOptions={KEYWORD_TYPE_OPTIONS}
                    typeInitialValue="user_id"
                    typeWidth={100}
                  />
                </FormItem>
              </FilterField>
              {sharedFilters}
            </>
          )
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
          <Dropdown
            disabled={!selectedRowKeys.length}
            droplist={
              <Menu
                onClickMenuItem={(key) => {
                  openBlacklistModal(
                    key as 'add' | 'remove',
                    selectedRowKeys.map(String),
                    'batch'
                  );
                }}
              >
                <Menu.Item key="add">批量加入黑名单</Menu.Item>
                <Menu.Item key="remove">批量解除黑名单</Menu.Item>
              </Menu>
            }
          >
            <Button type="primary" disabled={!selectedRowKeys.length}>
              批量操作
            </Button>
          </Dropdown>
        }
        tableProps={{
          loading,
          data,
          rowKey: (row: AdminAPI.AdminUserWrap) =>
            row.user?.user_id || String(Math.random()),
          columns: [
            {
              title: 'user',
              dataIndex: 'user.nickname',
              width: 180,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <AvatarNameCell
                  name={row.user?.nickname}
                  sub={`user_id：${row.user?.user_id || ''}`}
                  copyText={row.user?.user_id || ''}
                  avatar={row.user?.avatar_url}
                />
              )
            },
            {
              title: 'contact',
              dataIndex: 'user.phone',
              width: 180,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <DoubleLineCell
                  primary={`phone：${row.user?.phone || '--'}`}
                  secondary={`email：${row.user?.email || '--'}`}
                />
              )
            },
            {
              title: 'account',
              dataIndex: 'user.account',
              width: 120,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) =>
                row.user?.account || '--'
            },
            {
              title: 'status',
              dataIndex: 'user.status',
              width: 100,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <StatusBadge
                  status={statusBadge(row.user?.status)}
                  text={row.user?.status || '--'}
                />
              )
            },
            {
              title: 'created_at',
              dataIndex: 'user.created_at',
              width: 180,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) =>
                row.user?.created_at || '--'
            },
            {
              title: 'last_login_at',
              dataIndex: 'user.last_login_at',
              width: 180,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) =>
                row.user?.last_login_at || '--'
            },
            {
              title: 'online_status',
              dataIndex: 'online_status',
              width: 120,
              render: (v: AdminAPI.OnlineStatus) => (
                <Tag
                  color={v === 'online' ? 'green' : 'gray'}
                  size="small"
                  className="!m-0"
                >
                  {v || '--'}
                </Tag>
              )
            },
            {
              title: '操作',
              dataIndex: 'op',
              width: 100,
              fixed: 'right' as const,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => {
                const disabled = row.user?.status === 'disabled';
                const uid = row.user?.user_id || '';
                return (
                  <ActionLinks
                    variant="text"
                    items={[
                      {
                        key: 'blacklist',
                        label: disabled ? '解禁' : '拉黑',
                        onClick: () =>
                          openBlacklistModal(
                            disabled ? 'remove' : 'add',
                            [uid],
                            'single'
                          )
                      },
                      {
                        key: 'detail',
                        label: '详情',
                        onClick: () => setDetailUserId(uid)
                      }
                    ]}
                  />
                );
              }
            }
          ],
          rowSelection: {
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys)
          },
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
      <BlacklistActionModal
        visible={!!blacklistModal}
        mode={blacklistModal?.mode || 'add'}
        variant={blacklistModal?.variant || 'single'}
        userIds={blacklistModal?.userIds || []}
        onCancel={() => setBlacklistModal(null)}
        onSuccess={() => {
          setSelectedRowKeys([]);
          fetchData(page, pageSize);
        }}
      />
    </>
  );
}
