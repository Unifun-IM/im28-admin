import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Message } from '@arco-design/web-react';
import { IconCloseCircle } from '@arco-design/web-react/icon';
import {
  ActionLinks,
  BizListPage,
  FilterDateRange,
  FilterField,
  FilterKeywordInput
} from '@widgets/biz-list';
import {
  AddIpBlacklistModal,
  BatchReleaseIpBlacklistModal,
  ReleaseIpBlacklistModal,
  type AddIpBlacklistPayload,
  type BatchReleaseIpBlacklistPayload,
  type ReleaseIpBlacklistPayload
} from '@features/ip-blacklist-action';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';

const FormItem = Form.Item;

type KeywordType = 'ip' | 'user_id';

type IpBlacklistForm = {
  keyword?: string;
  keyword_type?: KeywordType;
  created_at?: string[];
};

type IpBlacklistRow = {
  id: string;
  ip: string;
  reason: string;
  hit_count: number;
  last_access_at: string;
  created_at: string;
  creator: string;
};

/** Figma 979:39791 示例数据；接口就绪后替换 */
const INITIAL_ROWS: IpBlacklistRow[] = [
  {
    id: '1',
    ip: '45.33.12.87',
    reason: '高频请求异常',
    hit_count: 328,
    last_access_at: '2026-03-18 14:22:11',
    created_at: '2026-03-10 09:15:00',
    creator: 'admin'
  },
  {
    id: '2',
    ip: '103.27.198.44',
    reason: '多次登录失败',
    hit_count: 96,
    last_access_at: '2026-03-18 11:08:45',
    created_at: '2026-03-12 16:40:22',
    creator: 'admin'
  },
  {
    id: '3',
    ip: '192.168.8.211',
    reason: '疑似爬虫扫描',
    hit_count: 1204,
    last_access_at: '2026-03-17 23:51:03',
    created_at: '2026-03-08 08:02:19',
    creator: 'ops'
  },
  {
    id: '4',
    ip: '66.240.205.34',
    reason: '关联黑产账号',
    hit_count: 57,
    last_access_at: '2026-03-16 19:33:28',
    created_at: '2026-03-15 13:27:51',
    creator: 'admin'
  }
];

