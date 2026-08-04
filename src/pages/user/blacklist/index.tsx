import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Input } from '@arco-design/web-react';
import { IconCheckCircle } from '@arco-design/web-react/icon';
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
import { postV1AdminUsersBlacklistList } from '@shared/api/admin/users';
import { BlacklistActionModal } from '@features/user-blacklist-action';
import { UserDetailDrawer } from '@features/user-detail';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

const BAN_REASON_KEYS = ['fraud', 'spam', 'abuse', 'other'] as const;

type BlacklistForm = {
  keyword?: string;
  keyword_type?: AdminAPI.AdminListBannedUserRequest['keyword_type'];
  reason?: string;
  operated_at?: unknown[];
  batchUserIds?: string;
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

function parseBatchIds(raw?: string) {
  return String(raw || '')
    .split(/[\s,，]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 100);
}

/**
 * 黑名单列表 — Figma 796:19067；批量搜索/操作 804:20186
 * @see postV1AdminUsersBlacklistList
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
        label: t[`blacklist.keywordType.${value}`],
        value
      })),
    [t]
  );

  const reasonOptions = useMemo(
    () => [
      { label: t['blacklist.filter.all'], value: '' },
      ...BAN_REASON_KEYS.map((key) => ({
        label: t[`blacklistAction.reason.${key}`],
        value: t[`blacklistAction.reason.${key}`]
      }))
    ],
    [t]
  );

  const [form] = Form.useForm<BlacklistForm>();
  const [loading, setLoading] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [data, setData] = useState<AdminAPI.AdminBannedUserWrap[]>([]);
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

  const buildTimeRange = useCallback(() => {
    const range = form.getFieldValue('operated_at') as unknown[] | undefined;
    return {
      operated_start_at: range?.[0] ? toRfc3339(range[0]) : undefined,
      operated_end_at: range?.[1] ? toRfc3339(range[1]) : undefined
    };
  }, [form]);

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const reasonFilter = String(values.reason || '').trim();
        const time = buildTimeRange();

        let list: AdminAPI.AdminBannedUserWrap[] = [];
        let nextTotal = 0;

        if (batchMode) {
          const ids = parseBatchIds(values.batchUserIds);
          if (!ids.length) {
            setData([]);
            setTotal(0);
            return;
          }
          const results = await Promise.all(
            ids.map((id) =>
              postV1AdminUsersBlacklistList({
                keyword: id,
                keyword_type: 'user_id',
                ...time,
                page: 1,
                page_size: 1
              })
            )
          );
          const seen = new Set<string>();
          results.forEach((res) => {
            (res.data?.list || []).forEach((row) => {
              const uid = row.user?.user_id;
              if (!uid || seen.has(uid)) return;
              seen.add(uid);
              list.push(row);
            });
          });
          nextTotal = list.length;
        } else {
          const keyword = values.keyword?.trim() || undefined;
          const res = await postV1AdminUsersBlacklistList({
            page: p,
            page_size: size,
            keyword,
            keyword_type: keyword
              ? values.keyword_type || undefined
              : undefined,
            ...time
          });
          list = res.data?.list || [];
          nextTotal = res.data?.total || 0;
        }

        // 契约暂无 reason 筛选；按当前页/结果集本地过滤
        if (reasonFilter) {
          list = list.filter((row) => row.reason === reasonFilter);
        }

        setData(list);
        setTotal(nextTotal);
      } finally {
        setLoading(false);
      }
    },
    [batchMode, buildTimeRange, form, page, pageSize]
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
          field="reason"
          label={t['blacklist.filter.reason']}
          initialValue=""
        >
          <FilterSelect
            placeholder={t['blacklist.filter.all']}
            options={reasonOptions}
            allowClear
          />
        </FormItem>
      </FilterField>
      <FilterField span={2}>
        <FormItem field="operated_at" label={t['blacklist.filter.operatedAt']}>
          <FilterDateRange showTime />
        </FormItem>
      </FilterField>
    </>
  );

  return (
    <>
      <BizListPage
        form={form}
        title={t['blacklist.title']}
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
                form.setFieldValue('batchUserIds', undefined);
              }}
            >
              {t['blacklist.action.cancelBatchSearch']}
            </Button>
          ) : (
            <Button
              type="text"
              className="use-biz-filter-action-text"
              onClick={() => setBatchMode(true)}
            >
              {t['blacklist.action.batchSearch']}
            </Button>
          )
        }
        filter={
          batchMode ? (
            <>
              <FilterField span="full">
                <FormItem
                  field="batchUserIds"
                  label={
                    <>
                      <span className="use-biz-filter-label-title">
                        {t['blacklist.filter.userIds']}
                      </span>
                      <span className="use-biz-filter-label-hint">
                        {t['blacklist.filter.userIdsHint']}
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
                  label={t['blacklist.filter.keyword']}
                >
                  <FilterKeywordInput
                    typeField="keyword_type"
                    typeOptions={keywordTypeOptions}
                    typeInitialValue="user_id"
                    typeWidth={100}
                    placeholder={t['blacklist.filter.placeholder']}
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
          rowKey: (row: AdminAPI.AdminBannedUserWrap) =>
            row.user?.user_id || String(Math.random()),
          columns: [
            {
              title: t['blacklist.col.user'],
              ellipsis: false,
              render: (_: unknown, row: AdminAPI.AdminBannedUserWrap) => (
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
              title: t['blacklist.col.contact'],
              ellipsis: false,
              render: (_: unknown, row: AdminAPI.AdminBannedUserWrap) => (
                <DoubleLineCell
                  primary={`${t['blacklist.cell.phone']}：${row.user?.phone || '--'}`}
                  secondary={`${t['blacklist.cell.email']}：${row.user?.email || '--'}`}
                />
              )
            },
            {
              title: t['blacklist.col.account'],
              width: 120,
              render: (_: unknown, row: AdminAPI.AdminBannedUserWrap) =>
                row.user?.account || '--'
            },
            {
              title: t['blacklist.col.operator'],
              width: 120,
              render: (_: unknown, row: AdminAPI.AdminBannedUserWrap) =>
                row.operator?.display_name ||
                row.operator?.username ||
                '--'
            },
            {
              title: t['blacklist.col.operatedAt'],
              width: 180,
              render: (_: unknown, row: AdminAPI.AdminBannedUserWrap) =>
                formatDateTime(row.operated_at)
            },
            {
              title: t['blacklist.col.reason'],
              width: 120,
              ellipsis: true,
              render: (_: unknown, row: AdminAPI.AdminBannedUserWrap) =>
                row.reason || '--'
            },
            {
              title: t['blacklist.col.reasonDescription'],
              ellipsis: true,
              render: (_: unknown, row: AdminAPI.AdminBannedUserWrap) =>
                row.reason_description || '--'
            },
            {
              title: common['common.action'],
              width: 120,
              fixed: 'right' as const,
              render: (_: unknown, row: AdminAPI.AdminBannedUserWrap) => (
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
