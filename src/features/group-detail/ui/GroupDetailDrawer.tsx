import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Descriptions,
  Drawer,
  Input,
  Spin,
  Tabs,
  Timeline
} from '@arco-design/web-react';
import {
  IconLeft,
  IconRight,
  IconSearch
} from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import { getGroupDetail } from '@shared/api/biz';
import { StatusBadge } from '@widgets/biz-list';

export type GroupDetailDrawerProps = {
  visible: boolean;
  groupId?: string | null;
  defaultTab?: 'basic' | 'logs';
  onClose: () => void;
};

type DetailData = Record<string, unknown>;

type MemberItem = {
  id?: string;
  userId?: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  joinTime?: string;
  account?: string;
  phone?: string;
  sharedGroupCount?: number;
  online?: string;
  isF1?: boolean;
};

type LogItem = {
  id?: string;
  time?: string;
  action?: string;
  detail?: string;
};

type View = 'main' | 'members' | 'member';

function initials(name?: string) {
  const text = (name || '').trim();
  if (!text) return '?';
  if (/^[a-zA-Z]/.test(text)) return text.slice(0, 2).toUpperCase();
  return text.slice(0, 1);
}

function formatPhone(phone?: unknown) {
  const raw = String(phone || '').trim();
  if (!raw || raw === '-') return '-';
  if (raw.startsWith('+')) return raw;
  if (/^1\d{10}$/.test(raw)) return `+86 ${raw}`;
  return raw;
}

