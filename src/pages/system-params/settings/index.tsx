import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
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
import { postV1AdminSystemSettingsUpdate } from '@shared/api/admin/platform';
import { systemSettingsStore } from '@entities/system-settings';
import { GlobalContext } from '@shared/lib/global-context';
import useLocale from '@shared/lib/useLocale';
import {
  ADMIN_IMAGE_ACCEPT,
  uploadAdminImage,
  validateAdminImage
} from '@shared/lib/uploadAdminImage';

/** 与 AdminAPI.SystemSetting / UpdateSystemSettingRequest 对齐（Figma 979:38548） */
type ParamsForm = {
  system_name: string;
  logo_url?: string;
  locale: 'zh-CN' | 'en-US';
  time_format: '12' | '24';
  ip_whitelist_enabled: boolean;
};

const DEFAULT_VALUES: ParamsForm = {
  system_name: '后台管理系统',
  logo_url: undefined,
  locale: 'zh-CN',
  time_format: '12',
  ip_whitelist_enabled: true
};

function settingToForm(setting: AdminAPI.SystemSetting): ParamsForm {
  return {
    system_name: setting.system_name || DEFAULT_VALUES.system_name,
    logo_url: setting.logo_url || undefined,
    locale: setting.default_language === 'en-US' ? 'en-US' : 'zh-CN',
    time_format: setting.time_format === '24h' ? '24' : '12',
    ip_whitelist_enabled: Boolean(setting.ip_whitelist_enabled)
  };
}

/**
 * 对齐 UpdateSystemSettingRequest：system_name 必填；
 * 其余字段可选，不传保留原值；logo_url 传空字符串表示清空。
 */
/** 统一空 Logo，避免 undefined / '' 导致 dirty 对比失真 */
function normalizeParamsForm(values: ParamsForm): ParamsForm {
  return {
    system_name: values.system_name?.trim() || '',
    logo_url: values.logo_url?.trim() || undefined,
    locale: values.locale === 'en-US' ? 'en-US' : 'zh-CN',
    time_format: values.time_format === '24' ? '24' : '12',
    ip_whitelist_enabled: Boolean(values.ip_whitelist_enabled)
  };
}

function formToUpdateBody(
  values: ParamsForm,
  baseline: ParamsForm
): AdminAPI.UpdateSystemSettingRequest {
  const body: AdminAPI.UpdateSystemSettingRequest = {
    system_name: values.system_name.trim()
  };
  const nextLogo = values.logo_url?.trim() || '';
  const prevLogo = baseline.logo_url?.trim() || '';
  if (nextLogo !== prevLogo) {
    body.logo_url = nextLogo;
  }
  if (values.locale !== baseline.locale) {
    body.default_language = values.locale;
  }
  const nextTime = values.time_format === '24' ? '24h' : '12h';
  const prevTime = baseline.time_format === '24' ? '24h' : '12h';
  if (nextTime !== prevTime) {
    body.time_format = nextTime;
  }
  if (values.ip_whitelist_enabled !== baseline.ip_whitelist_enabled) {
    body.ip_whitelist_enabled = values.ip_whitelist_enabled;
  }
  return body;
}

function ReplaceTrigger({ label }: { label: string }) {
  return (
    <div className="box-border flex size-10 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg border border-dashed border-[rgba(0,0,0,0.08)] bg-[var(--color-fill-1,#f7f8fa)]">
      <IconPlus className="text-[12px] text-arco-text-2" />
      <span className="text-[10px] font-medium leading-none text-arco-text-2">
        {label}
      </span>
    </div>
  );
}

/** 注册表单字段但不渲染 UI（供 logo_url 等自定义上传字段） */
function FormSilentValue(_props: {
  value?: string;
  onChange?: (value?: string) => void;
}) {
  return null;
}

/**
 * 系统参数设置 — Figma 979:38548
 * 读写：postV1AdminSystemSettingsGet / Update
 * Logo：upload-credential 直传后写 logo_url
 */
