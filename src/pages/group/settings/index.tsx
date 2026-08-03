import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, InputNumber, Message, Radio } from '@arco-design/web-react';
import {
  SettingsPageShell,
  SettingsSectionCard
} from '@widgets/session-settings';
import {
  UnsavedChangesModal,
  useUnsavedChangesGuard
} from '@features/unsaved-changes';
import {
  postV1AdminGroupsSettingsGet,
  postV1AdminGroupsSettingsUpdate
} from '@shared/api/admin/groups';
import useLocale from '@shared/lib/useLocale';

/** 与 AdminAPI.AdminGroupGlobalSetting / AdminUpdateGroupGlobalSettingRequest 对齐（Figma 1125:26470） */
type GroupSettingsForm = {
  create_group_min_member_count: number;
  normal_group_member_limit: number;
  announcement_max_length: 500 | 1000 | 2000;
};

const DEFAULT_VALUES: GroupSettingsForm = {
  create_group_min_member_count: 3,
  normal_group_member_limit: 30000,
  announcement_max_length: 1000
};

function settingToForm(
  setting?: AdminAPI.AdminGroupGlobalSetting | null
): GroupSettingsForm {
  const len = setting?.announcement_max_length;
  return {
    create_group_min_member_count:
      setting?.create_group_min_member_count ??
      DEFAULT_VALUES.create_group_min_member_count,
    normal_group_member_limit:
      setting?.normal_group_member_limit ??
      DEFAULT_VALUES.normal_group_member_limit,
    announcement_max_length:
      len === 500 || len === 1000 || len === 2000
        ? len
        : DEFAULT_VALUES.announcement_max_length
  };
}

function formToUpdateBody(
  values: GroupSettingsForm
): AdminAPI.AdminUpdateGroupGlobalSettingRequest {
  return {
    create_group_min_member_count: values.create_group_min_member_count,
    normal_group_member_limit: values.normal_group_member_limit,
    announcement_max_length: values.announcement_max_length
  };
}

/**
 * 群设置 — Figma 1125:26470
 * 读写：postV1AdminGroupsSettingsGet / Update
 */
export default function GroupSettingsPage() {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<GroupSettingsForm>();
  const [baseline, setBaseline] = useState<GroupSettingsForm>(DEFAULT_VALUES);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const guard = useUnsavedChangesGuard(dirty);

  const anchors = useMemo(
    () => [{ key: 'basic', title: t['groupSettings.section.basic'] }],
    [t]
  );

  const applyBaseline = useCallback(
    (next: GroupSettingsForm) => {
      setBaseline(next);
      form.setFieldsValue(next);
      setDirty(false);
    },
    [form]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void postV1AdminGroupsSettingsGet()
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
      } as GroupSettingsForm;
      await postV1AdminGroupsSettingsUpdate(formToUpdateBody(values));
      const res = await postV1AdminGroupsSettingsGet();
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

  return (
    <>
      <SettingsPageShell
        title={t['groupSettings.title']}
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
          colon={false}
          labelCol={{ flex: '160px' }}
          wrapperCol={{ flex: 1 }}
          initialValues={baseline}
          onValuesChange={syncDirty}
          className="use-session-settings-form flex flex-col gap-3 [&_.arco-form-label-item]:!flex [&_.arco-form-label-item]:!items-center [&_.arco-form-label-item_>label]:!whitespace-nowrap"
        >
          <div id="basic" className="flex scroll-mt-3 flex-col gap-3">
            <SettingsSectionCard title={t['groupSettings.section.limit']}>
              <Form.Item
                field="create_group_min_member_count"
                label={t['groupSettings.field.minMembers']}
                rules={[
                  {
                    required: true,
                    message: t['groupSettings.msg.minMembersRequired']
                  }
                ]}
              >
                <InputNumber
                  hideControl
                  min={2}
                  max={999}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item
                field="normal_group_member_limit"
                label={t['groupSettings.field.maxMembers']}
                rules={[
                  {
                    required: true,
                    message: t['groupSettings.msg.maxMembersRequired']
                  }
                ]}
              >
                <InputNumber
                  hideControl
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

            <SettingsSectionCard title={t['groupSettings.section.content']}>
              <Form.Item
                field="announcement_max_length"
                label={t['groupSettings.field.announcementMax']}
                rules={[
                  {
                    required: true,
                    message: t['groupSettings.msg.announcementRequired']
                  }
                ]}
              >
                <Radio.Group className="use-session-settings-radio">
                  <Radio value={500}>
                    {t['sessionSettings.opt.chars'].replace('{n}', '500')}
                  </Radio>
                  <Radio value={1000}>
                    {t['sessionSettings.opt.chars'].replace('{n}', '1000')}
                  </Radio>
                  <Radio value={2000}>
                    {t['sessionSettings.opt.chars'].replace('{n}', '2000')}
                  </Radio>
                </Radio.Group>
              </Form.Item>
            </SettingsSectionCard>
          </div>
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
