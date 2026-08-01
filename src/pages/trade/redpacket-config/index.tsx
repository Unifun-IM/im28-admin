import React, { useState } from 'react';
import {
  Button,
  Card,
  Form,
  InputNumber,
  Message,
  Space,
  Switch,
  Typography
} from '@arco-design/web-react';
import useLocale from '@shared/lib/useLocale';

const DEFAULT_VALUES = {
  expireHours: 24,
  hideClaimerWhileActive: true,
  luckyMin: 1,
  luckyMax: 100,
  equalMin: 1,
  equalMax: 50
};

/**
 * 红包基础配置 — Admin OpenAPI 暂无契约：本地表单壳
 */
export default function RedpacketConfigPage() {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  return (
    <Card bordered={false} title={t['redpacket.config.title']}>
      <Form
        form={form}
        layout="vertical"
        style={{ maxWidth: 480 }}
        initialValues={DEFAULT_VALUES}
      >
        <Typography.Title heading={6}>
          {t['redpacket.config.section.general']}
        </Typography.Title>
        <Form.Item
          field="expireHours"
          label={t['redpacket.config.field.expireHours']}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          field="hideClaimerWhileActive"
          label={t['redpacket.config.field.hideClaimer']}
          triggerPropName="checked"
        >
          <Switch />
        </Form.Item>

        <Typography.Title heading={6}>
          {t['redpacket.config.section.lucky']}
        </Typography.Title>
        <Form.Item field="luckyMin" label={t['redpacket.config.field.minCount']}>
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item field="luckyMax" label={t['redpacket.config.field.maxCount']}>
          <InputNumber min={1} />
        </Form.Item>

        <Typography.Title heading={6}>
          {t['redpacket.config.section.equal']}
        </Typography.Title>
        <Form.Item field="equalMin" label={t['redpacket.config.field.minCount']}>
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item field="equalMax" label={t['redpacket.config.field.maxCount']}>
          <InputNumber min={1} />
        </Form.Item>

        <Space>
          <Button
            type="primary"
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await form.validate();
                Message.success(common['common.success']);
              } finally {
                setSaving(false);
              }
            }}
          >
            {common['common.save']}
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
