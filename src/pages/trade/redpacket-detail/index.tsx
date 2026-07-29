import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Space,
  Table,
  Tabs,
  Tag
} from '@arco-design/web-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRedpacketDetail } from '@shared/api/biz';

export default function RedpacketDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    setLoading(true);
    getRedpacketDetail(id)
      .then((res) => setDetail(res as Record<string, unknown>))
      .finally(() => setLoading(false));
  }, [id]);

  const claims = (detail?.claims as Record<string, unknown>[]) || [];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card
        loading={loading}
        bordered={false}
        title="红包详情 · 基本情况"
        extra={
          <Button onClick={() => navigate(-1)}>返回</Button>
        }
      >
        <Descriptions
          column={2}
          data={[
            { label: '红包号', value: String(detail?.packetNo || '-') },
            { label: '类型', value: String(detail?.type || '-') },
            { label: '币种', value: String(detail?.currency || '-') },
            { label: '红包总额', value: String(detail?.totalAmount || '-') },
            { label: '红包份数', value: String(detail?.count || '-') },
            {
              label: '领取情况',
              value: `${detail?.claimed || 0}/${detail?.count || 0}`
            },
            {
              label: '状态',
              value: <Tag>{String(detail?.status || '-')}</Tag>
            },
            { label: '发送者', value: String(detail?.senderName || '-') },
            { label: '发送者ID', value: String(detail?.senderId || '-') },
            { label: '封面', value: String(detail?.cover || '-') },
            { label: '创建时间', value: String(detail?.createdAt || '-') }
          ]}
        />
      </Card>
      <Card bordered={false}>
        <Tabs defaultActiveTab="claims">
          <Tabs.TabPane key="claims" title="领取记录">
            <Table
              rowKey="id"
              data={claims}
              pagination={false}
              columns={[
                { title: '用户ID', dataIndex: 'userId' },
                { title: '昵称', dataIndex: 'nickname' },
                { title: '金额', dataIndex: 'amount' },
                { title: '领取时间', dataIndex: 'time' }
              ]}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </Space>
  );
}
