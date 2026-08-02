import React, { useCallback, useMemo, useState } from 'react';
import { Button, Form, Input } from '@arco-design/web-react';
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
import { EmptyState } from '@shared/ui';
import useLocale from '@shared/lib/useLocale';
import { openimLabel } from '@shared/lib/openimLabels';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

type GroupListRow = {
  group?: AdminAPI.Group;
  owner?: AdminAPI.User;
};

type GroupSessionForm = {
  keyword?: string;
  keyword_type?: AdminAPI.AdminListGroupRequest['keyword_type'];
  owner_user_id?: string;
  status?: '' | '0' | '1' | '2' | '3';
  batchGroupIds?: string;
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

function parseBatchIds(raw?: string) {
  return String(raw || '')
    .split(/[\s,，]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * 群组会话查询 — Figma 977:32954 / 菜单 1032:25514
 * 搜索优先空态；列表走 Admin groups/list；会话场景操作以查聊天为主
 */
export default function GroupSessionPage() {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<GroupSessionForm>();
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
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
        const values = form.getFieldsValue();
        if (batchMode) {
          const ids = parseBatchIds(values.batchGroupIds);
          if (!ids.length) {
            setData([]);
            setTotal(0);
            return;
          }
          const results = await Promise.all(
            ids.map((id) =>
              postV1AdminGroupsList({
                keyword: id,
                keyword_type: 'group_id',
                page: 1,
                page_size: 1
              })
            )
          );
          const list: GroupListRow[] = [];
          const seen = new Set<string>();
          results.forEach((res) => {
            (res.data?.list || []).forEach((row) => {
              const gid = row.group?.group_id;
              if (!gid || seen.has(gid)) return;
              seen.add(gid);
              list.push(row);
            });
          });
          setData(list);
          setTotal(list.length);
          return;
        }
        const res = await postV1AdminGroupsList(buildBody(p, size));
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

  const sharedFilters = (
    <>
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
  );

  return (
    <>
      <BizListPage
        form={form}
        title={t['groupSession.title']}
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
                form.setFieldValue('batchGroupIds', undefined);
              }}
            >
              {t['groupSession.action.cancelBatchSearch']}
            </Button>
          ) : (
            <Button
              type="text"
              className="use-biz-filter-action-text"
              onClick={() => setBatchMode(true)}
            >
              {t['groupSession.action.batchSearch']}
            </Button>
          )
        }
        filter={
          batchMode ? (
            <>
              <FilterField span="full">
                <FormItem
                  field="batchGroupIds"
                  label={t['groupSession.filter.groupIds']}
                >
                  <Input.TextArea
                    placeholder={t['groupSession.filter.groupIdsPlaceholder']}
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
              {sharedFilters}
            </>
          )
        }
        onSearch={() => runSearch(1, pageSize)}
        onReset={() => {
          form.resetFields();
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
          rowKey: (row: GroupListRow) =>
            row.group?.group_id || String(Math.random()),
          noDataElement: (
            <EmptyState
              description={
                searched
                  ? common['common.empty']
                  : t['groupSession.empty']
              }
            />
          ),
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
              width: 100,
              render: (_: unknown, row: GroupListRow) => {
                const group_id = row.group?.group_id || '';
                return (
                  <ActionLinks
                    variant="text"
                    items={[
                      {
                        key: 'chat',
                        label: t['userChat.title'],
                        onClick: () =>
                          setChatTarget({
                            type: 'group',
                            id: group_id,
                            name: row.group?.title,
                            memberCount: row.group?.member_count,
                            viewerUserId:
                              row.owner?.user_id ||
                              row.group?.owner_user_id ||
                              undefined
                          })
                      }
                    ]}
                  />
                );
              }
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
            memberCount: payload.memberCount,
            viewerUserId: payload.ownerId || undefined
          });
        }}
      />
      <UserChatModal
        visible={!!chatTarget}
        onClose={() => setChatTarget(null)}
        scene="group"
        userId={chatTarget?.viewerUserId || null}
        target={chatTarget}
      />
    </>
  );
}
