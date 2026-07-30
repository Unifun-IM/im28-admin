import React, { useCallback, useEffect, useState } from 'react';
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
import { GroupDetailDrawer } from '@features/group-detail';
import { getGroupSessions } from '@shared/api/biz';

const FormItem = Form.Item;

const GROUP_KEYWORD_OPTIONS = [
  { label: '群ID', value: 'groupId' },
  { label: '名称', value: 'name' }
];

const GROUP_STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '正常', value: '正常' },
  { label: '已解散', value: '已解散' },
  { label: '封禁', value: '封禁' }
];

function statusToBadge(v: string): 'success' | 'error' | 'warning' | 'default' {
  if (v === '正常') return 'success';
  if (v === '封禁') return 'error';
  if (v === '已解散') return 'warning';
  return 'default';
}

/**
 * 群聊会话查询 — Figma 741:30572
 * 详情 Drawer — Figma 666:22243 / 755:13957 / 666:22310 / 666:22396
 */
export default function GroupQueryPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [detailGroupId, setDetailGroupId] = useState<string | null>(null);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await getGroupSessions({
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

  const openDetail = (row: Record<string, unknown>) => {
    setDetailGroupId(String(row.id || row.groupId || ''));
  };

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
              <FormItem field="keyword" label="群关键词搜索">
                <FilterKeywordInput
                  typeField="keywordType"
                  typeOptions={GROUP_KEYWORD_OPTIONS}
                  typeInitialValue="groupId"
                  typeWidth={80}
                  placeholder="请输入"
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="ownerId" label="群主ID">
                <FilterInput
                  showSearchIcon
                  placeholder="请输入9位用户ID"
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem field="status" label="群状态" initialValue="">
                <FilterSelect
                  placeholder="全部"
                  options={GROUP_STATUS_OPTIONS}
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
              title: '群信息',
              dataIndex: 'name',
              width: 223,
              ellipsis: false,
              render: (_: unknown, row: Record<string, unknown>) => (
                <AvatarNameCell
                  name={row.name as string}
                  sub={`群ID：${row.groupId}`}
                  copyText={String(row.groupId || '')}
                  avatar={row.avatar as string | undefined}
                  nameClassName="!text-[rgb(var(--link-6))]"
                  onNameClick={() => openDetail(row)}
                />
              )
            },
            {
              title: '群主',
              dataIndex: 'ownerName',
              width: 223,
              ellipsis: false,
              render: (_: unknown, row: Record<string, unknown>) => (
                <AvatarNameCell
                  name={row.ownerName as string}
                  sub={`ID：${row.ownerId}`}
                  copyText={String(row.ownerId || '')}
                  avatar={row.ownerAvatar as string | undefined}
                />
              )
            },
            {
              title: '群成员数',
              dataIndex: 'memberCount',
              width: 140,
              sorter: (a, b) =>
                Number(a.memberCount || 0) - Number(b.memberCount || 0)
            },
            {
              title: '群状态',
              dataIndex: 'status',
              width: 120,
              render: (v: string) => (
                <StatusBadge status={statusToBadge(v)} text={v} />
              )
            },
            {
              title: '群创建时间',
              dataIndex: 'createdAt',
              width: 180,
              sorter: (a, b) =>
                String(a.createdAt || '').localeCompare(
                  String(b.createdAt || '')
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
                      key: 'detail',
                      label: '详情',
                      onClick: () => openDetail(row)
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
      <GroupDetailDrawer
        visible={!!detailGroupId}
        groupId={detailGroupId}
        onClose={() => setDetailGroupId(null)}
      />
    </>
  );
}
