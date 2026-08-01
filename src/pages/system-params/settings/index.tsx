import React, { useCallback, useMemo, useState } from 'react';
import {
  Form,
  Input,
  Message,
  Radio,
  Select,
  Switch,
  Upload
} from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import {
  SettingsPageShell,
  SettingsSectionCard
} from '@widgets/session-settings';
import {
  UnsavedChangesModal,
  useUnsavedChangesGuard
} from '@features/unsaved-changes';
import useLocale from '@shared/lib/useLocale';

type ParamsForm = {
  system_name: string;
  logo_url?: string;
  cover_url?: string;
  locale: 'zh-CN' | 'en-US';
  timezone: string;
  time_format: '12' | '24';
  ip_whitelist_enabled: boolean;
};

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

const DEFAULT_VALUES: ParamsForm = {
  system_name: '后台管理系统',
  logo_url: undefined,
  cover_url: undefined,
  locale: 'zh-CN',
  timezone: 'system',
  time_format: '12',
  ip_whitelist_enabled: true
};

function ReplaceTrigger({
  label,
  tall
}: {
  label: string;
  tall?: boolean;
}) {
  return (
    <div
      className={
        tall
          ? 'box-border flex h-[67px] w-10 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-[rgba(0,0,0,0.08)] bg-[var(--color-fill-1,#f7f8fa)]'
          : 'box-border flex size-10 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-[rgba(0,0,0,0.08)] bg-[var(--color-fill-1,#f7f8fa)]'
      }
    >
      <IconPlus className="text-[12px] text-arco-text-2" />
      <span className="text-[10px] font-medium leading-none text-arco-text-2">
        {label}
      </span>
    </div>
  );
}

/**
 * 系统参数设置 — Figma 979:38548
 * 未保存离开：改配置后切换菜单/返回/关浏览器提醒；保存后或未修改不提醒
 * OpenAPI 未覆盖读写：保存提示接口未就绪，并同步本地基线以符合离开规则
 */
export default function SystemParamsPage() {
  const t = useLocale();
  const [form] = Form.useForm<ParamsForm>();
  const logoUrl = Form.useWatch('logo_url', form);
  const coverUrl = Form.useWatch('cover_url', form);
  const [baseline, setBaseline] = useState<ParamsForm>(() => ({
    ...DEFAULT_VALUES,
    system_name: t['common.appName'] || DEFAULT_VALUES.system_name
  }));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const guard = useUnsavedChangesGuard(dirty);

  const anchors = useMemo(
    () => [
      { key: 'basic', title: t['paramsSettings.section.basic'] },
      { key: 'security', title: t['paramsSettings.section.security'] }
    ],
    [t]
  );

  const syncDirty = useCallback(() => {
    const values = { ...DEFAULT_VALUES, ...form.getFieldsValue() };
    setDirty(JSON.stringify(values) !== JSON.stringify(baseline));
  }, [baseline, form]);

  const resetToBaseline = useCallback(() => {
    form.setFieldsValue(baseline);
    setDirty(false);
  }, [baseline, form]);

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
      Message.warning(t['common.apiNotReady']);
      const values = {
        ...DEFAULT_VALUES,
        ...form.getFieldsValue()
      } as ParamsForm;
      setBaseline(values);
      setDirty(false);
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

  const beforeUpload = (
    file: File,
    field: 'logo_url' | 'cover_url',
    maxBytes: number
  ) => {
    if (!IMAGE_TYPES.includes(file.type)) {
      Message.warning(t['paramsSettings.msg.imageType']);
      return false;
    }
    if (file.size > maxBytes) {
      Message.warning(
        field === 'logo_url'
          ? t['paramsSettings.msg.logoSize']
          : t['paramsSettings.msg.coverSize']
      );
      return false;
    }
    form.setFieldValue(field, URL.createObjectURL(file));
    syncDirty();
    return false;
  };

  return (
    <>
      <SettingsPageShell
        title={t['paramsSettings.title']}
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
          className="use-params-settings-form flex flex-col gap-3 [&_.arco-form-label-item]:!flex [&_.arco-form-label-item]:!items-center [&_.arco-form-label-item_>label]:!whitespace-nowrap"
        >
          <SettingsSectionCard
            id="basic"
            title={t['paramsSettings.section.basic']}
          >
            <Form.Item
              field="system_name"
              label={t['paramsSettings.field.systemName']}
              rules={[{ required: true }]}
            >
              <Input allowClear />
            </Form.Item>

            <Form.Item label={t['paramsSettings.field.logo']}>
              <div className="rounded-xl border border-solid border-[rgba(0,0,0,0.08)] px-3 py-2">
                <p className="m-0 mb-2 text-[12px] leading-3 text-arco-text-3">
                  {t['paramsSettings.logo.tip']}
                </p>
                <div className="flex items-start gap-3">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt=""
                      className="size-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="size-10 rounded-lg bg-[var(--color-fill-1,#f7f8fa)]" />
                  )}
                  <Upload
                    accept=".png,.jpg,.jpeg,.webp"
                    showUploadList={false}
                    beforeUpload={(file) =>
                      beforeUpload(file, 'logo_url', 1 * 1024 * 1024)
                    }
                  >
                    <ReplaceTrigger label={t['paramsSettings.replace']} />
                  </Upload>
                </div>
              </div>
            </Form.Item>

            <Form.Item label={t['paramsSettings.field.cover']}>
              <div className="rounded-xl border border-solid border-[rgba(0,0,0,0.08)] px-3 py-2">
                <p className="m-0 mb-2 text-[12px] leading-3 text-arco-text-3">
                  {t['paramsSettings.cover.tip']}
                </p>
                <div className="flex items-start gap-3">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt=""
                      className="h-[67px] w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-[67px] w-10 rounded-lg bg-[var(--color-fill-1,#f7f8fa)]" />
                  )}
                  <Upload
                    accept=".png,.jpg,.jpeg,.webp"
                    showUploadList={false}
                    beforeUpload={(file) =>
                      beforeUpload(file, 'cover_url', 5 * 1024 * 1024)
                    }
                  >
                    <ReplaceTrigger
                      label={t['paramsSettings.replace']}
                      tall
                    />
                  </Upload>
                </div>
              </div>
            </Form.Item>

            <Form.Item
              field="locale"
              label={t['paramsSettings.field.locale']}
            >
              <Select
                options={[
                  { label: t['common.lang.zh'], value: 'zh-CN' },
                  { label: t['common.lang.en'], value: 'en-US' }
                ]}
              />
            </Form.Item>

            <Form.Item
              field="timezone"
              label={t['paramsSettings.field.timezone']}
            >
              <Select
                options={[
                  {
                    label: t['paramsSettings.timezone.system'],
                    value: 'system'
                  }
                ]}
              />
            </Form.Item>

            <Form.Item
              field="time_format"
              label={t['paramsSettings.field.timeFormat']}
            >
              <Radio.Group>
                <Radio value="12">{t['paramsSettings.timeFormat.12']}</Radio>
                <Radio value="24">{t['paramsSettings.timeFormat.24']}</Radio>
              </Radio.Group>
            </Form.Item>
          </SettingsSectionCard>

          <SettingsSectionCard
            id="security"
            title={t['paramsSettings.section.security']}
          >
            <Form.Item
              field="ip_whitelist_enabled"
              label={t['paramsSettings.field.ipWhitelist']}
              triggerPropName="checked"
            >
              <Switch />
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
