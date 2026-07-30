import React, { useRef } from 'react';
import { Anchor, Button, Card, Space } from '@arco-design/web-react';
import './session-settings.less';

export type SettingsAnchorItem = {
  key: string;
  title: string;
};

export type SettingsPageShellProps = {
  title: string;
  loading?: boolean;
  saving?: boolean;
  dirty?: boolean;
  anchors: SettingsAnchorItem[];
  onCancel: () => void;
  onSave: () => void;
  children: React.ReactNode;
};

/**
 * 会话设置页壳 — Figma 770:22608 / 820:23141
 * 顶栏标题 + 取消/保存，左侧 Anchor，右侧分区卡片
 */
export default function SettingsPageShell({
  title,
  loading,
  saving,
  dirty,
  anchors,
  onCancel,
  onSave,
  children
}: SettingsPageShellProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <Card
      loading={loading}
      bordered={false}
      className="!rounded-[12px] border border-solid border-[rgba(0,0,0,0.08)]"
      bodyStyle={{ padding: 12 }}
    >
      <div className="mb-0 flex items-center justify-between">
        <h2 className="m-0 text-[20px] font-medium leading-7 text-arco-text-1">
          {title}
        </h2>
        <Space size={8}>
          <Button
            className="!min-w-[98px] !rounded-lg"
            disabled={!dirty}
            onClick={onCancel}
          >
            取消
          </Button>
          <Button
            type="primary"
            className="!rounded-lg"
            loading={saving}
            disabled={!dirty}
            onClick={onSave}
          >
            保存
          </Button>
        </Space>
      </div>

      <div className="mt-3 flex items-start gap-3">
        <div className="w-[240px] shrink-0 rounded-[12px] border border-solid border-[rgba(0,0,0,0.08)] bg-[var(--color-bg-2,#fff)] p-2">
          <Anchor
            className="use-session-settings-anchor"
            affix={false}
            hash={false}
            scrollContainer="#session-settings-scroll"
            offsetTop={12}
          >
            {anchors.map((item) => (
              <Anchor.Link
                key={item.key}
                href={`#${item.key}`}
                title={item.title}
              />
            ))}
          </Anchor>
        </div>

        <div
          id="session-settings-scroll"
          ref={scrollRef}
          className="max-h-[calc(100vh-220px)] min-w-0 flex-1 overflow-y-auto"
        >
          <div className="flex flex-col gap-3">{children}</div>
        </div>
      </div>
    </Card>
  );
}

export function SettingsSectionCard({
  id,
  title,
  children
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-3 rounded-[12px] border border-solid border-[rgba(0,0,0,0.08)] bg-[var(--color-bg-2,#fff)] p-3"
    >
      <div className="mb-0 flex h-8 items-center">
        <h3 className="m-0 text-[16px] font-medium leading-6 text-arco-text-1">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}
