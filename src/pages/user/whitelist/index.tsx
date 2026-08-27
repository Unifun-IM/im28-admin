import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Button } from '@arco-design/web-react';
import { IconCloseCircle } from '@arco-design/web-react/icon';
import {
  ActionLinks,
  AvatarNameCell,
  BatchBarAction,
  BizListPage,
  DoubleLineCell,
  FilterDateRange,
  FilterField,
  FilterKeywordInput,
  FilterSelect
} from '@widgets/biz-list';
import { postV1AdminUsersWhitelistList } from '@shared/api/admin/users';
import { WhitelistActionModal } from '@features/user-whitelist-action';
import { UserDetailDrawer } from '@widgets/user-detail';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

type WhitelistForm = {
  keyword?: string;
  keyword_type?: AdminAPI.AdminListWhitelistedUserRequest['keyword_type'];
  reason?: string;
  operated_at?: unknown[];
};

type WhitelistRow = AdminAPI.AdminWhitelistedUserWrap & {
  reason_description?: string;
};

function toRfc3339(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  const raw =
    typeof (value as { toDate?: () => Date }).toDate === 'function'
      ? (value as { toDate: () => Date }).toDate()
      : value;
  const d = raw instanceof Date ? raw : new Date(raw as string | number);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/**
 * 白名单列表 — Figma 796:20718
 * @see postV1AdminUsersWhitelistList
 */
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

  const reasonOptions = useMemo(
    () => [{ label: t['whitelist.filter.all'], value: '' }],
    [t]
  );

  const [form] = Form.useForm<WhitelistForm>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WhitelistRow[]>([]);
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
        const keyword = values.keyword?.trim() || undefined;
        const range = values.operated_at as unknown[] | undefined;
        const reasonFilter = String(values.reason || '').trim();

        const res = await postV1AdminUsersWhitelistList({
          page: p,
          page_size: size,
          keyword,
          keyword_type: keyword
            ? values.keyword_type || undefined
            : undefined,
          operated_start_at: range?.[0] ? toRfc3339(range[0]) : undefined,
          operated_end_at: range?.[1] ? toRfc3339(range[1]) : undefined
        });

        let list: WhitelistRow[] = res.data?.list || [];
        const nextTotal = res.data?.total || 0;

        // 契约暂无 reason 筛选；按当前页结果本地过滤（选项待业务枚举补齐）
        if (reasonFilter) {
          list = list.filter((row) => row.reason === reasonFilter);
        }

        setData(list);
        setTotal(nextTotal);
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
        filterCollapsible={false}
        filterDefaultCollapsed={false}
        filterResetText={common['common.reset']}
        filter={
          <>
            <FilterField>
              <FormItem
                field="keyword"
                label={t['whitelist.filter.keyword']}
              >
                <FilterKeywordInput
                  typeField="keyword_type"
                  typeOptions={keywordTypeOptions}
                  typeInitialValue="user_id"
                  typeWidth={100}
                  placeholder={t['whitelist.filter.placeholder']}
                />
              </FormItem>
            </FilterField>
            <FilterField>
              <FormItem
                field="reason"
                label={t['whitelist.filter.reason']}
                initialValue=""
              >
                <FilterSelect
                  placeholder={t['whitelist.filter.all']}
                  options={reasonOptions}
                  allowClear
                />
              </FormItem>
            </FilterField>
            <FilterField span={2}>
              <FormItem
                field="operated_at"
                label={t['whitelist.filter.operatedAt']}
              >
                <FilterDateRange showTime />
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
        batchActions={{
          onExit: () => setSelectedRowKeys([]),
          extra: (
            <BatchBarAction
              status="danger"
              icon={<IconCloseCircle />}
              onClick={() =>
                setActionModal({
                  mode: 'remove',
                  userIds: selectedRowKeys.map(String),
                  variant: 'batch'
                })
              }
            >
              {t['whitelist.action.batchRemove']}
            </BatchBarAction>
          )
        }}
        tableProps={{
          loading,
          data,
          rowKey: (row: WhitelistRow) =>
            row.user?.user_id || String(Math.random()),
          columns: [
            {
              title: t['whitelist.col.user'],
              ellipsis: false,
              render: (_: unknown, row: WhitelistRow) => (
                <AvatarNameCell
                  name={row.user?.nickname}
                  sub={`${t['whitelist.cell.userId']}：${row.user?.user_id || ''}`}
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
              title: t['whitelist.col.contact'],
              ellipsis: false,
              render: (_: unknown, row: WhitelistRow) => (
                <DoubleLineCell
                  primary={`${t['whitelist.cell.phone']}：${row.user?.phone || '--'}`}
                  secondary={`${t['whitelist.cell.email']}：${row.user?.email || '--'}`}
                />
              )
            },
            {
              title: t['whitelist.col.account'],
              width: 120,
              render: (_: unknown, row: WhitelistRow) =>
                row.user?.account || '--'
            },
            {
              title: t['whitelist.col.operator'],
              width: 120,
              render: (_: unknown, row: WhitelistRow) =>
                row.operator?.display_name ||
                row.operator?.username ||
                '--'
            },
            {
              title: t['whitelist.col.operatedAt'],
              width: 180,
              render: (_: unknown, row: WhitelistRow) =>
                formatDateTime(row.operated_at)
            },
            {
              title: t['whitelist.col.reason'],
              width: 120,
              ellipsis: true,
              render: (_: unknown, row: WhitelistRow) => row.reason || '--'
            },
            {
              title: t['whitelist.col.reasonDescription'],
              ellipsis: true,
              render: (_: unknown, row: WhitelistRow) =>
                row.reason_description || '--'
            },
            {
              title: common['common.action'],
              width: 88,
              fixed: 'right' as const,
              render: (_: unknown, row: WhitelistRow) => (
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
