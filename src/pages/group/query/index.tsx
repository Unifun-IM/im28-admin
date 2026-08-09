import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Input, Message, Modal } from '@arco-design/web-react';
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
import {
  postV1AdminGroupsBan,
  postV1AdminGroupsList,
  postV1AdminGroupsMute
} from '@shared/api/admin/groups';
import { GroupDetailDrawer } from '@features/group-detail';
import {
  UserChatModal,
  type ChatModalTarget
} from '@features/user-chat-view';
import useLocale from '@shared/lib/useLocale';
import { imLabel } from '@shared/lib/imLabels';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

type GroupListRow = {
  group?: AdminAPI.Group;
  owner?: AdminAPI.User;
};

type GroupListForm = {
  keyword?: string;
  keyword_type?: AdminAPI.AdminListGroupRequest['keyword_type'];
  owner_user_id?: string;
  /** Select 用字符串，请求时再转 GroupStatus */
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

/** 逗号 / 中文逗号 / 空格 / 换行（Excel 列粘贴） */
function parseBatchIds(raw?: string) {
  return String(raw || '')
    .split(/[\s,，]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
}

/**
 * 群组查询 — Figma 977:33806 / 更多菜单 1225:28854；批量搜索 1125:26762
 * AdminAPI.AdminListGroupRequest（无 group_ids，批量按 ID 精确查后合并）
 * 操作：封禁 postV1AdminGroupsBan / 禁言 postV1AdminGroupsMute
 */
export default function GroupQueryPage() {
  const t = useLocale();
  const common = t;

  const [form] = Form.useForm<GroupListForm>();
  const [loading, setLoading] = useState(false);
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

  const resolveStatus = (statusRaw: GroupListForm['status']) =>
    statusRaw === '' || statusRaw === undefined || statusRaw === null
      ? undefined
      : (Number(statusRaw) as AdminAPI.GroupStatus);

  const buildBody = useCallback(
    (p: number, size: number): AdminAPI.AdminListGroupRequest => {
      const values = form.getFieldsValue();
      const keyword = values.keyword?.trim() || undefined;
      const owner_user_id = values.owner_user_id?.trim() || undefined;
      return {
        page: p,
        page_size: size,
        keyword,
        keyword_type: keyword ? values.keyword_type || undefined : undefined,
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
          const owner_user_id = values.owner_user_id?.trim() || undefined;
          const status = resolveStatus(values.status);
          const results = await Promise.all(
            ids.map((id) =>
              postV1AdminGroupsList({
                keyword: id,
                keyword_type: 'group_id',
                owner_user_id,
                status,
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

  useEffect(() => {
    fetchData(1, pageSize);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const exitBatchMode = () => {
    setBatchMode(false);
    form.setFieldValue('batchGroupIds', undefined);
  };

  /** 封禁 / 解除封禁 — postV1AdminGroupsBan（enabled） */
  const confirmBan = (row: GroupListRow, enabled: boolean) => {
    const group_id = row.group?.group_id;
    if (!group_id) return;
    const name = row.group?.title || group_id;
    const kind = enabled ? 'ban' : 'unban';
    Modal.confirm({
      title: t[`groupQuery.confirm.${kind}`].replace('{name}', name),
      onOk: async () => {
        await postV1AdminGroupsBan({ group_id, enabled });
        Message.success(common['common.success']);
        fetchData(page, pageSize);
      }
    });
  };

  /**
   * 全体禁言 / 解除 — postV1AdminGroupsMute（改 mute_all，不改生命周期 status）
   */
  const confirmMute = (row: GroupListRow, enabled: boolean) => {
    const group_id = row.group?.group_id;
    if (!group_id) return;
    const name = row.group?.title || group_id;
    const kind = enabled ? 'mute' : 'unmute';
    Modal.confirm({
      title: t[`groupQuery.confirm.${kind}`].replace('{name}', name),
      onOk: async () => {
        await postV1AdminGroupsMute({ group_id, enabled });
        Message.success(common['common.success']);
        fetchData(page, pageSize);
      }
    });
  };

  /**
   * 按群状态 / mute_all 组装更多菜单（详情始终外露）
   * 已解散无操作；已封禁仅解封；其余可封禁 / 禁言(mute_all)
   */
  const buildStatusActions = (row: GroupListRow) => {
    const status = row.group?.status;
    if (status === 2) return [];
    if (status === 1) {
      return [
        {
          key: 'unban',
          label: t['groupQuery.action.unban'],
          onClick: () => confirmBan(row, false)
        }
      ];
    }
    const muted = !!row.group?.mute_all || status === 3;
    if (muted) {
      return [
        {
          key: 'unmute',
          label: t['groupQuery.action.unmute'],
          onClick: () => confirmMute(row, false)
        },
        {
          key: 'ban',
          label: t['groupQuery.action.ban'],
          onClick: () => confirmBan(row, true)
        }
      ];
    }
    return [
      {
        key: 'ban',
        label: t['groupQuery.action.ban'],
        onClick: () => confirmBan(row, true)
      },
      {
        key: 'mute',
        label: t['groupQuery.action.mute'],
        onClick: () => confirmMute(row, true)
      }
    ];
  };

  return (
    <>
      <BizListPage
        form={form}
        title={t['groupQuery.title']}
        filterCollapsible={false}
        filterDefaultCollapsed={false}
        filterResetText={common['common.reset']}
        filterExtraActions={
          batchMode ? (
            <Button
              type="text"
              className="use-biz-filter-action-text is-danger"
              onClick={exitBatchMode}
            >
              {t['groupQuery.action.cancelBatchSearch']}
            </Button>
          ) : (
            <Button
              type="text"
              className="use-biz-filter-action-text"
              onClick={() => setBatchMode(true)}
            >
              {t['groupQuery.action.batchSearch']}
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
                        {t['groupQuery.filter.groupIds']}
                      </span>
                      <span className="use-biz-filter-label-hint">
                        {t['groupQuery.filter.groupIdsHint']}
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
        onSearch={() => {
          setPage(1);
          fetchData(1, pageSize);
        }}
        onReset={() => {
          form.resetFields();
          setBatchMode(false);
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
                  text={imLabel(t, 'groupStatus', row.group?.status)}
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
                const moreItems = buildStatusActions(row);
                return (
                  <ActionLinks
                    variant="text"
                    items={[
                      {
                        key: 'detail',
                        label: common['common.detail'],
                        onClick: () => setDetailGroupId(group_id)
                      },
                      ...moreItems
                    ]}
                  />
                );
              }
            }
          ],
          pagination: batchMode
            ? false
            : {
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
