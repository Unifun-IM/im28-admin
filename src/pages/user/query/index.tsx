import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Input, Button, Tag } from '@arco-design/web-react';
import {
  IconCheckCircle,
  IconCloseCircle
} from '@arco-design/web-react/icon';
import {
  ActionLinks,
  AvatarNameCell,
  BatchBarAction,
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
import useLocale from '@shared/lib/useLocale';
import { openimLabel } from '@shared/lib/openimLabels';
import { formatDateTime } from '@shared/lib/formatTime';


const FormItem = Form.Item;

function statusBadge(
  status?: AdminAPI.AccountStatus
): 'success' | 'error' | 'default' {
  if (status === 'active') return 'success';
  if (status === 'disabled') return 'error';
  return 'default';
}

/** 用户查询 — AdminAPI.AdminListUserRequest / AdminUserWrap */
export default function UserQueryPage() {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<
    AdminAPI.AdminListUserRequest & { batchUserIds?: string }
  >();
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

  const keywordTypeOptions = useMemo(
    () =>
      (
        [
          'user_id',
          'nickname',
          'phone',
          'email',
          'account'
        ] as const
      ).map((value) => ({
        label: t[`userQuery.keywordType.${value}`],
        value
      })),
    [t]
  );

  const buildBody = useCallback(
    (p: number, size: number): AdminAPI.AdminListUserRequest => {
      const values = form.getFieldsValue();
      const keyword = values.keyword || undefined;
      const body: AdminAPI.AdminListUserRequest = {
        page: p,
        page_size: size,
        keyword,
        keyword_type: keyword ? values.keyword_type || undefined : undefined,
        status: values.status || undefined,
        online_status: values.online_status || undefined,
        registered_start_at: values.registered_start_at,
        registered_end_at: values.registered_end_at,
        last_operated_start_at: values.last_operated_start_at,
        last_operated_end_at: values.last_operated_end_at,
        sort_by: values.sort_by,
        sort_order: values.sort_by ? values.sort_order : undefined
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

  const statusLabel = (status?: AdminAPI.AccountStatus) => {
    if (status === 'active') return t['userQuery.status.active'];
    if (status === 'disabled') return t['userQuery.status.disabled'];
    return status || '--';
  };

  const sharedFilters = (
    <>
      <FilterField>
        <FormItem
          field="status"
          label={t['userQuery.filter.status']}
          initialValue={undefined}
        >
          <FilterSelect
            placeholder={t['userQuery.filter.status']}
            options={[
              { label: t['userQuery.filter.all'], value: '' },
              { label: t['userQuery.status.active'], value: 'active' },
              { label: t['userQuery.status.disabled'], value: 'disabled' }
            ]}
            allowClear
          />
        </FormItem>
      </FilterField>
      <FilterField>
        <FormItem
          field="online_status"
          label={t['userQuery.filter.onlineStatus']}
        >
          <FilterSelect
            placeholder={t['userQuery.filter.onlineStatus']}
            options={[
              { label: t['userQuery.filter.all'], value: '' },
              { label: openimLabel(t, 'online', 'online'), value: 'online' },
              { label: openimLabel(t, 'online', 'offline'), value: 'offline' },
              { label: openimLabel(t, 'online', 'unknown'), value: 'unknown' }
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
        title={t['userQuery.title']}
        filterCollapsible={false}
        filterDefaultCollapsed={false}
        filterResetText={common['common.reset']}
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
              {t['userQuery.action.cancelBatchSearch']}
            </Button>
          ) : (
            <Button
              type="text"
              className="use-biz-filter-action-text"
              onClick={() => setBatchMode(true)}
            >
              {t['userQuery.action.batchSearch']}
            </Button>
          )
        }
        filter={
          batchMode ? (
            <>
              <FilterField span="full">
                <FormItem
                  field="batchUserIds"
                  label={
                    <>
                      <span className="use-biz-filter-label-title">
                        {t['userQuery.filter.userIds']}
                      </span>
                      <span className="use-biz-filter-label-hint">
                        {t['userQuery.filter.userIdsHint']}
                      </span>
                    </>
                  }
                >
                  <Input.TextArea
                    placeholder={common['common.placeholder']}
                    autoSize={{ minRows: 2, maxRows: 6 }}
                  />
                </FormItem>
              </FilterField>
              {sharedFilters}
            </>
          ) : (
            <>
              <FilterField>
                <FormItem
                  field="keyword"
                  label={t['userQuery.filter.keyword']}
                >
                  <FilterKeywordInput
                    typeField="keyword_type"
                    typeOptions={keywordTypeOptions}
                    typeInitialValue="user_id"
                    typeWidth={96}
                    placeholder={t['userQuery.filter.placeholder']}
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
        batchActions={{
          onExit: () => setSelectedRowKeys([]),
          extra: (
            <>
              <BatchBarAction
                status="danger"
                icon={<IconCloseCircle />}
                onClick={() =>
                  openBlacklistModal(
                    'add',
                    selectedRowKeys.map(String),
                    'batch'
                  )
                }
              >
                {t['userQuery.action.batchBan']}
              </BatchBarAction>
              <BatchBarAction
                status="success"
                icon={<IconCheckCircle />}
                onClick={() =>
                  openBlacklistModal(
                    'remove',
                    selectedRowKeys.map(String),
                    'batch'
                  )
                }
              >
                {t['userQuery.action.batchUnban']}
              </BatchBarAction>
            </>
          )
        }}
        tableProps={{
          loading,
          data,
          rowKey: (row: AdminAPI.AdminUserWrap) =>
            row.user?.user_id || String(Math.random()),
          columns: [
            {
              title: t['userQuery.col.user'],
              dataIndex: 'user.nickname',
              width: 180,
              ellipsis: false,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <AvatarNameCell
                  name={row.user?.nickname}
                  sub={`${t['userQuery.cell.userId']}：${row.user?.user_id || ''}`}
                  copyText={row.user?.user_id || ''}
                  avatar={row.user?.avatar_url}
                  userId={row.user?.user_id}
                  nameClassName="!text-[rgb(var(--link-6))]"
                  onNameClick={() =>
                    setDetailUserId(row.user?.user_id || null)
                  }
                />
              )
            },
            {
              title: t['userQuery.col.contact'],
              dataIndex: 'user.phone',
              width: 180,
              ellipsis: false,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <DoubleLineCell
                  primary={`${t['userQuery.cell.phone']}：${row.user?.phone || '--'}`}
                  secondary={`${t['userQuery.cell.email']}：${row.user?.email || '--'}`}
                />
              )
            },
            {
              title: t['userQuery.col.account'],
              dataIndex: 'user.account',
              width: 120,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) =>
                row.user?.account || '--'
            },
            {
              title: t['userQuery.col.status'],
              dataIndex: 'user.status',
              width: 100,
              ellipsis: false,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <StatusBadge
                  status={statusBadge(row.user?.status)}
                  text={statusLabel(row.user?.status)}
                />
              )
            },
            {
              title: t['userQuery.col.createdAt'],
              dataIndex: 'user.created_at',
              width: 180,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) =>
                formatDateTime(row.user?.created_at)
            },
            {
              title: t['userQuery.col.lastLoginAt'],
              dataIndex: 'user.last_login_at',
              width: 180,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) =>
                formatDateTime(row.user?.last_login_at)
            },
            {
              title: t['userQuery.col.onlineStatus'],
              dataIndex: 'online_status',
              width: 120,
              render: (v: AdminAPI.OnlineStatus) => (
                <Tag
                  color={v === 'online' ? 'green' : 'gray'}
                  size="small"
                  className="!m-0"
                >
                  {openimLabel(t, 'online', v)}
                </Tag>
              )
            },
            {
              title: common['common.action'],
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
                        label: disabled
                          ? t['userQuery.action.unban']
                          : t['userQuery.action.ban'],
                        onClick: () =>
                          openBlacklistModal(
                            disabled ? 'remove' : 'add',
                            [uid],
                            'single'
                          )
                      },
                      {
                        key: 'detail',
                        label: common['common.detail'],
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
