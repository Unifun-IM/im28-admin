import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Button } from '@arco-design/web-react';
import {
  ActionLinks,
  AvatarNameCell,
  BizListPage,
  FilterField,
  FilterKeywordInput
} from '@widgets/biz-list';
import { postV1AdminUsersWhitelistList } from '@shared/api/admin/users';
import { WhitelistActionModal } from '@features/user-whitelist-action';
import { UserDetailDrawer } from '@features/user-detail';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

/** 白名单 — AdminListWhitelistedUserRequest / AdminWhitelistedUserWrap */
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
        label: t[`whitelist.keywordType.${value}`],
        value
      })),
    [t]
  );

  const [form] = Form.useForm<AdminAPI.AdminListWhitelistedUserRequest>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminAPI.AdminWhitelistedUserWrap[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    []
  );
  const [actionModal, setActionModal] = useState<{
    mode: 'add' | 'remove';
    variant: 'single' | 'batch';
    userIds: string[];
  } | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const keyword = values.keyword || undefined;
        const res = await postV1AdminUsersWhitelistList({
          page: p,
          page_size: size,
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
        title={t['whitelist.title']}
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
        toolbarAlways={
          <Button
            type="primary"
            onClick={() =>
              setActionModal({ mode: 'add', variant: 'single', userIds: [] })
            }
          >
            {t['whitelist.action.add']}
          </Button>
        }
        toolbar={
          <Button
            type="primary"
            status="danger"
            disabled={!selectedRowKeys.length}
            onClick={() =>
              setActionModal({
                mode: 'remove',
                userIds: selectedRowKeys.map(String),
                variant: 'batch'
              })
            }
          >
            {t['whitelist.action.batchRemove']}
          </Button>
        }
        tableProps={{
          loading,
          data,
          rowKey: (row: AdminAPI.AdminWhitelistedUserWrap) =>
            row.user?.user_id || String(Math.random()),
          columns: [
            {
              title: t['whitelist.col.user'],
              render: (_: unknown, row: AdminAPI.AdminWhitelistedUserWrap) => (
                <AvatarNameCell
                  name={row.user?.nickname}
                  sub={`${t['whitelist.cell.userId']}：${row.user?.user_id || ''}`}
                  copyText={row.user?.user_id || ''}
                  avatar={row.user?.avatar_url}
                />
              )
            },
            {
              title: t['whitelist.col.reason'],
              dataIndex: 'reason',
              render: (v: string) => v || '--'
            },
            {
              title: t['whitelist.col.operatedAt'],
              dataIndex: 'operated_at',
              width: 180,
              render: (v: string) => formatDateTime(v)
            },
            {
              title: t['whitelist.col.operator'],
              width: 140,
              render: (_: unknown, row: AdminAPI.AdminWhitelistedUserWrap) =>
                row.operator?.display_name ||
                row.operator?.username ||
                '--'
            },
            {
              title: common['common.action'],
              width: 120,
              render: (_: unknown, row: AdminAPI.AdminWhitelistedUserWrap) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'remove',
                      label: t['whitelist.action.remove'],
                      onClick: () =>
                        setActionModal({
                          mode: 'remove',
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
      <WhitelistActionModal
        visible={!!actionModal}
        mode={actionModal?.mode || 'add'}
        variant={actionModal?.variant || 'single'}
        userIds={actionModal?.userIds || []}
        onCancel={() => setActionModal(null)}
        onSuccess={() => {
          setSelectedRowKeys([]);
          fetchData(page, pageSize);
        }}
      />
    </>
  );
}
