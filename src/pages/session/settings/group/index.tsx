import React, { useEffect, useRef, useState } from 'react';
import {
  Form,
  InputNumber,
  Message,
  Radio
} from '@arco-design/web-react';
import {
  getSessionGroupSettings,
  saveSessionGroupSettings
} from '@shared/api/biz';
import {
  SettingsPageShell,
  SettingsSectionCard
} from '@widgets/session-settings';

const RadioGroup = Radio.Group;

/**
 * 群组设置 — Figma 770:22608
 */
export default function SessionGroupSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const initialRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    setLoading(true);
    getSessionGroupSettings()
      .then((res) => {
        const data = res as Record<string, unknown>;
        initialRef.current = data;
        form.setFieldsValue(data);
      })
      .finally(() => setLoading(false));
  }, [form]);

  const onCancel = () => {
    form.setFieldsValue(initialRef.current);
    setDirty(false);
    Message.info('已还原未保存修改');
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const values = await form.validate();
      await saveSessionGroupSettings(values);
      initialRef.current = values;
      setDirty(false);
      Message.success('保存成功');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsPageShell
      title="群组设置"
      loading={loading}
      saving={saving}
      dirty={dirty}
      anchors={[{ key: 'basic', title: '基础设置' }]}
      onCancel={onCancel}
      onSave={onSave}
    >
      <Form
        form={form}
        layout="horizontal"
        labelAlign="left"
        colon={false}
        className="use-session-settings-form flex flex-col gap-3"
        labelCol={{ style: { width: 160, flexShrink: 0 } }}
        wrapperCol={{ style: { flex: 1 } }}
        onValuesChange={() => setDirty(true)}
      >
        <div id="basic" className="flex scroll-mt-3 flex-col gap-3">
          <SettingsSectionCard title="群人数上限">
            <Form.Item
              field="minGroupMembers"
              label="建群最少人数"
              rules={[{ required: true, message: '请输入建群最少人数' }]}
            >
              <InputNumber min={2} max={999} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              field="maxGroupMembers"
              label="普通群人数上限"
              rules={[{ required: true, message: '请输入普通群人数上限' }]}
            >
              <InputNumber
                min={3}
                max={100000}
                style={{ width: '100%' }}
                formatter={(v) =>
                  `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={(v) => String(v).replace(/,/g, '')}
              />
            </Form.Item>
          </SettingsSectionCard>

          <SettingsSectionCard title="群内容规则">
            <Form.Item
              field="announcementMaxLen"
              label="群公告字数上限"
              rules={[{ required: true, message: '请选择群公告字数上限' }]}
            >
              <RadioGroup className="use-session-settings-radio">
                <Radio value={500}>500字符</Radio>
                <Radio value={1000}>1000字符</Radio>
                <Radio value={2000}>2000字符</Radio>
              </RadioGroup>
            </Form.Item>
          </SettingsSectionCard>
        </div>
      </Form>
    </SettingsPageShell>
  );
}
