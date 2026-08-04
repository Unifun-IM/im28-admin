import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form } from '@arco-design/web-react';
import { IconCloseCircle } from '@arco-design/web-react/icon';
import {
  ActionLinks,
  BatchBarAction,
  BizListPage,
  FilterDateRange,
  FilterField,
  FilterKeywordInput
} from '@widgets/biz-list';
import {
  AddIpBlacklistModal,
  BatchReleaseIpBlacklistModal,
  ReleaseIpBlacklistModal
} from '@features/ip-blacklist-action';
import { postV1AdminRiskIpBlacklistList } from '@shared/api/admin/adminfengkongguanli';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

type KeywordType = 'ip';

type IpBlacklistForm = {
  keyword?: string;
  keyword_type?: KeywordType;
  created_at?: unknown[];
};

type IpBlacklistRow = AdminAPI.AdminIPBlacklistEntry;

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

function operatorName(op?: AdminAPI.SysUser) {
  return op?.display_name || op?.username || (op?.id != null ? String(op.id) : '--');
}

/**
 * 风控 · IP黑名单 — Figma 979:39791
 * 批量选中 979:43610 / 批量解除弹窗 979:42912
 */
export default function IpBlacklistPage() {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<IpBlacklistForm>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IpBlacklistRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    []
  );
  const [addVisible, setAddVisible] = useState(false);
  const [releaseIp, setReleaseIp] = useState<string | null>(null);
  const [batchReleaseIps, setBatchReleaseIps] = useState<string[] | null>(
    null
  );

  const keywordTypeOptions = useMemo(
    () =>
      (['ip'] as const).map((value) => ({
        label: t[`ipBlacklist.filter.keywordType.${value}`],
        value
      })),
    [t]
  );

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const kw = String(values.keyword || '').trim();
        const range = values.created_at;
        const res = await postV1AdminRiskIpBlacklistList({
          page: p,
          page_size: size,
          ip_address: kw || undefined,
          operated_start_at: range?.[0] ? toRfc3339(range[0]) : undefined,
          operated_end_at: range?.[1] ? toRfc3339(range[1]) : undefined
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

  const refresh = () => {
    setSelectedRowKeys([]);
    fetchData(page, pageSize);
  };

  const openBatchRelease = (keys: (string | number)[]) => {
    const keySet = new Set(keys.map(String));
    const ips = data
      .filter((r) => r.ip_address && keySet.has(r.ip_address))
      .map((r) => r.ip_address as string);
    if (!ips.length) return;
    setBatchReleaseIps(ips);
  };

  return (
    <>
      <BizListPage
        form={form}
        title={t['ipBlacklist.title']}
        filterResetText={common['common.reset']}
        filter={
          <>
            <FilterField span={2}>
              <FormItem
                field="keyword"
                label={t['ipBlacklist.filter.keyword']}
              >
                <FilterKeywordInput
                  typeField="keyword_type"
                  typeOptions={keywordTypeOptions}
                  typeInitialValue="ip"
                  typeWidth={100}
                  placeholder={t['ipBlacklist.filter.placeholder.ip']}
                />
              </FormItem>
            </FilterField>
            <FilterField span={2}>
              <FormItem
                field="created_at"
                label={t['ipBlacklist.filter.createdAt']}
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
          form.setFieldsValue({ keyword_type: 'ip' });
          setPage(1);
          fetchData(1, pageSize);
        }}
        onRefresh={() => fetchData(page, pageSize)}
        toolbarAlways={
          <Button type="primary" onClick={() => setAddVisible(true)}>
            {t['ipBlacklist.action.add']}
          </Button>
        }
        batchActions={{
          onExit: () => setSelectedRowKeys([]),
          extra: (
            <BatchBarAction
              status="danger"
              icon={<IconCloseCircle />}
              onClick={() => openBatchRelease(selectedRowKeys)}
            >
              {t['ipBlacklist.action.batchRelease']}
            </BatchBarAction>
          )
        }}
        tableProps={{
          loading,
          data,
          rowKey: (row: IpBlacklistRow) => row.ip_address || String(Math.random()),
          columns: [
            {
              title: t['ipBlacklist.col.ip'],
              dataIndex: 'ip_address',
              width: 160,
              render: (v: string) => v || '--'
            },
            {
              title: t['ipBlacklist.col.reason'],
              dataIndex: 'reason',
              render: (_: unknown, row: IpBlacklistRow) =>
                row.reason_description
                  ? `${row.reason || '--'}（${row.reason_description}）`
                  : row.reason || '--'
            },
            {
              title: t['ipBlacklist.col.hitCount'],
              width: 120,
              render: () => '--'
            },
            {
              title: t['ipBlacklist.col.lastAccessAt'],
              dataIndex: 'last_accessed_at',
              width: 170,
              render: (v: string) => formatDateTime(v)
            },
            {
              title: t['ipBlacklist.col.createdAt'],
              dataIndex: 'operated_at',
              width: 170,
              render: (v: string) => formatDateTime(v)
            },
            {
              title: t['ipBlacklist.col.creator'],
              width: 120,
              render: (_: unknown, row: IpBlacklistRow) =>
                operatorName(row.operator)
            },
            {
              title: common['common.action'],
              dataIndex: 'op',
              width: 80,
              render: (_: unknown, row: IpBlacklistRow) => (
                <ActionLinks
                  variant="text"
                  items={[
                    {
                      key: 'release',
                      label: t['ipBlacklist.action.release'],
                      onClick: () =>
                        row.ip_address && setReleaseIp(row.ip_address)
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
      <AddIpBlacklistModal
        visible={addVisible}
        onCancel={() => setAddVisible(false)}
        onSuccess={refresh}
      />
      <ReleaseIpBlacklistModal
        visible={!!releaseIp}
        ip={releaseIp}
        onCancel={() => setReleaseIp(null)}
        onSuccess={refresh}
      />
      <BatchReleaseIpBlacklistModal
        visible={!!batchReleaseIps?.length}
        ips={batchReleaseIps || []}
        onCancel={() => setBatchReleaseIps(null)}
        onSuccess={refresh}
      />
    </>
  );
}
