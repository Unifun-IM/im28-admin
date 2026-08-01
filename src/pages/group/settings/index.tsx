import React, { useCallback, useMemo, useState } from 'react';
import { Form, InputNumber, Message, Radio } from '@arco-design/web-react';
import {
  SettingsPageShell,
  SettingsSectionCard
} from '@widgets/session-settings';
import {
  UnsavedChangesModal,
  useUnsavedChangesGuard
} from '@features/unsaved-changes';
import useLocale from '@shared/lib/useLocale';

/** Figma 770:22608 — 本地表单壳；Admin OpenAPI 暂无读写契约 */
type GroupSettingsForm = {
  min_group_members: number;
  max_group_members: number;
  announcement_max_len: 500 | 1000 | 2000;
};

const DEFAULT_VALUES: GroupSettingsForm = {
  min_group_members: 3,
  max_group_members: 30000,
  announcement_max_len: 1000
};

/**
 * 群组设置 — Figma 770:22608
 */
export default function GroupSettingsPage() {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<GroupSettingsForm>();
  const [baseline, setBaseline] = useState<GroupSettingsForm>(DEFAULT_VALUES);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const guard = useUnsavedChangesGuard(dirty);

  const anchors = useMemo(
    () => [{ key: 'basic', title: t['groupSettings.section.basic'] }],
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

  return (
    <>
      <SettingsPageShell
        title={t['groupSettings.title']}
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
                field="min_group_members"
                label={t['groupSettings.field.minMembers']}
                rules={[
                  {
                    required: true,
                    message: t['groupSettings.msg.minMembersRequired']
                  }
                ]}
              >
                <InputNumber min={2} max={999} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                field="max_group_members"
                label={t['groupSettings.field.maxMembers']}
                rules={[
                  {
                    required: true,
                    message: t['groupSettings.msg.maxMembersRequired']
                  }
                ]}
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

            <SettingsSectionCard title={t['groupSettings.section.content']}>
              <Form.Item
                field="announcement_max_len"
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
