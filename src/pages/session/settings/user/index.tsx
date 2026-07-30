import React, { useEffect, useRef, useState } from 'react';
import {
  Form,
  Message,
  Radio,
  Switch
} from '@arco-design/web-react';
import {
  getSessionUserSettings,
  saveSessionUserSettings
} from '@shared/api/biz';
import {
  SettingsPageShell,
  SettingsSectionCard
} from '@widgets/session-settings';

const RadioGroup = Radio.Group;

const MSG_SWITCHES = [
  ['msgText', '文字消息'],
  ['msgImage', '图片消息'],
  ['msgVideo', '视频消息'],
  ['msgAudio', '音频消息'],
  ['msgFile', '文件消息'],
  ['msgVoice', '语音消息'],
  ['msgCard', '名片消息']
] as const;

/**
 * 用户会话设置 — Figma 820:23141
 * 「多消息参数」锚点在稿中有入口，区块按同类系统参数补齐
 */
export default function SessionUserSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const initialRef = useRef<Record<string, unknown>>({});

  useEffect(() => {
    setLoading(true);
    getSessionUserSettings()
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
      await saveSessionUserSettings(values);
      initialRef.current = values;
      setDirty(false);
      Message.success('保存成功');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsPageShell
      title="用户会话设置"
      loading={loading}
      saving={saving}
      dirty={dirty}
      anchors={[
        { key: 'msg-switch', title: '消息类开关' },
        { key: 'msg-spec', title: '消息规格参数' },
        { key: 'msg-select', title: '消息选择参数' },
        { key: 'msg-multi', title: '多消息参数' }
      ]}
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
        <SettingsSectionCard id="msg-switch" title="消息类型开关">
          {MSG_SWITCHES.map(([field, label]) => (
            <Form.Item
              key={field}
              field={field}
              label={label}
              triggerPropName="checked"
            >
              <Switch />
            </Form.Item>
          ))}
        </SettingsSectionCard>

        <SettingsSectionCard id="msg-spec" title="消息规格参数">
          <Form.Item field="textMaxLen" label="文字消息字数上限">
            <RadioGroup className="use-session-settings-radio">
              <Radio value={500}>500字符</Radio>
              <Radio value={1000}>1000字符</Radio>
              <Radio value={2000}>2000字符</Radio>
            </RadioGroup>
          </Form.Item>
          <Form.Item field="imageMaxMb" label="图片大小上限">
            <RadioGroup className="use-session-settings-radio">
              <Radio value={5}>5M</Radio>
              <Radio value={10}>10M</Radio>
              <Radio value={20}>20M</Radio>
            </RadioGroup>
          </Form.Item>
          <Form.Item field="videoMaxMb" label="视频大小上限">
            <RadioGroup className="use-session-settings-radio">
              <Radio value={50}>50M</Radio>
              <Radio value={100}>100M</Radio>
              <Radio value={200}>200M</Radio>
            </RadioGroup>
          </Form.Item>
          <Form.Item field="audioMaxMb" label="音频大小上限">
            <RadioGroup className="use-session-settings-radio">
              <Radio value={50}>50M</Radio>
              <Radio value={100}>100M</Radio>
              <Radio value={200}>200M</Radio>
            </RadioGroup>
          </Form.Item>
          <Form.Item field="fileMaxMb" label="文件大小上限">
            <RadioGroup className="use-session-settings-radio">
              <Radio value={50}>50M</Radio>
              <Radio value={100}>100M</Radio>
              <Radio value={200}>200M</Radio>
            </RadioGroup>
          </Form.Item>
          <Form.Item field="voiceMinSec" label="语音最短时长">
            <RadioGroup className="use-session-settings-radio">
              <Radio value={1}>1秒</Radio>
              <Radio value={2}>2秒</Radio>
              <Radio value={3}>3秒</Radio>
            </RadioGroup>
          </Form.Item>
          <Form.Item field="voiceMaxSec" label="语音最长时长">
            <RadioGroup className="use-session-settings-radio">
              <Radio value={30}>30秒</Radio>
              <Radio value={60}>1分钟</Radio>
              <Radio value={120}>2分钟</Radio>
            </RadioGroup>
          </Form.Item>
        </SettingsSectionCard>

        <SettingsSectionCard id="msg-select" title="消息选择参数">
          <Form.Item field="albumMaxSelect" label="相册单次选择上限">
            <RadioGroup className="use-session-settings-radio">
              <Radio value={9}>9个</Radio>
              <Radio value={12}>12个</Radio>
              <Radio value={20}>20个</Radio>
            </RadioGroup>
          </Form.Item>
        </SettingsSectionCard>

        <SettingsSectionCard id="msg-multi" title="多消息参数">
          <Form.Item
            field="multiSelect"
            label="多选消息开关"
            triggerPropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item field="multiSelectMax" label="多选消息上限">
            <RadioGroup className="use-session-settings-radio">
              <Radio value={20}>20条</Radio>
              <Radio value={50}>50条</Radio>
              <Radio value={100}>100条</Radio>
            </RadioGroup>
          </Form.Item>
        </SettingsSectionCard>
      </Form>
    </SettingsPageShell>
  );
}
