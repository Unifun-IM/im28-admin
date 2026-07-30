import React from 'react';
import { Card, Result } from '@arco-design/web-react';

/** 会话设置 — 菜单占位，子项待 Figma 补齐 */
export default function SessionSettingsPage() {
  return (
    <Card bordered={false} className="!rounded-[8px]">
      <Result status="info" title="会话设置" subTitle="功能建设中" />
    </Card>
  );
}
