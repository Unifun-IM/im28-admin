import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from '@arco-design/web-react';
import { IconUserGroup } from '@arco-design/web-react/icon';
import {
  ActionLinks,
  AvatarNameCell,
  BizListPage,
  FilterField,
  FilterKeywordInput,
  FilterSelect,
  StatusBadge
} from '@widgets/biz-list';
import { postV1AdminUsersList } from '@shared/api/admin/users';
import { UserDetailDrawer } from '@features/user-detail';
import { UserChatModal } from '@features/user-chat-view';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

function statusBadge(
  status?: AdminAPI.AccountStatus
): 'success' | 'error' | 'default' {
  if (status === 'active') return 'success';
  if (status === 'disabled') return 'error';
  return 'default';
}

/**
 * 用户会话查询 — Figma 770:22002
 * 数据：postV1AdminUsersList（与用户管理查询相同）
 * 列：用户信息 / 好友群聊数 / 账号状态 / 最后活跃 / 查聊天
 */
export default function UserSessionPage() {
  const t = useLocale();
  const [form] = Form.useForm<AdminAPI.AdminListUserRequest>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.AdminUserWrap[]>([]);
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
        label:
          value === 'user_id'
            ? t['common.userId']
            : t['common.nickname'],
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

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const keyword = values.keyword || undefined;
        const res = await postV1AdminUsersList({
          page: p,
          page_size: size,
          keyword,
          keyword_type: keyword
            ? values.keyword_type || undefined
            : undefined,
          status: values.status || undefined
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
        title={t['userSession.title']}
        filterCollapsible={false}
        filterDefaultCollapsed={false}
        filterResetText={t['common.clearAll']}
        filter={
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
                  placeholder={t['common.placeholder']}
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="status" label={t['userSession.filter.status']} initialValue="">
                <FilterSelect
                  placeholder={t['common.all']}
                  options={statusOptions}
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
        tableProps={{
          loading,
          data,
          rowKey: (row: AdminAPI.AdminUserWrap) =>
            row.user?.user_id || String(Math.random()),
          columns: [
            {
              title: t['userSession.col.user'],
              dataIndex: 'user.nickname',
              width: 280,
              ellipsis: false,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <AvatarNameCell
                  name={row.user?.nickname}
                  sub={`${t['userSession.cell.userId']}：${row.user?.user_id || ''}`}
                  copyText={row.user?.user_id || ''}
                  avatar={row.user?.avatar_url}
                  nameClassName="!text-[rgb(var(--link-6))]"
                  onNameClick={() =>
                    setDetailUserId(row.user?.user_id || null)
                  }
                />
              )
            },
            {
              title: t['userSession.col.friendGroup'],
              dataIndex: 'user.user_id',
              width: 160,
              ellipsis: false,
              render: () => (
                <span className="inline-flex h-6 items-center gap-1 rounded bg-[var(--color-fill-2,#f2f3f5)] px-2 text-[12px] font-medium leading-[18px] text-arco-text-1">
                  <IconUserGroup className="text-[12px] text-arco-text-2" />
                  --/--
                </span>
              )
            },
            {
              title: t['userSession.col.status'],
              dataIndex: 'user.status',
              width: 120,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <StatusBadge
                  status={statusBadge(row.user?.status)}
                  text={statusLabel(row.user?.status)}
                />
              )
            },
            {
              title: t['userSession.col.lastActive'],
              dataIndex: 'user.last_login_at',
              width: 180,
              sorter: (a: AdminAPI.AdminUserWrap, b: AdminAPI.AdminUserWrap) =>
                String(a.user?.last_login_at || '').localeCompare(
                  String(b.user?.last_login_at || '')
                ),
              render: (_: unknown, row: AdminAPI.AdminUserWrap) =>
                formatDateTime(row.user?.last_login_at)
            },
            {
              title: t['common.action'],
              width: 80,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'chat',
                      label: t['userChat.title'],
                      onClick: () =>
                        setChatUser({
                          userId: row.user?.user_id || '',
                          nickname: row.user?.nickname,
                          avatar: row.user?.avatar_url
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
