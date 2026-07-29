import React, { useEffect, useState } from 'react';
import {
  Avatar, Button, Card, Descriptions, Message, Modal, Space, Table, Tabs, Tag
} from '@arco-design/web-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserDetail, postBlacklistAction } from '@shared/api/biz';

export default function UserDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getUserDetail(id);
      setDetail(res as Record<string, unknown>);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleBlack = (action: 'add' | 'remove') => {
    Modal.confirm({
      title: action === 'add' ? '确认将该用户加入黑名单？' : '确认将该用户解除黑名单？',
      onOk: async () => {
        await postBlacklistAction({ ids: [id], action });
        Message.success(action === 'add' ? '已加入黑名单' : '已解除黑名单');
        load();
      }
    });
  };

  const logs = ((detail?.logs as { list?: Record<string, unknown>[] })?.list) || [];
  const devices = (detail?.devices as Record<string, unknown>[]) || [];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card
        loading={loading}
        bordered={false}
        title="基本信息"
        extra={
          <Space>
            <Button onClick={() => navigate(-1)}>返回</Button>
            <Button status="danger" onClick={() => toggleBlack('add')}>加入黑名单</Button>
            <Button onClick={() => toggleBlack('remove')}>解除黑名单</Button>
            <Button
              type="primary"
              onClick={() => navigate(`/session/chat/user/${detail?.userId || id}`)}
            >
              查看消息
            </Button>
          </Space>
        }
      >
        <Space size={24} align="start">
          <Avatar size={64}>
            {detail?.avatar ? <img alt="avatar" src={String(detail.avatar)} /> : null}
          </Avatar>
          <Descriptions
            column={2}
            data={[
              { label: '用户ID', value: String(detail?.userId || '-') },
              { label: '昵称', value: String(detail?.nickname || '-') },
              { label: '账号', value: String(detail?.account || '-') },
              { label: '手机号', value: String(detail?.phone || '-') },
              { label: '邮箱', value: String(detail?.email || '-') },
              { label: '状态', value: <Tag color="green">{String(detail?.status || '-')}</Tag> },
              { label: '在线', value: String(detail?.online || '-') },
              { label: '邀请码', value: String(detail?.inviteCode || '-') },
              { label: '邀请人ID', value: String(detail?.inviterId || '-') },
              { label: '注册时间', value: String(detail?.registerTime || '-') },
              { label: '最近登录', value: String(detail?.lastLoginTime || '-') },
              {
                label: '好友/群',
                value: `${detail?.friendCount || 0} / ${detail?.groupCount || 0}`
              }
            ]}
          />
        </Space>
      </Card>
      <Card bordered={false}>
        <Tabs defaultActiveTab="logs">
          <Tabs.TabPane key="logs" title="操作日志">
            <Table
              rowKey="id"
              pagination={false}
              data={logs}
              columns={[
                { title: '行为', dataIndex: 'action' },
                { title: '客户端', dataIndex: 'client' },
                { title: 'IP', dataIndex: 'ip' },
                { title: '时间', dataIndex: 'time' }
              ]}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="devices" title="用户设备">
            <Table
              rowKey="id"
              pagination={false}
              data={devices}
              columns={[
                { title: '设备', dataIndex: 'name' },
                { title: '平台', dataIndex: 'platform' },
                { title: 'IP', dataIndex: 'ip' },
                { title: '地区', dataIndex: 'region' },
                { title: '最近登录', dataIndex: 'lastLogin' }
              ]}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </Space>
  );
}
