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
import { postV1AdminConversationsGroupsList } from '@shared/api/admin/adminhuihuachaxun';
import { GroupDetailDrawer } from '@widgets/group-detail';
import {
  UserChatModal,
  type ChatModalTarget
} from '@features/user-chat-view';
import { EmptyState } from '@shared/ui';
import useLocale from '@shared/lib/useLocale';
import { imLabel } from '@shared/lib/imLabels';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

type GroupListRow = AdminAPI.AdminGroupConversationWrap;

type GroupSessionForm = {
  keyword?: string;
  keyword_type?: 'group_id' | 'title';
  owner_user_id?: string;
  status?: '' | '0' | '1' | '2' | '3';
  batchGroupIds?: string;
};

/** IM GroupStatus：0 正常 / 1 封禁 / 2 解散 / 3 禁言 */
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
    .filter(Boolean)
    .slice(0, 100);
}

/**
 * 群组会话查询 — Figma 977:32954 / 菜单 1032:25514
 * @see postV1AdminConversationsGroupsList
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
        label: imLabel(t, 'groupStatus', value),
        value
      })),
    [t]
  );

  const resolveStatus = (statusRaw: GroupSessionForm['status']) =>
    statusRaw === '' || statusRaw === undefined || statusRaw === null
      ? undefined
      : (Number(statusRaw) as AdminAPI.GroupStatus);

  const buildBody = useCallback(
    (p: number, size: number): AdminAPI.AdminListGroupConversationRequest => {
      const values = form.getFieldsValue();
      const keyword = values.keyword?.trim() || undefined;
      const keywordType = values.keyword_type || 'group_id';
      const owner_user_id = values.owner_user_id?.trim() || undefined;
      return {
        page: p,
        page_size: size,
        group_ids:
          keyword && keywordType === 'group_id' ? [keyword] : undefined,
        title: keyword && keywordType === 'title' ? keyword : undefined,
        owner_user_id,
        status: resolveStatus(values.status)
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
          const res = await postV1AdminConversationsGroupsList({
            group_ids: ids,
            owner_user_id: values.owner_user_id?.trim() || undefined,
            status: resolveStatus(values.status),
            page: 1,
            page_size: Math.min(100, ids.length)
          });
          setData(res.data?.list || []);
          setTotal(res.data?.total || 0);
          return;
        }
        const res = await postV1AdminConversationsGroupsList(buildBody(p, size));
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
        title={
          searched ? t['groupSession.listTitle'] : t['groupSession.title']
        }
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
                  label={
                    <>
                      <span className="use-biz-filter-label-title">
                        {t['groupSession.filter.groupIds']}
                      </span>
                      <span className="use-biz-filter-label-hint">
                        {t['groupSession.filter.groupIdsPlaceholder']}
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
                const ownerId = row.owner?.user_id || '';
                return (
                  <AvatarNameCell
                    name={row.owner?.nickname || ownerId || '--'}
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
                  text={imLabel(t, 'groupStatus', row.group?.status)}
                />
              )
            },
            {
              title: t['groupQuery.col.createdAt'],
              dataIndex: 'group.created_at',
              width: 180,
              sorter: (a: GroupListRow, b: GroupListRow) =>
                String(a.group?.created_at || '').localeCompare(
                  String(b.group?.created_at || '')
                ),
              render: (_: unknown, row: GroupListRow) =>
                formatDateTime(row.group?.created_at)
            },
            {
              title: common['common.action'],
              dataIndex: 'op',
              width: 80,
              fixed: 'right' as const,
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
                            conversationId: row.group?.conversation_id,
                            viewerUserId: row.owner?.user_id || undefined
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
