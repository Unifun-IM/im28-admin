import React, { useCallback, useEffect, useState } from 'react';
import { Form, Button, Message, Modal } from '@arco-design/web-react';
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

const FormItem = Form.Item;

function groupStatusBadge(
  status?: AdminAPI.GroupStatus
): 'success' | 'error' | 'warning' | 'default' {
  if (status === 1) return 'success';
  if (status === 2) return 'error';
  if (status === 3) return 'warning';
  return 'default';
}

/** 群列表 — AdminAPI.AdminListGroupRequest / { group?: Group } */
export default function GroupQueryPage() {
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
        title="群组列表"
        filterCollapsible={false}
        filterDefaultCollapsed={false}
        filterResetText="清除全部"
        filter={
          <>
            <FilterField>
              <FormItem field="keyword" label="keyword">
                <FilterInput placeholder="keyword" />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="status" label="status">
                <FilterSelect
                  placeholder="status"
                  options={[
                    { label: '全部', value: '' },
                    { label: '0', value: '0' },
                    { label: '1', value: '1' },
                    { label: '2', value: '2' },
                    { label: '3', value: '3' }
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
              title: 'group',
              dataIndex: 'group.title',
              render: (_: unknown, row: { group?: AdminAPI.Group }) => (
                <AvatarNameCell
                  name={row.group?.title}
                  sub={`group_id：${row.group?.group_id || ''}`}
                  copyText={row.group?.group_id || ''}
                  avatar={row.group?.avatar_url}
                />
              )
            },
            {
              title: 'owner_user_id',
              dataIndex: 'group.owner_user_id',
              render: (_: unknown, row: { group?: AdminAPI.Group }) =>
                row.group?.owner_user_id || '--'
            },
            {
              title: 'member_count',
              dataIndex: 'group.member_count',
              render: (_: unknown, row: { group?: AdminAPI.Group }) =>
                row.group?.member_count ?? '--'
            },
            {
              title: 'status',
              dataIndex: 'group.status',
              render: (_: unknown, row: { group?: AdminAPI.Group }) => (
                <StatusBadge
                  status={groupStatusBadge(row.group?.status)}
                  text={String(row.group?.status ?? '--')}
                />
              )
            },
            {
              title: '操作',
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
                        label: '详情',
                        onClick: () => setDetailGroupId(group_id)
                      },
                      {
                        key: 'chat',
                        label: '聊天',
                        onClick: () => setChatOpen(true)
                      },
                      {
                        key: 'status',
                        label: '改状态',
                        onClick: () => {
                          Modal.confirm({
                            title: 'update-status status=1?',
                            onOk: async () => {
                              await postV1AdminGroupsUpdateStatus({
                                group_id,
                                status: 1
                              });
                              Message.success('ok');
                              fetchData(page, pageSize);
                            }
                          });
                        }
                      },
                      {
                        key: 'upgrade',
                        label: '升级',
                        onClick: () => {
                          Modal.confirm({
                            title: 'upgrade group?',
                            onOk: async () => {
                              await postV1AdminGroupsUpgrade({ group_id });
                              Message.success('ok');
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
