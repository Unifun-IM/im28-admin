import React from 'react';
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
import useLocale from '@shared/lib/useLocale';

/**
 * 红包详情 — Admin OpenAPI 暂无契约：保留详情 / 领取记录界面壳
 */
export default function RedpacketDetailPage() {
  const t = useLocale();
  const { id = '' } = useParams();
  const navigate = useNavigate();

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card
        bordered={false}
        title={`${t['redpacket.detail.title']}${id ? ` · ${id}` : ''}`}
        extra={
          <Button onClick={() => navigate(-1)}>{t['common.back']}</Button>
        }
      >
        <Descriptions
          column={2}
          data={[
            { label: t['redpacket.col.packetNo'], value: '--' },
            { label: t['redpacket.col.type'], value: '--' },
            { label: t['redpacket.col.currency'], value: '--' },
            { label: t['redpacket.col.totalAmount'], value: '--' },
            { label: t['redpacket.detail.count'], value: '--' },
            {
              label: t['redpacket.col.claim'],
              value: '0/0'
            },
            {
              label: t['redpacket.col.status'],
              value: <Tag>--</Tag>
            },
            { label: t['redpacket.col.sender'], value: '--' },
            { label: t['redpacket.detail.senderId'], value: '--' },
            { label: t['redpacket.detail.cover'], value: '--' },
            { label: t['redpacket.col.createdAt'], value: '--' }
          ]}
        />
      </Card>
      <Card bordered={false}>
        <Tabs defaultActiveTab="claims">
          <Tabs.TabPane key="claims" title={t['redpacket.detail.claims']}>
            <Table
              rowKey="id"
              data={[]}
              pagination={false}
              columns={[
                { title: t['common.userId'], dataIndex: 'userId' },
                { title: t['common.nickname'], dataIndex: 'nickname' },
                { title: t['redpacket.detail.amount'], dataIndex: 'amount' },
                { title: t['redpacket.detail.claimTime'], dataIndex: 'time' }
              ]}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </Space>
  );
}
