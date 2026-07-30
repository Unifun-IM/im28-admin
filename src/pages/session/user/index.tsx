import React, { useCallback, useEffect, useState } from 'react';
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
import { UserDetailDrawer } from '@features/user-detail';
import { UserChatModal } from '@features/user-chat-view';
import { getUserSessions } from '@shared/api/biz';

const FormItem = Form.Item;

const USER_KEYWORD_OPTIONS = [
  { label: '用户ID', value: 'userId' },
  { label: '名称', value: 'nickname' }
];

const USER_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '正常', value: '正常' },
  { label: '黑名单', value: '黑名单' },
  { label: '注销', value: '注销' }
];

function statusToBadge(v: string): 'success' | 'error' | 'warning' | 'default' {
  if (v === '正常') return 'success';
  if (v === '黑名单') return 'error';
  if (v === '注销') return 'warning';
  return 'default';
}

/**
 * 用户会话查询 — Figma 770:22002
 * 筛选：用户关键词（用户ID/名称）/ 用户状态（正常/黑名单/注销，默认全部）
 * 查聊天：Modal（Figma 791:30433）
 */
export default function UserSessionPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [chatUser, setChatUser] = useState<{
    userId: string;
    nickname?: string;
    avatar?: string;
  } | null>(null);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await getUserSessions({
          page: p,
          pageSize: size,
          ...values
        });
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
        title="会话列表"
        filterCollapsible={false}
        filterDefaultCollapsed={false}
        filterResetText="清除全部"
        filter={
          <>
            <FilterField>
              <FormItem field="keyword" label="用户关键词搜索">
                <FilterKeywordInput
                  typeField="keywordType"
                  typeOptions={USER_KEYWORD_OPTIONS}
                  typeInitialValue="userId"
                  typeWidth={88}
                  placeholder="请输入"
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="status" label="用户状态" initialValue="">
                <FilterSelect
                  placeholder="全部"
                  options={USER_STATUS_OPTIONS}
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
          columns: [
            {
              title: '用户信息',
              dataIndex: 'nickname',
              width: 280,
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
              title: '好友/群聊数',
              dataIndex: 'friendCount',
              width: 160,
              ellipsis: false,
              render: (_: unknown, row: Record<string, unknown>) => (
                <span className="inline-flex h-6 items-center gap-1 rounded bg-[var(--color-fill-2,#f2f3f5)] px-2 text-[12px] font-medium leading-[18px] text-arco-text-1">
                  <IconUserGroup className="text-[12px] text-arco-text-2" />
                  {Number(row.friendCount ?? 0)}/{Number(row.groupCount ?? 0)}
                </span>
              )
            },
            {
              title: '账号状态',
              dataIndex: 'status',
              width: 120,
              render: (v: string) => (
                <StatusBadge status={statusToBadge(v)} text={v || '-'} />
              )
            },
            {
              title: '最后活跃时间',
              dataIndex: 'lastActiveTime',
              width: 180,
              sorter: (a, b) =>
                String(a.lastActiveTime || '').localeCompare(
                  String(b.lastActiveTime || '')
                )
            },
            {
              title: '操作',
              width: 80,
              render: (_: unknown, row: Record<string, unknown>) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'chat',
                      label: '查聊天',
                      onClick: () =>
                        setChatUser({
                          userId: String(row.userId || row.id || ''),
                          nickname: row.nickname as string | undefined,
                          avatar: row.avatar as string | undefined
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
