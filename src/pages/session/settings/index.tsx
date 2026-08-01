import React, { useCallback, useMemo, useState } from 'react';
import { Form, Message, Radio, Switch } from '@arco-design/web-react';
import {
  SettingsPageShell,
  SettingsSectionCard
} from '@widgets/session-settings';
import {
  UnsavedChangesModal,
  useUnsavedChangesGuard
} from '@features/unsaved-changes';
import useLocale from '@shared/lib/useLocale';

/** Figma 977:33286 — 本地表单壳；Admin OpenAPI 暂无读写契约 */
type SessionSettingsForm = {
  enable_text: boolean;
  enable_image: boolean;
  enable_video: boolean;
  enable_audio: boolean;
  enable_file: boolean;
  enable_voice: boolean;
  enable_card: boolean;
  text_max_length: 500 | 1000 | 2000;
  image_max_mb: 5 | 10 | 20;
  video_max_mb: 50 | 100 | 200;
  audio_max_mb: 50 | 100 | 200;
  file_max_mb: 50 | 100 | 200;
  voice_min_sec: 1 | 2 | 3;
  voice_max_sec: 30 | 60 | 120;
  album_max: 9 | 12 | 20;
};

const DEFAULT_VALUES: SessionSettingsForm = {
  enable_text: true,
  enable_image: true,
  enable_video: true,
  enable_audio: true,
  enable_file: true,
  enable_voice: true,
  enable_card: true,
  text_max_length: 1000,
  image_max_mb: 10,
  video_max_mb: 100,
  audio_max_mb: 100,
  file_max_mb: 100,
  voice_min_sec: 2,
  voice_max_sec: 60,
  album_max: 12
};

function opt(t: Record<string, string>, key: string, n: number | string) {
  return t[key].replace('{n}', String(n));
}

/**
 * 会话设置 — Figma 977:33286
 * 侧栏二级直达；Admin OpenAPI 暂无契约，保存仅更新本地基线
 */
