import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Switch
} from '@arco-design/web-react';
import { postV1AdminRolesCreate } from '@shared/api/admin/rbac';
import useLocale from '@shared/lib/useLocale';
import './create-role-modal.less';

const FormItem = Form.Item;

export type CreateRoleModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
};

/** 新建角色 — AdminAPI.CreateSysRoleRequest */
export default function CreateRoleModal({
  visible,
  onCancel,
  onSuccess
}: CreateRoleModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<
    AdminAPI.CreateSysRoleRequest & { permission_ids_text?: string }
  >();
  const [submitting, setSubmitting] = useState(false);
  const isEnable = Form.useWatch('is_enable', form);

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    form.setFieldsValue({ is_enable: true });
  }, [visible, form]);

  const submit = async () => {
    try {
      const values = await form.validate();
      setSubmitting(true);
      const permission_ids = String(values.permission_ids_text || '')
        .split(/[\s,，]+/)
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0);
      await postV1AdminRolesCreate({
        code: values.code,
        name: values.name,
        description: values.description,
        is_enable: values.is_enable !== false,
        permission_ids: permission_ids.length ? permission_ids : undefined
      });
      Message.success(common['common.success']);
      onSuccess?.();
      onCancel();
    } catch {
      // validate
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={t['createRole.title']}
      visible={visible}
      onCancel={onCancel}
      unmountOnExit
      maskClosable={false}
      style={{ width: 560 }}
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{t['createRole.field.isEnable']}</span>
            <Switch
              checked={isEnable !== false}
              onChange={(v) => form.setFieldValue('is_enable', v)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onCancel}>{common['common.cancel']}</Button>
            <Button type="primary" loading={submitting} onClick={submit}>
              {common['common.create']}
            </Button>
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <FormItem field="code" label={t['createRole.field.code']} rules={[{ required: true }]}>
          <Input placeholder={t['createRole.placeholder.code']} />
        </FormItem>
        <FormItem field="name" label={t['createRole.field.name']} rules={[{ required: true }]}>
          <Input placeholder={t['createRole.placeholder.name']} />
        </FormItem>
        <FormItem field="description" label={common['common.description']}>
          <Input placeholder={common['common.placeholder']} />
        </FormItem>
        <FormItem field="permission_ids_text" label={t['createRole.field.permissionIds']}>
          <Input.TextArea placeholder={t['createRole.placeholder.permissionIds']} />
        </FormItem>
      </Form>
    </Modal>
  );
}
