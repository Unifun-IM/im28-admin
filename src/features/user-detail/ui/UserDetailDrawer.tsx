import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Descriptions,
  Drawer,
  Message,
  Spin,
  Tabs
} from '@arco-design/web-react';
import { IconCopy } from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import {
  postV1AdminUsersDetail,
  postV1AdminUsersOperationLogsList
} from '@shared/api/admin/users';
import { StatusBadge } from '@shared/ui';
import './user-detail-drawer.less';
import '@shared/ui/biz-detail-table.less';

export type UserDetailDrawerProps = {
  visible: boolean;
  userId?: string | null;
  defaultTab?: 'basic' | 'logs';
  onClose: () => void;
};

function CopyValue({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-[8px]">
      <span className="text-[12px] leading-[22px] text-arco-text-1">{value}</span>
      <button
        type="button"
        className="inline-flex size-[10px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-3"
        aria-label="copy"
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

/** 用户详情 — AdminAPI.AdminDetailUserEnvelope / AdminUserOperationLog */
export default function UserDetailDrawer({
  visible,
  userId,
  defaultTab = 'basic',
  onClose
}: UserDetailDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] =
    useState<AdminAPI.AdminDetailUserEnvelope['data']>();
  const [logs, setLogs] = useState<AdminAPI.AdminUserOperationLog[]>([]);

  useEffect(() => {
    if (!visible || !userId) return;
    setLoading(true);
    Promise.all([
      postV1AdminUsersDetail({ user_id: userId }),
      postV1AdminUsersOperationLogsList({ user_id: userId })
    ])
      .then(([detailRes, logsRes]) => {
        setDetail(detailRes.data);
        setLogs(logsRes.data?.list || []);
      })
      .finally(() => setLoading(false));
  }, [visible, userId]);

  const user = detail?.user;

  return (
    <Drawer
      width={720}
      title="用户详情"
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
      className="use-user-detail-drawer"
    >
      <Spin loading={loading} className="w-full">
        <div className="mb-4 flex items-center gap-3">
          <Avatar size={48}>
            {user?.avatar_url ? (
              <img alt="" src={user.avatar_url} />
            ) : (
              (user?.nickname || '?').slice(0, 1)
            )}
          </Avatar>
          <div>
            <div className="text-[16px] font-medium">{user?.nickname || '--'}</div>
            <div className="text-[12px] text-arco-text-3">
              user_id：
              {user?.user_id ? <CopyValue value={user.user_id} /> : '--'}
            </div>
          </div>
          {user?.status ? (
            <StatusBadge
              status={user.status === 'active' ? 'success' : 'error'}
              text={user.status}
            />
          ) : null}
        </div>
        <Tabs defaultActiveTab={defaultTab}>
          <Tabs.TabPane key="basic" title="basic">
            <Descriptions
              column={2}
              size="small"
              data={[
                { label: 'account', value: user?.account || '--' },
                { label: 'phone', value: user?.phone || '--' },
                { label: 'email', value: user?.email || '--' },
                {
                  label: 'online_status',
                  value: detail?.online_status || '--'
                },
                {
                  label: 'friend_count',
                  value: detail?.friend_count ?? '--'
                },
                {
                  label: 'group_count',
                  value: detail?.group_count ?? '--'
                },
                { label: 'created_at', value: user?.created_at || '--' },
                {
                  label: 'last_login_at',
                  value: user?.last_login_at || '--'
                },
                { label: 'register_ip', value: user?.register_ip || '--' },
                { label: 'last_login_ip', value: user?.last_login_ip || '--' },
                { label: 'bio', value: user?.bio || '--' }
              ]}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="logs" title="operation_logs">
            <div className="flex flex-col gap-3">
              {logs.length ? (
                logs.map((item, idx) => (
                  <div
                    key={`${item.operated_at}-${idx}`}
                    className="rounded border border-solid border-[var(--color-border-2)] p-3 text-[12px]"
                  >
                    <div>operated_at：{item.operated_at || '--'}</div>
                    <div>operation_type：{item.operation_type || '--'}</div>
                    <div>description：{item.description || '--'}</div>
                  </div>
                ))
              ) : (
                <div className="text-arco-text-3">暂无数据</div>
              )}
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Spin>
    </Drawer>
  );
}
