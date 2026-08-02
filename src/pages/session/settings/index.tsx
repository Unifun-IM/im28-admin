import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Message, Radio, Switch } from '@arco-design/web-react';
import {
  SettingsPageShell,
  SettingsSectionCard
} from '@widgets/session-settings';
import {
  UnsavedChangesModal,
  useUnsavedChangesGuard
} from '@features/unsaved-changes';
import {
  postV1AdminConversationsSettingsGet,
  postV1AdminConversationsSettingsUpdate
} from '@shared/api/admin/adminhuihuashezhi';
import useLocale from '@shared/lib/useLocale';

/** 与 AdminAPI.AdminUpdateConversationGlobalSettingRequest 对齐（Figma 977:33286） */
type SessionSettingsForm = AdminAPI.AdminUpdateConversationGlobalSettingRequest;

/** 字面量字节值，保持与 AdminUpdateConversationGlobalSettingRequest 联合类型一致 */
const IMAGE_SIZE = {
  5: 5_242_880,
  10: 10_485_760,
  20: 20_971_520
} as const;
const MEDIA_SIZE = {
  50: 52_428_800,
  100: 104_857_600,
  200: 209_715_200
} as const;

const DEFAULT_VALUES: SessionSettingsForm = {
  text_message_enabled: true,
  image_message_enabled: true,
  video_message_enabled: true,
  audio_message_enabled: true,
  file_message_enabled: true,
  voice_message_enabled: true,
  card_message_enabled: true,
  text_max_length: 1000,
  image_max_size_bytes: IMAGE_SIZE[10],
  video_max_size_bytes: MEDIA_SIZE[100],
  audio_max_size_bytes: MEDIA_SIZE[100],
  file_max_size_bytes: MEDIA_SIZE[100],
  voice_min_duration_seconds: 2,
  voice_max_duration_seconds: 60,
  album_selection_limit: 12
};

function pickEnum<T extends number>(
  value: number | undefined,
  allowed: readonly T[],
  fallback: T
): T {
  return (allowed as readonly number[]).includes(value as number)
    ? (value as T)
    : fallback;
}

function settingToForm(
  setting?: AdminAPI.AdminConversationGlobalSetting | null
): SessionSettingsForm {
  return {
    text_message_enabled:
      setting?.text_message_enabled ?? DEFAULT_VALUES.text_message_enabled,
    image_message_enabled:
      setting?.image_message_enabled ?? DEFAULT_VALUES.image_message_enabled,
    video_message_enabled:
      setting?.video_message_enabled ?? DEFAULT_VALUES.video_message_enabled,
    audio_message_enabled:
      setting?.audio_message_enabled ?? DEFAULT_VALUES.audio_message_enabled,
    file_message_enabled:
      setting?.file_message_enabled ?? DEFAULT_VALUES.file_message_enabled,
    voice_message_enabled:
      setting?.voice_message_enabled ?? DEFAULT_VALUES.voice_message_enabled,
    card_message_enabled:
      setting?.card_message_enabled ?? DEFAULT_VALUES.card_message_enabled,
    text_max_length: pickEnum(
      setting?.text_max_length,
      [500, 1000, 2000] as const,
      DEFAULT_VALUES.text_max_length
    ),
    image_max_size_bytes: pickEnum(
      setting?.image_max_size_bytes,
      [IMAGE_SIZE[5], IMAGE_SIZE[10], IMAGE_SIZE[20]] as const,
      DEFAULT_VALUES.image_max_size_bytes
    ),
    video_max_size_bytes: pickEnum(
      setting?.video_max_size_bytes,
      [MEDIA_SIZE[50], MEDIA_SIZE[100], MEDIA_SIZE[200]] as const,
      DEFAULT_VALUES.video_max_size_bytes
    ),
    audio_max_size_bytes: pickEnum(
      setting?.audio_max_size_bytes,
      [MEDIA_SIZE[50], MEDIA_SIZE[100], MEDIA_SIZE[200]] as const,
      DEFAULT_VALUES.audio_max_size_bytes
    ),
    file_max_size_bytes: pickEnum(
      setting?.file_max_size_bytes,
      [MEDIA_SIZE[50], MEDIA_SIZE[100], MEDIA_SIZE[200]] as const,
      DEFAULT_VALUES.file_max_size_bytes
    ),
    voice_min_duration_seconds: pickEnum(
      setting?.voice_min_duration_seconds,
      [1, 2, 3] as const,
      DEFAULT_VALUES.voice_min_duration_seconds
    ),
    voice_max_duration_seconds: pickEnum(
      setting?.voice_max_duration_seconds,
      [30, 60, 120] as const,
      DEFAULT_VALUES.voice_max_duration_seconds
    ),
    album_selection_limit: pickEnum(
      setting?.album_selection_limit,
      [9, 12, 20] as const,
      DEFAULT_VALUES.album_selection_limit
    )
  };
}

function formToUpdateBody(
  values: SessionSettingsForm
): AdminAPI.AdminUpdateConversationGlobalSettingRequest {
  return { ...values };
}

