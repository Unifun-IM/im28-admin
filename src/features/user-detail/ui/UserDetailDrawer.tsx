import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Descriptions,
  Drawer,
  Message,
  Spin,
  Table,
  Tabs,
  type TableColumnProps
} from '@arco-design/web-react';
import { IconCopy, IconRight } from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import { getUserDetail } from '@shared/api/biz';
import { StatusBadge } from '@widgets/biz-list';

export type UserDetailDrawerProps = {
  visible: boolean;
  userId?: string | null;
  /** 默认打开的 Tab */
  defaultTab?: 'basic' | 'logs';
  onClose: () => void;
};

type DetailData = Record<string, unknown>;

type LogItem = {
  id?: string;
  time?: string;
  action?: string;
  detail?: string;
};

function initials(name?: string) {
  const text = (name || '').trim();
  if (!text) return '?';
  if (/^[a-zA-Z]/.test(text)) {
    return text.slice(0, 2).toUpperCase();
  }
  return text.slice(0, 1);
}

function formatPhone(phone?: unknown) {
  const raw = String(phone || '').trim();
  if (!raw || raw === '-') return '-';
  if (raw.startsWith('+')) return raw;
  if (/^1\d{10}$/.test(raw)) return `+86 ${raw}`;
  return raw;
}

function formatLogTime(time?: string) {
  if (!time) return '-';
  return time.replace(/(\d{4})-(\d{2})-(\d{2})/, '$1/$2/$3');
}

function CopyValue({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-[8px]">
      <span className="text-[12px] leading-[22px] text-arco-text-1">{value}</span>
      <button
        type="button"
        className="inline-flex size-[10px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-3 hover:text-arco-text-1"
        aria-label="复制"
        onClick={() => {
          copy(value);
          Message.success('已复制');
        }}
      >
        <IconCopy className="text-[10px]" />
      </button>
    </span>
  );
}

function SocialLink({
  value,
  onClick
}: {
  value: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left"
      onClick={onClick}
    >
      <span className="text-[14px] leading-[21px] text-[rgb(var(--link-6))]">
        {value}
      </span>
      <IconRight className="text-[14px] text-arco-text-3" />
    </button>
  );
}

const LOG_COLUMNS: TableColumnProps<LogItem>[] = [
  {
    title: '时间',
    dataIndex: 'time',
    width: 160,
    render: (v) => formatLogTime(v as string)
  },
  {
    title: '行为',
    dataIndex: 'action',
    width: 200,
    render: (v) => (v as string) || '-'
  },
  {
    title: '详情',
    dataIndex: 'detail',
    ellipsis: true,
    render: (v) => (v as string) || '-'
  }
];

/**
 * 用户详情抽屉 — Figma 666:21862（基本信息）/ 750:23153（操作日志）
 * 宽 640，右侧滑出；信息用 Descriptions，日志用 Table
 */
export default function UserDetailDrawer({
  visible,
  userId,
  defaultTab = 'basic',
  onClose
}: UserDetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [tab, setTab] = useState<string>(defaultTab);

  useEffect(() => {
    if (!visible) return;
    setTab(defaultTab);
  }, [visible, defaultTab]);

  useEffect(() => {
    if (!visible || !userId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getUserDetail(String(userId));
        if (!cancelled) setDetail(res as DetailData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, userId]);

  const nickname = String(detail?.nickname || '-');
  const online = String(detail?.online || '');
  const logs = useMemo(() => {
    const raw = (detail?.logs as { list?: LogItem[] })?.list || [];
    return raw as LogItem[];
  }, [detail]);

  return (
    <Drawer
      className="use-user-detail-drawer"
      width={640}
      visible={visible}
      placement="right"
      title="用户详情"
      footer={null}
      unmountOnExit
      maskClosable
      onCancel={onClose}
      maskStyle={{
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(3.5px)'
      }}
    >
      <Spin loading={loading} className="block w-full">
        <div className="flex flex-col gap-[12px]">
          <div className="flex h-[56px] items-center gap-[16px]">
            <Avatar
              size={56}
              className="use-user-detail-avatar shrink-0"
            >
              {initials(nickname)}
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-[17.5px] font-bold leading-[24.5px] text-[#111418]">
                {nickname}
              </div>
              <div className="mt-[2px]">
                <StatusBadge
                  status={online === '在线' ? 'success' : 'default'}
                  text={online || '-'}
                  className="!text-[14px] !leading-[21px] !text-arco-text-2"
                />
              </div>
            </div>
          </div>

          <Tabs
            activeTab={tab}
            onChange={setTab}
            className="use-user-detail-tabs"
          >
            <Tabs.TabPane key="basic" title="基本信息">
              <div className="flex flex-col gap-[12px] pt-[12px]">
                <div>
                  <div className="mb-[12px] text-[14px] font-medium leading-[21px] text-arco-text-1">
                    基础信息
                  </div>
                  <Descriptions
                    className="use-user-detail-descriptions"
                    border
                    column={2}
                    size="small"
                    tableLayout="fixed"
                    data={[
                      {
                        label: '用户ID',
                        value: String(detail?.userId || '-')
                      },
                      {
                        label: '账号',
                        value: (
                          <CopyValue
                            value={String(detail?.account || '-')}
                          />
                        )
                      },
                      {
                        label: '手机号',
                        value: formatPhone(detail?.phone)
                      },
                      {
                        label: '邮箱',
                        value: String(detail?.email || '-')
                      },
                      {
                        label: '注册时间',
                        value: String(detail?.registerTime || '-')
                      },
                      {
                        label: '最后操作时间',
                        value: String(
                          detail?.lastActiveTime ||
                            detail?.lastLoginTime ||
                            '-'
                        )
                      }
                    ]}
                  />
                </div>

                <div>
                  <div className="mb-[12px] text-[14px] font-medium leading-[21px] text-arco-text-1">
                    社交关系
                  </div>
                  <Descriptions
                    className="use-user-detail-descriptions"
                    border
                    column={2}
                    size="small"
                    tableLayout="fixed"
                    data={[
                      {
                        label: '好友数量',
                        value: (
                          <SocialLink
                            value={String(detail?.friendCount ?? 0)}
                            onClick={() =>
                              Message.info('查看好友列表（mock）')
                            }
                          />
                        )
                      },
                      {
                        label: '群聊数量',
                        value: (
                          <SocialLink
                            value={String(detail?.groupCount ?? 0)}
                            onClick={() =>
                              Message.info('查看群聊列表（mock）')
                            }
                          />
                        )
                      }
                    ]}
                  />
                </div>
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="logs" title="操作日志">
              <div className="pt-[12px]">
                <Table
                  className="use-biz-detail-table"
                  rowKey={(row) =>
                    String(row.id ?? `${row.time ?? 'log'}-${row.action ?? ''}`)
                  }
                  columns={LOG_COLUMNS}
                  data={logs}
                  border
                  borderCell
                  pagination={false}
                  noDataElement={
                    !loading ? (
                      <div className="py-8 text-center text-[12px] text-arco-text-3">
                        暂无操作日志
                      </div>
                    ) : null
                  }
                />
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Spin>
    </Drawer>
  );
}