export default function SessionSettingsPage() {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<SessionSettingsForm>();
  const [baseline, setBaseline] = useState<SessionSettingsForm>(DEFAULT_VALUES);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const guard = useUnsavedChangesGuard(dirty);

  const anchors = useMemo(
    () => [
      { key: 'types', title: t['sessionSettings.section.types'] },
      { key: 'specs', title: t['sessionSettings.section.specs'] },
      { key: 'select', title: t['sessionSettings.section.select'] }
    ],
    [t]
  );

  const syncDirty = useCallback(() => {
    const values = { ...DEFAULT_VALUES, ...form.getFieldsValue() };
    setDirty(JSON.stringify(values) !== JSON.stringify(baseline));
  }, [form, baseline]);

  const resetToBaseline = useCallback(() => {
    form.setFieldsValue(baseline);
    setDirty(false);
  }, [form, baseline]);

  const handleCancel = () => {
    if (!dirty) return;
    guard.openResetConfirm();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const values = await form.validate();
      const next = { ...DEFAULT_VALUES, ...values };
      setBaseline(next);
      setDirty(false);
      Message.success(common['common.success']);
    } finally {
      setSaving(false);
    }
  };

  const onUnsavedLeave = () => {
    const mode = guard.leave();
    if (mode === 'reset') {
      resetToBaseline();
    }
  };

  const typeFields = useMemo(
    () =>
      (
        [
          ['enable_text', 'sessionSettings.type.text'],
          ['enable_image', 'sessionSettings.type.image'],
          ['enable_video', 'sessionSettings.type.video'],
          ['enable_audio', 'sessionSettings.type.audio'],
          ['enable_file', 'sessionSettings.type.file'],
          ['enable_voice', 'sessionSettings.type.voice'],
          ['enable_card', 'sessionSettings.type.card']
        ] as const
      ).map(([field, labelKey]) => ({ field, label: t[labelKey] })),
    [t]
  );

  return (
    <>
      <SettingsPageShell
        title={t['sessionSettings.title']}
        dirty={dirty}
        saving={saving}
        anchors={anchors}
        onCancel={handleCancel}
        onSave={handleSave}
      >
        <Form
          form={form}
          layout="horizontal"
          labelAlign="left"
          labelCol={{ flex: '160px' }}
          wrapperCol={{ flex: 1 }}
          initialValues={baseline}
          onValuesChange={syncDirty}
          className="use-session-settings-form flex flex-col gap-3 [&_.arco-form-label-item]:!flex [&_.arco-form-label-item]:!items-center [&_.arco-form-label-item_>label]:!whitespace-nowrap"
        >
          <SettingsSectionCard
            id="types"
            title={t['sessionSettings.section.types']}
          >
            {typeFields.map((item) => (
              <Form.Item
                key={item.field}
                field={item.field}
                label={item.label}
                triggerPropName="checked"
              >
                <Switch />
              </Form.Item>
            ))}
          </SettingsSectionCard>

          <SettingsSectionCard
            id="specs"
            title={t['sessionSettings.section.specs']}
          >
            <Form.Item
              field="text_max_length"
              label={t['sessionSettings.field.textMax']}
            >
              <Radio.Group>
                <Radio value={500}>
                  {opt(t, 'sessionSettings.opt.chars', 500)}
                </Radio>
                <Radio value={1000}>
                  {opt(t, 'sessionSettings.opt.chars', 1000)}
                </Radio>
                <Radio value={2000}>
                  {opt(t, 'sessionSettings.opt.chars', 2000)}
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              field="image_max_mb"
              label={t['sessionSettings.field.imageMax']}
            >
              <Radio.Group>
                <Radio value={5}>{opt(t, 'sessionSettings.opt.mb', 5)}</Radio>
                <Radio value={10}>{opt(t, 'sessionSettings.opt.mb', 10)}</Radio>
                <Radio value={20}>{opt(t, 'sessionSettings.opt.mb', 20)}</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              field="video_max_mb"
              label={t['sessionSettings.field.videoMax']}
            >
              <Radio.Group>
                <Radio value={50}>{opt(t, 'sessionSettings.opt.mb', 50)}</Radio>
                <Radio value={100}>
                  {opt(t, 'sessionSettings.opt.mb', 100)}
                </Radio>
                <Radio value={200}>
                  {opt(t, 'sessionSettings.opt.mb', 200)}
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              field="audio_max_mb"
              label={t['sessionSettings.field.audioMax']}
            >
              <Radio.Group>
                <Radio value={50}>{opt(t, 'sessionSettings.opt.mb', 50)}</Radio>
                <Radio value={100}>
                  {opt(t, 'sessionSettings.opt.mb', 100)}
                </Radio>
                <Radio value={200}>
                  {opt(t, 'sessionSettings.opt.mb', 200)}
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              field="file_max_mb"
              label={t['sessionSettings.field.fileMax']}
            >
              <Radio.Group>
                <Radio value={50}>{opt(t, 'sessionSettings.opt.mb', 50)}</Radio>
                <Radio value={100}>
                  {opt(t, 'sessionSettings.opt.mb', 100)}
                </Radio>
                <Radio value={200}>
                  {opt(t, 'sessionSettings.opt.mb', 200)}
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              field="voice_min_sec"
              label={t['sessionSettings.field.voiceMin']}
            >
              <Radio.Group>
                <Radio value={1}>{opt(t, 'sessionSettings.opt.sec', 1)}</Radio>
                <Radio value={2}>{opt(t, 'sessionSettings.opt.sec', 2)}</Radio>
                <Radio value={3}>{opt(t, 'sessionSettings.opt.sec', 3)}</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              field="voice_max_sec"
              label={t['sessionSettings.field.voiceMax']}
            >
              <Radio.Group>
                <Radio value={30}>{opt(t, 'sessionSettings.opt.sec', 30)}</Radio>
                <Radio value={60}>{opt(t, 'sessionSettings.opt.min', 1)}</Radio>
                <Radio value={120}>
                  {opt(t, 'sessionSettings.opt.min', 2)}
                </Radio>
              </Radio.Group>
            </Form.Item>
          </SettingsSectionCard>

          <SettingsSectionCard
            id="select"
            title={t['sessionSettings.section.select']}
          >
            <Form.Item
              field="album_max"
              label={t['sessionSettings.field.albumMax']}
            >
              <Radio.Group>
                <Radio value={9}>{opt(t, 'sessionSettings.opt.count', 9)}</Radio>
                <Radio value={12}>
                  {opt(t, 'sessionSettings.opt.count', 12)}
                </Radio>
                <Radio value={20}>
                  {opt(t, 'sessionSettings.opt.count', 20)}
                </Radio>
              </Radio.Group>
            </Form.Item>
          </SettingsSectionCard>
        </Form>
      </SettingsPageShell>

      <UnsavedChangesModal
        visible={guard.visible}
        onStay={guard.stay}
        onLeave={onUnsavedLeave}
      />
    </>
  );
}
