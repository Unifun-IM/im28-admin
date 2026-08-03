import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form } from '@arco-design/web-react';
import { IconCheckCircle } from '@arco-design/web-react/icon';
import {
  ActionLinks,
  AvatarNameCell,
  BatchBarAction,
  BizListPage,
  FilterField,
  FilterKeywordInput,
  StatusBadge
} from '@widgets/biz-list';
import { postV1AdminUsersList } from '@shared/api/admin/users';
import { BlacklistActionModal } from '@features/user-blacklist-action';
import { UserDetailDrawer } from '@features/user-detail';
import useLocale from '@shared/lib/useLocale';


const FormItem = Form.Item;

/** 黑名单 — 用户列表 status=disabled */
export default function Page() {
  const t = useLocale();
  const common = t;

  const keywordTypeOptions = useMemo(
    () =>
      (
        [
          'user_id',
          'nickname',
          'phone',
          'email',
          'account'
        ] as const
      ).map((value) => ({
        label: t[`blacklist.keywordType.${value}`],
        value
      })),
    [t]
  );

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
        const keyword = values.keyword || undefined;
        const res = await postV1AdminUsersList({
          page: p,
          page_size: size,
          status: 'disabled',
          keyword,
          keyword_type: keyword ? values.keyword_type || undefined : undefined
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
        title={t['blacklist.title']}
        filter={
          <FilterField>
            <FormItem field="keyword" label={common['common.keyword']}>
              <FilterKeywordInput
                typeField="keyword_type"
                typeOptions={keywordTypeOptions}
                typeInitialValue="user_id"
                typeWidth={100}
                placeholder={common['common.placeholder']}
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
        batchActions={{
          onExit: () => setSelectedRowKeys([]),
          extra: (
            <BatchBarAction
              status="success"
              icon={<IconCheckCircle />}
              onClick={() =>
                setRemoveModal({
                  userIds: selectedRowKeys.map(String),
                  variant: 'batch'
                })
              }
            >
              {t['blacklist.action.batchUnban']}
            </BatchBarAction>
          )
        }}
        tableProps={{
          loading,
          data,
          rowKey: (row: AdminAPI.AdminUserWrap) =>
            row.user?.user_id || String(Math.random()),
          columns: [
            {
              title: t['blacklist.col.user'],
              ellipsis: false,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <AvatarNameCell
                  name={row.user?.nickname}
                  sub={`${t['blacklist.cell.userId']}：${row.user?.user_id || ''}`}
                  copyText={row.user?.user_id || ''}
                  avatar={row.user?.avatar_url}
                  userId={row.user?.user_id}
                  nameClassName="!text-[rgb(var(--link-6))]"
                  onNameClick={() =>
                    setDetailUserId(row.user?.user_id || null)
                  }
                />
              )
            },
            {
              title: common['common.status'],
              ellipsis: false,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <StatusBadge
                  status="error"
                  text={t['blacklist.status.disabled']}
                />
              )
            },
            {
              title: common['common.action'],
              width: 120,
              render: (_: unknown, row: AdminAPI.AdminUserWrap) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'unban',
                      label: t['blacklist.action.unban'],
                      onClick: () =>
                        setRemoveModal({
                          userIds: [row.user?.user_id || ''],
                          variant: 'single'
                        })
                    },
                    {
                      key: 'detail',
                      label: common['common.detail'],
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
