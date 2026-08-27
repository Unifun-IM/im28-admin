import React, { useCallback, useMemo, useState } from 'react';
import { Button, Form, Input } from '@arco-design/web-react';
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
import { postV1AdminConversationsUsersList } from '@shared/api/admin/adminhuihuachaxun';
import { UserDetailDrawer } from '@widgets/user-detail';
import { UserChatModal } from '@features/user-chat-view';
import { EmptyState } from '@shared/ui';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

type UserSessionForm = Omit<
  AdminAPI.AdminListUserConversationQueryRequest,
  'status'
> & {
  batchUserIds?: string;
  /** 表单「全部」用空串，提交时再转成 undefined */
  status?: '' | 'active' | 'disabled';
};

function statusBadge(
  status?: AdminAPI.AccountStatus
): 'success' | 'error' | 'default' {
  if (status === 'active') return 'success';
  if (status === 'disabled') return 'error';
  return 'default';
}

function parseBatchIds(raw?: unknown) {
  return String(raw ?? '')
    .split(/[\s,，]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
}

/**
 * 用户会话查询 — Figma 977:32512
 * 搜索优先空态；列表走 Admin conversations/users/list；查聊天进 UserChatModal
 */
export default function UserSessionPage() {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<UserSessionForm>();
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [data, setData] = useState<AdminAPI.AdminUserConversationQueryItem[]>(
    []
  );
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [chatUser, setChatUser] = useState<{
    userId: string;
    nickname?: string;
    avatar?: string;
  } | null>(null);

  const keywordTypeOptions = useMemo(
    () =>
      (['user_id', 'nickname'] as const).map((value) => ({
        label: t[`userQuery.keywordType.${value}`],
        value
      })),
    [t]
  );

  const statusOptions = useMemo(
    () => [
      { label: t['common.all'], value: '' },
      { label: t['userQuery.status.active'], value: 'active' },
      { label: t['userQuery.status.disabled'], value: 'disabled' }
    ],
    [t]
  );

  const statusLabel = (status?: AdminAPI.AccountStatus) => {
    if (status === 'active') return t['userQuery.status.active'];
    if (status === 'disabled') return t['userQuery.status.disabled'];
    return status || '--';
  };

  const buildBody = useCallback(
    (p: number, size: number): AdminAPI.AdminListUserConversationQueryRequest => {
      const values = form.getFieldsValue();
      const keyword = values.keyword?.trim() || undefined;
      const statusRaw = values.status;
      const body: AdminAPI.AdminListUserConversationQueryRequest = {
        page: p,
        page_size: size,
        keyword,
        keyword_type: keyword ? values.keyword_type || undefined : undefined,
        status:
          statusRaw === '' || statusRaw === undefined || statusRaw === null
            ? undefined
            : statusRaw
      };
      if (batchMode) {
        const ids = parseBatchIds(values.batchUserIds);
        if (ids.length) body.user_ids = ids;
      }
      return body;
    },
    [batchMode, form]
  );

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        if (batchMode) {
          const ids = parseBatchIds(form.getFieldValue('batchUserIds'));
          if (!ids.length) {
            setData([]);
            setTotal(0);
            return;
          }
        }
        const res = await postV1AdminConversationsUsersList(buildBody(p, size));
        setData(res.data?.list || []);
        setTotal(res.data?.total || 0);
      } finally {
        setLoading(false);
      }
    },
    [batchMode, buildBody, form, page, pageSize]
  );

  const runSearch = (p = 1, size = pageSize) => {
    setSearched(true);
    setPage(p);
    void fetchData(p, size);
  };

  return (
    <>
      <BizListPage
        form={form}
        title={t['userSession.title']}
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
              {t['userSession.action.cancelBatchSearch']}
            </Button>
          ) : (
            <Button
              type="text"
              className="use-biz-filter-action-text"
              onClick={() => setBatchMode(true)}
            >
              {t['userSession.action.batchSearch']}
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
                        {t['userSession.filter.userIds']}
                      </span>
                      <span className="use-biz-filter-label-hint">
                        {t['userSession.filter.userIdsPlaceholder']}
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
              <FilterField>
                <FormItem
                  field="status"
                  label={t['userSession.filter.status']}
                  initialValue=""
                >
                  <FilterSelect
                    placeholder={t['common.all']}
                    options={statusOptions}
                    allowClear
                  />
                </FormItem>
              </FilterField>
            </>
          ) : (
            <>
              <FilterField>
                <FormItem
                  field="keyword"
                  label={t['userSession.filter.keyword']}
                >
                  <FilterKeywordInput
                    typeField="keyword_type"
                    typeOptions={keywordTypeOptions}
                    typeInitialValue="user_id"
                    typeWidth={88}
                    placeholder={t['userSession.filter.keywordPlaceholder']}
                  />
                </FormItem>
              </FilterField>
              <FilterField>
                <FormItem
                  field="status"
                  label={t['userSession.filter.status']}
                  initialValue=""
                >
                  <FilterSelect
                    placeholder={t['common.all']}
                    options={statusOptions}
                    allowClear
                  />
                </FormItem>
              </FilterField>
            </>
          )
        }
        onSearch={() => runSearch(1, pageSize)}
        onReset={() => {
          form.resetFields();
          form.setFieldsValue({ keyword_type: 'user_id', status: '' });
          setBatchMode(false);
          setSearched(false);
          setData([]);
          setTotal(0);
          setPage(1);
        }}
        onRefresh={() => {
          if (!searched) return;
          void fetchData(page, pageSize);
        }}
        tableProps={{
          loading,
          data: searched ? data : [],
          rowKey: (row: AdminAPI.AdminUserConversationQueryItem) =>
            row.user_id || String(Math.random()),
          noDataElement: (
            <EmptyState
              description={
                searched ? common['common.empty'] : t['userSession.empty']
              }
            />
          ),
          /** 列顺序对齐 Figma 977:35189 */
          columns: [
            {
              title: t['userSession.col.user'],
              dataIndex: 'nickname',
              width: 220,
              ellipsis: false,
              render: (
                _: unknown,
                row: AdminAPI.AdminUserConversationQueryItem
              ) => (
                <AvatarNameCell
                  name={row.nickname}
                  sub={`${t['userSession.cell.userId']}：${row.user_id || ''}`}
                  copyText={row.user_id || ''}
                  avatar={row.avatar_url}
                  nameClassName="!text-[rgb(var(--link-6))]"
                  onNameClick={() => setDetailUserId(row.user_id || null)}
                />
              )
            },
            {
              title: t['userSession.col.contact'],
              dataIndex: 'phone',
              width: 180,
              ellipsis: false,
              render: (
                _: unknown,
                row: AdminAPI.AdminUserConversationQueryItem
              ) => (
                <DoubleLineCell
                  primary={`${t['userSession.cell.phone']}：${row.phone || '--'}`}
                  secondary={`${t['userSession.cell.email']}：${row.email || '--'}`}
                />
              )
            },
            {
              title: t['userSession.col.account'],
              dataIndex: 'account',
              width: 140,
              render: (
                _: unknown,
                row: AdminAPI.AdminUserConversationQueryItem
              ) => row.account || '--'
            },
            {
              title: t['userSession.col.status'],
              dataIndex: 'status',
              width: 120,
              ellipsis: false,
              render: (
                _: unknown,
                row: AdminAPI.AdminUserConversationQueryItem
              ) => (
                <StatusBadge
                  status={statusBadge(row.status)}
                  text={statusLabel(row.status)}
                />
              )
            },
            {
              title: t['userSession.col.lastActive'],
              dataIndex: 'last_active_at',
              width: 180,
              sorter: (
                a: AdminAPI.AdminUserConversationQueryItem,
                b: AdminAPI.AdminUserConversationQueryItem
              ) =>
                String(a.last_active_at || '').localeCompare(
                  String(b.last_active_at || '')
                ),
              render: (
                _: unknown,
                row: AdminAPI.AdminUserConversationQueryItem
              ) => formatDateTime(row.last_active_at)
            },
            {
              title: t['userSession.col.registeredAt'],
              dataIndex: 'registered_at',
              width: 180,
              sorter: (
                a: AdminAPI.AdminUserConversationQueryItem,
                b: AdminAPI.AdminUserConversationQueryItem
              ) =>
                String(a.registered_at || '').localeCompare(
                  String(b.registered_at || '')
                ),
              render: (
                _: unknown,
                row: AdminAPI.AdminUserConversationQueryItem
              ) => formatDateTime(row.registered_at)
            },
            {
              title: t['common.action'],
              width: 80,
              fixed: 'right' as const,
              render: (
                _: unknown,
                row: AdminAPI.AdminUserConversationQueryItem
              ) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'chat',
                      label: t['userChat.title'],
                      onClick: () =>
                        setChatUser({
                          userId: row.user_id || '',
                          nickname: row.nickname,
                          avatar: row.avatar_url
                        })
                    }
                  ]}
                />
              )
            }
          ],
          pagination: searched
            ? {
                current: page,
                pageSize,
                total,
                onChange: (p, s) => {
                  setPage(p);
                  setPageSize(s);
                  void fetchData(p, s);
                }
              }
            : false
        }}
      />
      <UserDetailDrawer
        visible={!!detailUserId}
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
      />
      <UserChatModal
        visible={!!chatUser}
        scene="user"
        userId={chatUser?.userId || null}
        userNickname={chatUser?.nickname}
        userAvatar={chatUser?.avatar}
        onClose={() => setChatUser(null)}
      />
    </>
  );
}
