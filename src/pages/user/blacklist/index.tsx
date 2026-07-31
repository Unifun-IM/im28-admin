import React, { useCallback, useEffect, useState } from 'react';
import { Form, Button } from '@arco-design/web-react';
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
import { BlacklistActionModal } from '@features/user-blacklist-action';
import { UserDetailDrawer } from '@features/user-detail';

const FormItem = Form.Item;

const KEYWORD_TYPE_OPTIONS = [
  { label: 'user_id', value: 'user_id' },
  { label: 'nickname', value: 'nickname' },
  { label: 'phone', value: 'phone' },
  { label: 'email', value: 'email' },
  { label: 'account', value: 'account' }
];

/** 黑名单 — 用户列表 status=disabled */
export default function Page() {
  const [form] = Form.useForm<AdminAPI.AdminListUserRequest>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.AdminUserWrap[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    []
  );
  const [removeModal, setRemoveModal] = useState<{
    userIds: string[];
    variant: 'single' | 'batch';
  } | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const res = await postV1AdminUsersList({
          page: p,
          page_size: size,
          status: 'disabled',
          keyword: values.keyword || undefined,
          keyword_type: values.keyword_type || undefined
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
        title="黑名单列表"
        filter={
          <FilterField>
            <FormItem field="keyword" label="keyword">
              <FilterKeywordInput
                typeField="keyword_type"
                typeOptions={KEYWORD_TYPE_OPTIONS}
                typeInitialValue="user_id"
                typeWidth={100}
              />
            </FormItem>
          </FilterField>
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
        toolbar={
          <Button
            type="primary"
            disabled={!selectedRowKeys.length}
            onClick={() =>
              setRemoveModal({
                userIds: selectedRowKeys.map(String),
                variant: 'batch'
              })
            }
          >
            批量解禁
          </Button>
        }
        tableProps={{
          loading,
          data,
          rowKey: (row: AdminAPI.AdminUserWrap) =>
            row.user?.user_id || String(Math.random()),
          columns: [
            {
              title: 'user',
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <AvatarNameCell
                  name={row.user?.nickname}
                  sub={`user_id：${row.user?.user_id || ''}`}
                  copyText={row.user?.user_id || ''}
                  avatar={row.user?.avatar_url}
                />
              )
            },
            {
              title: 'status',
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <StatusBadge
                  status="error"
                  text={row.user?.status || 'disabled'}
                />
              )
            },
            {
              title: '操作',
              width: 120,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'unban',
                      label: '解禁',
                      onClick: () =>
                        setRemoveModal({
                          userIds: [row.user?.user_id || ''],
                          variant: 'single'
                        })
                    },
                    {
                      key: 'detail',
                      label: '详情',
                      onClick: () =>
                        setDetailUserId(row.user?.user_id || null)
                    }
                  ]}
                />
              )
            }
          ],
          rowSelection: {
            selectedRowKeys,
            onChange: setSelectedRowKeys
          },
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
      <BlacklistActionModal
        visible={!!removeModal}
        mode="remove"
        variant={removeModal?.variant || 'single'}
        userIds={removeModal?.userIds || []}
        onCancel={() => setRemoveModal(null)}
        onSuccess={() => {
          setSelectedRowKeys([]);
          fetchData(page, pageSize);
        }}
      />
    </>
  );
}