function opt(t: Record<string, string>, key: string, n: number | string) {
  return t[key].replace('{n}', String(n));
}

/**
 * 会话设置 — Figma 977:33286
 * 读写：postV1AdminConversationsSettingsGet / Update
 */
export default function SessionSettingsPage() {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<SessionSettingsForm>();
  const [baseline, setBaseline] = useState<SessionSettingsForm>(DEFAULT_VALUES);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const guard = useUnsavedChangesGuard(dirty);

  const anchors = useMemo(
    () => [
      { key: 'types', title: t['sessionSettings.section.types'] },
      { key: 'specs', title: t['sessionSettings.section.specs'] },
      { key: 'select', title: t['sessionSettings.section.select'] }
    ],
    [t]
  );

  const applyBaseline = useCallback(
    (next: SessionSettingsForm) => {
      setBaseline(next);
      form.setFieldsValue(next);
      setDirty(false);
    },
    [form]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void postV1AdminConversationsSettingsGet()
      .then((res) => {
        if (cancelled) return;
        applyBaseline(settingToForm(res.data?.setting));
      })
      .catch(() => {
        // request
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applyBaseline]);

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
    try {
      await form.validate();
    } catch {
      return;
    }
    setSaving(true);
    try {
      const values = {
        ...DEFAULT_VALUES,
        ...form.getFieldsValue()
      } as SessionSettingsForm;
      await postV1AdminConversationsSettingsUpdate(formToUpdateBody(values));
      const res = await postV1AdminConversationsSettingsGet();
      applyBaseline(settingToForm(res.data?.setting ?? values));
      Message.success(common['common.success']);
    } catch {
      // request
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
          ['text_message_enabled', 'sessionSettings.type.text'],
          ['image_message_enabled', 'sessionSettings.type.image'],
          ['video_message_enabled', 'sessionSettings.type.video'],
          ['audio_message_enabled', 'sessionSettings.type.audio'],
          ['file_message_enabled', 'sessionSettings.type.file'],
          ['voice_message_enabled', 'sessionSettings.type.voice'],
          ['card_message_enabled', 'sessionSettings.type.card']
        ] as const
      ).map(([field, labelKey]) => ({ field, label: t[labelKey] })),
    [t]
  );

  return (
    <>
      <SettingsPageShell
        title={t['sessionSettings.title']}
        loading={loading}
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
              field="image_max_size_bytes"
              label={t['sessionSettings.field.imageMax']}
            >
              <Radio.Group>
                <Radio value={IMAGE_SIZE[5]}>
                  {opt(t, 'sessionSettings.opt.mb', 5)}
                </Radio>
                <Radio value={IMAGE_SIZE[10]}>
                  {opt(t, 'sessionSettings.opt.mb', 10)}
                </Radio>
                <Radio value={IMAGE_SIZE[20]}>
                  {opt(t, 'sessionSettings.opt.mb', 20)}
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              field="video_max_size_bytes"
              label={t['sessionSettings.field.videoMax']}
            >
              <Radio.Group>
                <Radio value={MEDIA_SIZE[50]}>
                  {opt(t, 'sessionSettings.opt.mb', 50)}
                </Radio>
                <Radio value={MEDIA_SIZE[100]}>
                  {opt(t, 'sessionSettings.opt.mb', 100)}
                </Radio>
                <Radio value={MEDIA_SIZE[200]}>
                  {opt(t, 'sessionSettings.opt.mb', 200)}
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              field="audio_max_size_bytes"
              label={t['sessionSettings.field.audioMax']}
            >
              <Radio.Group>
                <Radio value={MEDIA_SIZE[50]}>
                  {opt(t, 'sessionSettings.opt.mb', 50)}
                </Radio>
                <Radio value={MEDIA_SIZE[100]}>
                  {opt(t, 'sessionSettings.opt.mb', 100)}
                </Radio>
                <Radio value={MEDIA_SIZE[200]}>
                  {opt(t, 'sessionSettings.opt.mb', 200)}
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              field="file_max_size_bytes"
              label={t['sessionSettings.field.fileMax']}
            >
              <Radio.Group>
                <Radio value={MEDIA_SIZE[50]}>
                  {opt(t, 'sessionSettings.opt.mb', 50)}
                </Radio>
                <Radio value={MEDIA_SIZE[100]}>
                  {opt(t, 'sessionSettings.opt.mb', 100)}
                </Radio>
                <Radio value={MEDIA_SIZE[200]}>
                  {opt(t, 'sessionSettings.opt.mb', 200)}
                </Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              field="voice_min_duration_seconds"
              label={t['sessionSettings.field.voiceMin']}
            >
              <Radio.Group>
                <Radio value={1}>{opt(t, 'sessionSettings.opt.sec', 1)}</Radio>
                <Radio value={2}>{opt(t, 'sessionSettings.opt.sec', 2)}</Radio>
                <Radio value={3}>{opt(t, 'sessionSettings.opt.sec', 3)}</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              field="voice_max_duration_seconds"
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
              field="album_selection_limit"
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
