import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Message, Modal } from '@arco-design/web-react';
import {
  ActionLinks,
  AvatarNameCell,
  BizListPage,
  FilterField,
  FilterInput,
  FilterSelect,
  StatusBadge
} from '@widgets/biz-list';
import {
  postV1AdminGroupsList,
  postV1AdminGroupsUpdateStatus,
  postV1AdminGroupsUpgrade
} from '@shared/api/admin/groups';
import { GroupDetailDrawer } from '@features/group-detail';
import { UserChatModal } from '@features/user-chat-view';
import useLocale from '@shared/lib/useLocale';
import { openimLabel } from '@shared/lib/openimLabels';

const FormItem = Form.Item;

/** OpenIM GroupStatus：0 正常 / 1 封禁 / 2 解散 / 3 禁言 */
function groupStatusBadge(
  status?: AdminAPI.GroupStatus
): 'success' | 'error' | 'warning' | 'default' {
  if (status === 0) return 'success';
  if (status === 1) return 'error';
  if (status === 2 || status === 3) return 'warning';
  return 'default';
}

/** 群列表 — AdminAPI.AdminListGroupRequest / { group?: Group } */
export default function GroupQueryPage() {
  const t = useLocale();
  const common = t;

  type GroupListForm = {
    keyword?: string;
    /** Select 用字符串，请求时再转 GroupStatus */
    status?: '' | '0' | '1' | '2' | '3';
  };

  const [form] = Form.useForm<GroupListForm>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ group?: AdminAPI.Group }[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailGroupId, setDetailGroupId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const statusOptions = useMemo(
    () =>
      (['0', '1', '2', '3'] as const).map((value) => ({
        label: openimLabel(t, 'groupStatus', value),
        value
      })),
    [t]
  );

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await postV1AdminGroupsList({
          page: p,
          page_size: size,
          keyword: values.keyword || undefined,
          status:
            values.status === '' || values.status === undefined
              ? undefined
              : (Number(values.status) as AdminAPI.GroupStatus)
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
        title={t['groupQuery.title']}
        filterCollapsible={false}
        filterDefaultCollapsed={false}
        filterResetText={common['common.clearAll']}
        filter={
          <>
            <FilterField>
              <FormItem field="keyword" label={common['common.keyword']}>
                <FilterInput placeholder={common['common.placeholder']} />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="status" label={common['common.status']}>
                <FilterSelect
                  placeholder={common['common.status']}
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
          rowKey: (row: { group?: AdminAPI.Group }) =>
            row.group?.group_id || String(Math.random()),
          columns: [
            {
              title: t['groupQuery.col.group'],
              dataIndex: 'group.title',
              render: (_: unknown, row: { group?: AdminAPI.Group }) => (
                <AvatarNameCell
                  name={row.group?.title}
                  sub={`${t['groupQuery.cell.groupId']}：${row.group?.group_id || ''}`}
                  copyText={row.group?.group_id || ''}
                  avatar={row.group?.avatar_url}
                />
              )
            },
            {
              title: t['groupQuery.col.ownerUserId'],
              dataIndex: 'group.owner_user_id',
              render: (_: unknown, row: { group?: AdminAPI.Group }) =>
                row.group?.owner_user_id || '--'
            },
            {
              title: t['groupQuery.col.memberCount'],
              dataIndex: 'group.member_count',
              render: (_: unknown, row: { group?: AdminAPI.Group }) =>
                row.group?.member_count ?? '--'
            },
            {
              title: common['common.status'],
              dataIndex: 'group.status',
              render: (_: unknown, row: { group?: AdminAPI.Group }) => (
                <StatusBadge
                  status={groupStatusBadge(row.group?.status)}
                  text={openimLabel(t, 'groupStatus', row.group?.status)}
                />
              )
            },
            {
              title: common['common.action'],
              dataIndex: 'op',
              width: 220,
              render: (_: unknown, row: { group?: AdminAPI.Group }) => {
                const group_id = row.group?.group_id || '';
                return (
                  <ActionLinks
                    variant="text"
                    items={[
                      {
                        key: 'detail',
                        label: common['common.detail'],
                        onClick: () => setDetailGroupId(group_id)
                      },
                      {
                        key: 'chat',
                        label: t['groupQuery.action.chat'],
                        onClick: () => setChatOpen(true)
                      },
                      {
                        key: 'status',
                        label: t['groupQuery.action.changeStatus'],
                        onClick: () => {
                          Modal.confirm({
                            title: t['groupQuery.confirm.updateStatus'],
                            onOk: async () => {
                              await postV1AdminGroupsUpdateStatus({
                                group_id,
                                status: 0
                              });
                              Message.success(common['common.success']);
                              fetchData(page, pageSize);
                            }
                          });
                        }
                      },
                      {
                        key: 'upgrade',
                        label: t['groupQuery.action.upgrade'],
                        onClick: () => {
                          Modal.confirm({
                            title: t['groupQuery.confirm.upgrade'],
                            onOk: async () => {
                              await postV1AdminGroupsUpgrade({ group_id });
                              Message.success(common['common.success']);
                              fetchData(page, pageSize);
                            }
                          });
                        }
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
      />
      <UserChatModal
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
        scene="group"
        userId={null}
      />
    </>
  );
}
