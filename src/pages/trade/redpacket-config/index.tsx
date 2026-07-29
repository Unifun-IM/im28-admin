import React, { useEffect, useState } from 'react';
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
import { getRedpacketConfig, saveRedpacketConfig } from '@shared/api/biz';

export default function RedpacketConfigPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRedpacketConfig()
      .then((res) => form.setFieldsValue(res))
      .finally(() => setLoading(false));
  }, [form]);

  return (
    <Card loading={loading} bordered={false} title="红包基础配置">
      <Form form={form} layout="vertical" style={{ maxWidth: 480 }}>
        <Typography.Title heading={6}>通用规则</Typography.Title>
        <Form.Item field="expireHours" label="红包有效期（小时）">
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          field="hideClaimerWhileActive"
          label="领取中不展示领取用户与时间"
          triggerPropName="checked"
        >
          <Switch />
        </Form.Item>

        <Typography.Title heading={6}>拼手气红包</Typography.Title>
        <Form.Item field="luckyMin" label="份数下限">
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item field="luckyMax" label="份数上限">
          <InputNumber min={1} />
        </Form.Item>

        <Typography.Title heading={6}>等额红包</Typography.Title>
        <Form.Item field="equalMin" label="份数下限">
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item field="equalMax" label="份数上限">
          <InputNumber min={1} />
        </Form.Item>

        <Space>
          <Button
            type="primary"
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await saveRedpacketConfig(form.getFieldsValue());
                Message.success('保存成功');
              } finally {
                setSaving(false);
              }
            }}
          >
            保存
          </Button>
        </Space>
      </Form>
    </Card>
  );
}