function LinkValue({
  children,
  onClick
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="cursor-pointer border-0 bg-transparent p-0 text-[14px] leading-[21px] text-[rgb(var(--link-6))]"
      onClick={onClick}
    >
      {children}
    </button>
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

/** 群头像：成员头像九宫格（不足用字） */
function GroupAvatar({
  name,
  members
}: {
  name: string;
  members: MemberItem[];
}) {
  const cells = Array.from({ length: 9 }, (_, i) => members[i]);
  return (
    <div className="box-border grid size-[56px] shrink-0 grid-cols-3 grid-rows-3 gap-[1.4px] overflow-hidden rounded-[8.4px] bg-[#e7e7e7]">
      {cells.map((m, i) => (
        <div
          key={m?.id || i}
          className="flex items-center justify-center overflow-hidden bg-[rgba(123,97,255,0.12)] text-[8px] font-bold text-[#7b61ff]"
        >
          {m?.avatar ? (
            <img alt="" src={m.avatar} className="size-full object-cover" />
          ) : (
            initials(m?.nickname || name)
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * 群详情 Drawer — Figma 666:22243（基本信息）/ 755:13957（操作日志）
 * 群成员 666:22310 / 成员用户信息 666:22396
 */
export default function GroupDetailDrawer({
  visible,
  groupId,
  defaultTab = 'basic',
  onClose
}: GroupDetailDrawerProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [tab, setTab] = useState<string>(defaultTab);
  const [view, setView] = useState<View>('main');
  const [memberKeyword, setMemberKeyword] = useState('');
  const [activeMember, setActiveMember] = useState<MemberItem | null>(null);

  useEffect(() => {
    if (!visible) return;
    setTab(defaultTab);
    setView('main');
    setMemberKeyword('');
    setActiveMember(null);
  }, [visible, defaultTab, groupId]);

  useEffect(() => {
    if (!visible || !groupId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getGroupDetail(String(groupId));
        if (!cancelled) setDetail(res as DetailData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, groupId]);

  const name = String(detail?.name || '-');
  const status = String(detail?.status || '');
  const members = useMemo(
    () => ((detail?.members as MemberItem[]) || []) as MemberItem[],
    [detail]
  );
  const admins = useMemo(() => {
    const fromDetail = (detail?.admins as MemberItem[]) || [];
    if (fromDetail.length) return fromDetail;
    return members.filter((m) => m.role === '管理员' || m.role === '群主');
  }, [detail, members]);
  const logs = useMemo(
    () => ((detail?.logs as LogItem[]) || []) as LogItem[],
    [detail]
  );

  const filteredMembers = useMemo(() => {
    const q = memberKeyword.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        String(m.nickname || '')
          .toLowerCase()
          .includes(q) ||
        String(m.userId || '')
          .toLowerCase()
          .includes(q)
    );
  }, [members, memberKeyword]);

  const titleText =
    view === 'members' ? '群成员' : view === 'member' ? '用户详情' : '群详情';

  const handleBack = () => {
    if (view === 'member') {
      setActiveMember(null);
      setView('members');
      return;
    }
    if (view === 'members') {
      setView('main');
      setMemberKeyword('');
    }
  };

  const openChat = () => {
    const gid = String(detail?.groupId || groupId || '');
    onClose();
    navigate(`/session/chat/group/${gid}`);
  };

  const drawerTitle = (
    <div className="flex w-full items-center gap-[16px]">
      {view !== 'main' ? (
        <button
          type="button"
          className="inline-flex size-4 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-1"
          aria-label="返回"
          onClick={handleBack}
        >
          <IconLeft className="text-[16px]" />
        </button>
      ) : null}
      <span>{titleText}</span>
    </div>
  );

  return (
    <Drawer
      className="use-user-detail-drawer use-group-detail-drawer"
      width={640}
      visible={visible}
      placement="right"
      title={drawerTitle}
      footer={
        view === 'main' ? (
          <Button type="primary" long onClick={openChat}>
            查看聊天
          </Button>
        ) : null
      }
      unmountOnExit
      maskClosable
      onCancel={onClose}
      maskStyle={{
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(3.5px)'
      }}
    >
      <Spin loading={loading} className="block w-full">
        {view === 'main' && (
          <div className="flex flex-col gap-[12px]">
            <div className="flex h-[56px] items-center gap-[16px]">
              <GroupAvatar name={name} members={members} />
              <div className="min-w-0">
                <div className="truncate text-[17.5px] font-bold leading-[24.5px] text-[#111418]">
                  {name}
                </div>
                <div className="mt-[2px]">
                  <StatusBadge
                    status={
                      status === '正常'
                        ? 'success'
                        : status === '封禁'
                          ? 'error'
                          : 'warning'
                    }
                    text={status || '-'}
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
                          label: '群ID',
                          value: String(detail?.groupId || '-')
                        },
                        {
                          label: '群主',
                          value: (
                            <LinkValue>
                              {String(detail?.ownerName || '-')}
                            </LinkValue>
                          )
                        },
                        {
                          label: '群创建时间',
                          value: String(detail?.createdAt || '-')
                        },
                        {
                          label: '最后活跃时间',
                          value: String(
                            detail?.lastActiveTime || detail?.createdAt || '-'
                          )
                        },
                        {
                          label: '创建人',
                          value: String(
                            detail?.creatorName || detail?.ownerName || '-'
                          )
                        }
                      ]}
                    />
                  </div>

                  <div>
                    <div className="mb-[12px] text-[14px] font-medium leading-[21px] text-arco-text-1">
                      群成员
                    </div>
                    <Descriptions
                      className="use-user-detail-descriptions"
                      border
                      column={1}
                      size="small"
                      tableLayout="fixed"
                      data={[
                        {
                          label: '群成员',
                          value: (
                            <SocialLink
                              value={String(detail?.memberCount ?? members.length)}
                              onClick={() => setView('members')}
                            />
                          )
                        }
                      ]}
                    />
                  </div>

                  <div>
                    <div className="mb-[12px] text-[14px] font-medium leading-[21px] text-arco-text-1">
                      群设置
                    </div>
                    <Descriptions
                      className="use-user-detail-descriptions"
                      border
                      column={2}
                      size="small"
                      tableLayout="fixed"
                      data={[
                        {
                          label: '加入方式',
                          value: String(detail?.joinMethod || '邀请加入')
                        },
                        {
                          label: '邀请权限',
                          value: String(
                            detail?.invitePermission ??
                              (detail?.allowInvite ? '开' : '关')
                          )
                        },
                        {
                          label: '发言权限',
                          value: String(
                            detail?.speakPermission || '无限制'
                          )
                        },
                        {
                          label: '禁言状态',
                          value: String(detail?.muteStatus || '不禁言')
                        }
                      ]}
                    />
                  </div>

                  <div>
                    <div className="mb-[12px] text-[14px] font-medium leading-[21px] text-arco-text-1">
                      群管理
                    </div>
                    <Descriptions
                      className="use-user-detail-descriptions"
                      border
                      column={2}
                      size="small"
                      tableLayout="fixed"
                      data={[
                        {
                          label: '群主',
                          value: (
                            <LinkValue>
                              {String(detail?.ownerName || '-')}
                            </LinkValue>
                          )
                        },
                        ...admins
                          .filter((a) => a.role !== '群主')
                          .slice(0, 5)
                          .map((a) => ({
                            label: '管理员',
                            value: (
                              <LinkValue key={a.userId || a.id}>
                                {String(a.nickname || '-')}
                              </LinkValue>
                            )
                          }))
                      ]}
                    />
                  </div>
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane key="logs" title="操作日志">
                <div className="pt-[12px]">
                  {logs.length ? (
                    <Timeline className="use-group-detail-timeline">
                      {logs.map((item, index) => (
                        <Timeline.Item
                          key={item.id || `${item.time}-${index}`}
                          label={
                            <span className="text-[12px] leading-[20px] text-arco-text-3">
                              {String(item.time || '-')}
                            </span>
                          }
                        >
                          <div className="flex flex-wrap items-center gap-[12px] text-[12px] leading-[20px]">
                            <span className="min-w-[120px] text-arco-text-1">
                              {item.action || '-'}
                            </span>
                            <span className="text-arco-text-3">
                              {item.detail || ''}
                            </span>
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    !loading && (
                      <div className="py-8 text-center text-[12px] text-arco-text-3">
                        暂无操作日志
                      </div>
                    )
                  )}
                </div>
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}

        {view === 'members' && (
          <div className="flex flex-col gap-[12px]">
            <Input
              allowClear
              placeholder="搜索群成员"
              prefix={<IconSearch className="text-arco-text-3" />}
              value={memberKeyword}
              onChange={setMemberKeyword}
            />
            <div className="text-[14px] leading-[21px] text-arco-text-2">
              共{filteredMembers.length}个群成员
            </div>
            <div className="flex flex-col gap-[16px]">
              {filteredMembers.map((m) => (
                <button
                  key={m.id || m.userId}
                  type="button"
                  className="flex min-h-[56px] w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left"
                  onClick={() => {
                    setActiveMember(m);
                    setView('member');
                  }}
                >
                  <div className="flex items-center gap-[16px]">
                    <div className="relative size-10 shrink-0">
                      <Avatar size={40} className="use-user-detail-avatar !text-[14px]">
                        {m.avatar ? (
                          <img alt="" src={m.avatar} />
                        ) : (
                          initials(m.nickname)
                        )}
                      </Avatar>
                      {m.isF1 ? (
                        <span className="absolute bottom-0 left-0 rounded-[4px] bg-[rgba(123,97,255,0.15)] px-[2px] text-[10px] font-bold leading-[14px] text-[#7b61ff]">
                          F1
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <div className="text-[14px] font-medium leading-[21px] text-arco-text-2">
                        {m.nickname || '-'}
                      </div>
                      <div className="text-[12px] leading-[20px] text-arco-text-3">
                        ID：{m.userId || '-'}
                      </div>
                    </div>
                  </div>
                  <IconRight className="text-[16px] text-arco-text-3" />
                </button>
              ))}
            </div>
          </div>
        )}

        {view === 'member' && activeMember && (
          <div className="flex flex-col gap-[12px]">
            <div className="flex h-[56px] items-center gap-[16px]">
              <Avatar size={56} className="use-user-detail-avatar shrink-0">
                {activeMember.avatar ? (
                  <img alt="" src={activeMember.avatar} />
                ) : (
                  initials(activeMember.nickname)
                )}
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-[17.5px] font-bold leading-[24.5px] text-[#111418]">
                  {activeMember.nickname || '-'}
                </div>
                <div className="mt-[2px]">
                  <StatusBadge
                    status={
                      activeMember.online === '在线' ? 'success' : 'default'
                    }
                    text={activeMember.online || '离线'}
                    className="!text-[14px] !leading-[21px] !text-arco-text-2"
                  />
                </div>
              </div>
            </div>

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
                    value: String(activeMember.userId || '-')
                  },
                  {
                    label: '账号',
                    value: String(activeMember.account || '-')
                  },
                  {
                    label: '手机号',
                    value: formatPhone(activeMember.phone)
                  },
                  {
                    label: '加入时间',
                    value: String(activeMember.joinTime || '-')
                  },
                  {
                    label: '共同群聊',
                    value: (
                      <LinkValue>
                        {String(activeMember.sharedGroupCount ?? 0)}
                      </LinkValue>
                    )
                  }
                ]}
              />
            </div>
          </div>
        )}
      </Spin>
    </Drawer>
  );
}