function nowText() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
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
  const [allRows, setAllRows] = useState<IpBlacklistRow[]>(INITIAL_ROWS);
  const [data, setData] = useState<IpBlacklistRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
    []
  );
  const [addVisible, setAddVisible] = useState(false);
  const [releaseIp, setReleaseIp] = useState<string | null>(null);
  const [batchReleaseIps, setBatchReleaseIps] = useState<string[] | null>(
    null
  );
  const keywordType = Form.useWatch('keyword_type', form) as
    | KeywordType
    | undefined;

  const keywordTypeOptions = useMemo(
    () =>
      (['user_id', 'ip'] as const).map((value) => ({
        label: t[`ipBlacklist.filter.keywordType.${value}`],
        value
      })),
    [t]
  );

  const keywordPlaceholder =
    keywordType === 'ip'
      ? t['ipBlacklist.filter.placeholder.ip']
      : t['ipBlacklist.filter.placeholder.user_id'];

  const fetchData = useCallback(
    async (p = page, size = pageSize, source = allRows) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const kw = (values.keyword || '').trim().toLowerCase();
        const type = values.keyword_type || 'user_id';
        let list = [...source];
        if (kw) {
          list = list.filter((row) => {
            if (type === 'ip') return row.ip.toLowerCase().includes(kw);
            return row.creator.toLowerCase().includes(kw);
          });
        }
        const range = values.created_at;
        if (range?.[0] && range?.[1]) {
          const start = new Date(range[0]).getTime();
          const end = new Date(range[1]).getTime();
          list = list.filter((row) => {
            const ts = new Date(row.created_at.replace(/-/g, '/')).getTime();
            return ts >= start && ts <= end;
          });
        }
        setTotal(list.length);
        const startIdx = (p - 1) * size;
        setData(list.slice(startIdx, startIdx + size));
      } finally {
        setLoading(false);
      }
    },
    [form, page, pageSize, allRows]
  );

  useEffect(() => {
    fetchData(1, pageSize, allRows);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notReady = () => Message.warning(common['common.apiNotReady']);

  const exitBatch = () => {
    setBatchMode(false);
    setSelectedRowKeys([]);
  };

  const handleAddSuccess = (payload: AddIpBlacklistPayload) => {
    const stamp = nowText();
    const existing = new Set(allRows.map((r) => r.ip));
    const next: IpBlacklistRow[] = [
      ...payload.ips
        .filter((ip) => !existing.has(ip))
        .map((ip, idx) => ({
          id: `mock-${Date.now()}-${idx}`,
          ip,
          reason: payload.reason,
          hit_count: 0,
          last_access_at: stamp,
          created_at: stamp,
          creator: 'admin'
        })),
      ...allRows
    ];
    setAllRows(next);
    setPage(1);
    fetchData(1, pageSize, next);
  };

  const handleReleaseSuccess = (payload: ReleaseIpBlacklistPayload) => {
    const next = allRows.filter((r) => r.ip !== payload.ip);
    setAllRows(next);
    setSelectedRowKeys((keys) =>
      keys.filter((k) => next.some((r) => r.id === String(k)))
    );
    fetchData(page, pageSize, next);
  };

  const handleBatchReleaseSuccess = (
    payload: BatchReleaseIpBlacklistPayload
  ) => {
    const remove = new Set(payload.ips);
    const next = allRows.filter((r) => !remove.has(r.ip));
    setAllRows(next);
    setSelectedRowKeys([]);
    setBatchMode(false);
    fetchData(page, pageSize, next);
  };

  const openBatchRelease = (keys: (string | number)[]) => {
    const ips = allRows
      .filter((r) => keys.map(String).includes(r.id))
      .map((r) => r.ip);
    if (!ips.length) return;
    setBatchReleaseIps(ips);
  };

  return (
    <>
      <BizListPage
        form={form}
        title={t['ipBlacklist.title']}
        filterResetText={common['common.reset']}
        filterExtraActions={
          <Button
            type="text"
            className="use-biz-filter-action-text"
            onClick={notReady}
          >
            {t['ipBlacklist.filter.advanced']}
          </Button>
        }
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
                  typeInitialValue="user_id"
                  typeWidth={100}
                  placeholder={keywordPlaceholder}
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
          form.setFieldsValue({ keyword_type: 'user_id' });
          setPage(1);
          fetchData(1, pageSize);
        }}
        onRefresh={() => fetchData(page, pageSize)}
        toolbar={
          <>
            <Button
              type="outline"
              onClick={() => {
                if (batchMode) exitBatch();
                else setBatchMode(true);
              }}
            >
              {batchMode
                ? t['ipBlacklist.action.cancelBatch']
                : common['common.batchActions']}
            </Button>
          </>
        }
        toolbarAlways={
          <Button type="primary" onClick={() => setAddVisible(true)}>
            {t['ipBlacklist.action.add']}
          </Button>
        }
        batchActions={
          batchMode
            ? {
                theme: 'light',
                onExit: exitBatch,
                extra: (
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-2 border-0 border-l border-solid border-[rgba(0,0,0,0.08)] bg-transparent px-3 text-[14px] leading-[21px] text-[rgb(var(--danger-6))] hover:bg-[rgba(0,0,0,0.04)] disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:text-[16px]"
                    onClick={() => openBatchRelease(selectedRowKeys)}
                  >
                    <IconCloseCircle />
                    {t['ipBlacklist.action.batchRelease']}
                  </button>
                )
              }
            : undefined
        }
        tableProps={{
          loading,
          data,
          rowKey: (row: IpBlacklistRow) => row.id,
          columns: [
            {
              title: t['ipBlacklist.col.ip'],
              dataIndex: 'ip',
              width: 160
            },
            {
              title: t['ipBlacklist.col.reason'],
              dataIndex: 'reason'
            },
            {
              title: t['ipBlacklist.col.hitCount'],
              dataIndex: 'hit_count',
              width: 120,
              render: (v: number) =>
                t['ipBlacklist.hitCountUnit'].replace(
                  '{count}',
                  String(v ?? 0)
                )
            },
            {
              title: t['ipBlacklist.col.lastAccessAt'],
              dataIndex: 'last_access_at',
              width: 170,
              render: (v: string) => formatDateTime(v)
            },
            {
              title: t['ipBlacklist.col.createdAt'],
              dataIndex: 'created_at',
              width: 170,
              render: (v: string) => formatDateTime(v)
            },
            {
              title: t['ipBlacklist.col.creator'],
              dataIndex: 'creator',
              width: 120
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
                      onClick: () => setReleaseIp(row.ip)
                    }
                  ]}
                />
              )
            }
          ],
          rowSelection: batchMode
            ? {
                selectedRowKeys,
                onChange: setSelectedRowKeys
              }
            : undefined,
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
        onSuccess={handleAddSuccess}
      />
      <ReleaseIpBlacklistModal
        visible={!!releaseIp}
        ip={releaseIp}
        onCancel={() => setReleaseIp(null)}
        onSuccess={handleReleaseSuccess}
      />
      <BatchReleaseIpBlacklistModal
        visible={!!batchReleaseIps?.length}
        ips={batchReleaseIps || []}
        onCancel={() => setBatchReleaseIps(null)}
        onSuccess={handleBatchReleaseSuccess}
      />
    </>
  );
}
