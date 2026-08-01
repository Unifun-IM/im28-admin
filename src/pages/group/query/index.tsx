import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from '@arco-design/web-react';
import {
  ActionLinks,
  AvatarNameCell,
  BizListPage,
  FilterField,
  FilterInput,
  FilterKeywordInput,
  FilterSelect,
  StatusBadge
} from '@widgets/biz-list';
import { postV1AdminGroupsList } from '@shared/api/admin/groups';
import { GroupDetailDrawer } from '@features/group-detail';
import {
  UserChatModal,
  type ChatModalTarget
} from '@features/user-chat-view';
import useLocale from '@shared/lib/useLocale';
import { openimLabel } from '@shared/lib/openimLabels';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

type GroupListRow = {
  group?: AdminAPI.Group;
  owner?: AdminAPI.User;
};

/** OpenIM GroupStatus：0 正常 / 1 封禁 / 2 解散 / 3 禁言 */
function groupStatusBadge(
  status?: AdminAPI.GroupStatus
): 'success' | 'error' | 'warning' | 'default' {
  if (status === 0) return 'success';
  if (status === 1) return 'error';
  if (status === 3) return 'warning';
  return 'default';
}

/** 群组查询 — Figma 977:33806；AdminAPI.AdminListGroupRequest */
export default function GroupQueryPage() {
  const t = useLocale();
  const common = t;

  type GroupListForm = {
    keyword?: string;
    keyword_type?: AdminAPI.AdminListGroupRequest['keyword_type'];
    owner_user_id?: string;
    /** Select 用字符串，请求时再转 GroupStatus */
    status?: '' | '0' | '1' | '2' | '3';
  };

  const [form] = Form.useForm<GroupListForm>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GroupListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailGroupId, setDetailGroupId] = useState<string | null>(null);
  const [chatTarget, setChatTarget] = useState<ChatModalTarget | null>(null);

  const keywordTypeOptions = useMemo(
    () =>
      (['group_id', 'title'] as const).map((value) => ({
        label: t[`groupQuery.keywordType.${value}`],
        value
      })),
    [t]
  );

  const statusOptions = useMemo(
    () =>
      (['0', '1', '2', '3'] as const).map((value) => ({
        label: openimLabel(t, 'groupStatus', value),
        value
      })),
    [t]
  );

  const buildBody = useCallback(
    (p: number, size: number): AdminAPI.AdminListGroupRequest => {
      const values = form.getFieldsValue();
      const keyword = values.keyword?.trim() || undefined;
      const owner_user_id = values.owner_user_id?.trim() || undefined;
      const statusRaw = values.status;
      return {
        page: p,
        page_size: size,
        keyword,
        keyword_type: keyword ? values.keyword_type || undefined : undefined,
        owner_user_id,
        status:
          statusRaw === '' || statusRaw === undefined || statusRaw === null
            ? undefined
            : (Number(statusRaw) as AdminAPI.GroupStatus)
      };
    },
    [form]
  );

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const res = await postV1AdminGroupsList(buildBody(p, size));
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

  return (
    <>
      <BizListPage
        form={form}
        title={t['groupQuery.title']}
        filterCollapsible={false}
        filterDefaultCollapsed={false}
        filterResetText={common['common.clearAll']}
        filter={
          <>
            <FilterField>
              <FormItem
                field="keyword"
                label={t['groupQuery.filter.keyword']}
              >
                <FilterKeywordInput
                  typeField="keyword_type"
                  typeOptions={keywordTypeOptions}
                  typeInitialValue="group_id"
                  typeWidth={88}
                  placeholder={t['groupQuery.filter.keywordPlaceholder']}
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem
                field="owner_user_id"
                label={t['groupQuery.filter.ownerUserId']}
              >
                <FilterInput
                  showSearchIcon
                  placeholder={t['groupQuery.filter.ownerPlaceholder']}
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="status" label={t['groupQuery.filter.status']}>
                <FilterSelect
                  placeholder={t['groupQuery.filter.status']}
                  options={[
                    { label: common['common.all'], value: '' },
                    ...statusOptions
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
        tableProps={{
          loading,
          data,
          rowKey: (row: GroupListRow) =>
            row.group?.group_id || String(Math.random()),
          columns: [
            {
              title: t['groupQuery.col.group'],
              dataIndex: 'group.title',
              width: 220,
              ellipsis: false,
              render: (_: unknown, row: GroupListRow) => (
                <AvatarNameCell
                  name={row.group?.title}
                  sub={`${t['groupQuery.cell.groupId']}：${row.group?.group_id || ''}`}
                  copyText={row.group?.group_id || ''}
                  avatar={row.group?.avatar_url}
                  nameClassName="!text-[rgb(var(--link-6))]"
                  onNameClick={() =>
                    setDetailGroupId(row.group?.group_id || null)
                  }
                />
              )
            },
            {
              title: t['groupQuery.col.owner'],
              dataIndex: 'owner.nickname',
              width: 200,
              ellipsis: false,
              render: (_: unknown, row: GroupListRow) => {
                const ownerId =
                  row.owner?.user_id || row.group?.owner_user_id || '';
                return (
                  <AvatarNameCell
                    name={
                      row.owner?.nickname ||
                      row.owner?.account ||
                      ownerId ||
                      '--'
                    }
                    sub={`${t['groupQuery.cell.userId']}：${ownerId || '--'}`}
                    copyText={ownerId}
                    avatar={row.owner?.avatar_url}
                    nameClassName="!text-[rgb(var(--link-6))]"
                  />
                );
              }
            },
            {
              title: t['groupQuery.col.memberCount'],
              dataIndex: 'group.member_count',
              width: 120,
              render: (_: unknown, row: GroupListRow) =>
                row.group?.member_count ?? '--'
            },
            {
              title: t['groupQuery.col.status'],
              dataIndex: 'group.status',
              width: 120,
              ellipsis: false,
              render: (_: unknown, row: GroupListRow) => (
                <StatusBadge
                  status={groupStatusBadge(row.group?.status)}
                  text={openimLabel(t, 'groupStatus', row.group?.status)}
                />
              )
            },
            {
              title: t['groupQuery.col.createdAt'],
              dataIndex: 'group.created_at',
              width: 180,
              render: (_: unknown, row: GroupListRow) =>
                formatDateTime(row.group?.created_at)
            },
            {
              title: common['common.action'],
              dataIndex: 'op',
              width: 80,
              render: (_: unknown, row: GroupListRow) => {
                const group_id = row.group?.group_id || '';
                return (
                  <ActionLinks
                    variant="text"
                    items={[
                      {
                        key: 'detail',
                        label: common['common.detail'],
                        onClick: () => setDetailGroupId(group_id)
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
      <GroupDetailDrawer
        visible={!!detailGroupId}
        groupId={detailGroupId}
        onClose={() => setDetailGroupId(null)}
        onViewChat={(payload) => {
          setDetailGroupId(null);
          setChatTarget({
            type: 'group',
            id: payload.groupId,
            name: payload.groupName,
            memberCount: payload.memberCount
          });
        }}
      />
      <UserChatModal
        visible={!!chatTarget}
        onClose={() => setChatTarget(null)}
        scene="group"
        userId={chatTarget?.id || null}
        target={chatTarget}
      />
    </>
  );
}