export default function SystemParamsPage() {
  const t = useLocale();
  const common = t;
  const { setLang } = useContext(GlobalContext);
  const [form] = Form.useForm<ParamsForm>();
  const logoUrl = Form.useWatch('logo_url', form);
  const [baseline, setBaseline] = useState<ParamsForm>(() => ({
    ...DEFAULT_VALUES,
    system_name: t['common.appName'] || DEFAULT_VALUES.system_name
  }));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoUploading, setLogoUploading] = useState(false);

  const guard = useUnsavedChangesGuard(dirty);

  const anchors = useMemo(
    () => [
      { key: 'basic', title: t['paramsSettings.section.basic'] },
      { key: 'security', title: t['paramsSettings.section.security'] }
    ],
    [t]
  );

  const applyBaseline = useCallback(
    (next: ParamsForm) => {
      setBaseline(next);
      form.setFieldsValue(next);
      setDirty(false);
    },
    [form]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // 优先用启动时已拉取的全局缓存，并再拉一次保证编辑页最新
    void systemSettingsStore.fetch().then((setting) => {
      if (cancelled) return;
      if (setting) applyBaseline(settingToForm(setting));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [applyBaseline]);

  const syncDirty = useCallback(() => {
    const logoRaw = form.getFieldValue('logo_url');
    const values = normalizeParamsForm({
      ...DEFAULT_VALUES,
      ...form.getFieldsValue(),
      // Logo 用自定义上传，须显式读取（仅靠 getFieldsValue 可能丢未注册字段）
      logo_url: typeof logoRaw === 'string' ? logoRaw : undefined
    });
    setDirty(
      JSON.stringify(values) !== JSON.stringify(normalizeParamsForm(baseline))
    );
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
      const logoRaw = form.getFieldValue('logo_url');
      const values = normalizeParamsForm({
        ...DEFAULT_VALUES,
        ...form.getFieldsValue(),
        logo_url: typeof logoRaw === 'string' ? logoRaw : undefined
      });
      await postV1AdminSystemSettingsUpdate(formToUpdateBody(values, baseline));
      const setting = await systemSettingsStore.fetch();
      if (setting) {
        applyBaseline(settingToForm(setting));
        setLang?.(systemSettingsStore.defaultLanguage);
      } else {
        applyBaseline(values);
      }
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

  /** Logo：upload-credential 直传，保存时提交 logo_url */
  const beforeUploadLogo = (file: File) => {
    if (logoUploading) return false;
    const invalid = validateAdminImage(file);
    if (invalid === 'type') {
      Message.warning(common['common.upload.imageType']);
      return false;
    }
    if (invalid === 'size') {
      Message.warning(t['paramsSettings.msg.logoSize']);
      return false;
    }
    void (async () => {
      try {
        setLogoUploading(true);
        const url = await uploadAdminImage(file);
        form.setFieldsValue({ logo_url: url });
        // setFieldsValue 不触发 onValuesChange，需手动同步 dirty
        syncDirty();
      } catch {
        Message.error(common['common.upload.failed']);
      } finally {
        setLogoUploading(false);
      }
    })();
    return false;
  };

  return (
    <>
      <SettingsPageShell
        title={t['paramsSettings.title']}
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
          className="use-params-settings-form flex flex-col gap-3 [&_.arco-form-label-item]:!flex [&_.arco-form-label-item]:!items-center [&_.arco-form-label-item_>label]:!whitespace-nowrap"
        >
          <SettingsSectionCard
            id="basic"
            title={t['paramsSettings.section.basic']}
          >
            <Form.Item
              field="system_name"
              label={t['paramsSettings.field.systemName']}
              rules={[
                {
                  required: true,
                  message: common['common.form.required'].replace(
                    '{label}',
                    t['paramsSettings.field.systemName']
                  )
                }
              ]}
            >
              <Input allowClear />
            </Form.Item>

            {/* 仅注册 logo_url，界面不展示 URL */}
            <Form.Item field="logo_url" noStyle>
              <FormSilentValue />
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
                    accept={ADMIN_IMAGE_ACCEPT}
                    showUploadList={false}
                    disabled={logoUploading}
                    beforeUpload={beforeUploadLogo}
                  >
                    <ReplaceTrigger
                      label={
                        logoUploading
                          ? common['common.upload.uploading']
                          : t['paramsSettings.replace']
                      }
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
                  { label: common['common.lang.zh'], value: 'zh-CN' },
                  { label: common['common.lang.en'], value: 'en-US' }
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
