import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Space,
  Switch,
  Table,
  Tabs,
  Tag
} from '@arco-design/web-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGroupDetail } from '@shared/api/biz';

export default function GroupDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    setLoading(true);
    getGroupDetail(id)
      .then((res) => setDetail(res as Record<string, unknown>))
      .finally(() => setLoading(false));
  }, [id]);

  const members = (detail?.members as Record<string, unknown>[]) || [];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card
        loading={loading}
        bordered={false}
        title="群详情"
        extra={
          <Space>
            <Button onClick={() => navigate(-1)}>返回</Button>
            <Button
              type="primary"
              onClick={() =>
                navigate(`/session/chat/group/${detail?.groupId || id}`)
              }
            >
              查看消息
            </Button>
          </Space>
        }
      >
        <Descriptions
          column={2}
          data={[
            { label: '群ID', value: String(detail?.groupId || '-') },
            { label: '群名称', value: String(detail?.name || '-') },
            { label: '群主ID', value: String(detail?.ownerId || '-') },
            { label: '群主', value: String(detail?.ownerName || '-') },
            { label: '成员数', value: `共${detail?.memberCount || 0}个群成员` },
            {
              label: '状态',
              value: <Tag>{String(detail?.status || '-')}</Tag>
            },
            { label: '创建时间', value: String(detail?.createdAt || '-') },
            { label: '群公告', value: String(detail?.announcement || '-') }
          ]}
        />
      </Card>
      <Card bordered={false}>
        <Tabs defaultActiveTab="members">
          <Tabs.TabPane key="members" title="群成员">
            <Table
              rowKey="id"
              data={members}
              pagination={false}
              columns={[
                { title: '用户ID', dataIndex: 'userId' },
                { title: '昵称', dataIndex: 'nickname' },
                { title: '角色', dataIndex: 'role' },
                { title: '入群时间', dataIndex: 'joinTime' }
              ]}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="settings" title="群设置">
            <Descriptions
              column={1}
              data={[
                {
                  label: '允许邀请好友',
                  value: <Switch checked={!!detail?.allowInvite} disabled />
                },
                {
                  label: '允许群内加好友',
                  value: <Switch checked={!!detail?.allowAddFriend} disabled />
                },
                {
                  label: '发言权限',
                  value: String(detail?.speakPermission || '-')
                }
              ]}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </Space>
  );
}
