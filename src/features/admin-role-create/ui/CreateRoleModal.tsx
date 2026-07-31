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
      Message.success('ok');
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
      title="新建角色"
      visible={visible}
      onCancel={onCancel}
      unmountOnExit
      maskClosable={false}
      style={{ width: 560 }}
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <span>is_enable</span>
            <Switch
              checked={isEnable !== false}
              onChange={(v) => form.setFieldValue('is_enable', v)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" loading={submitting} onClick={submit}>
              确认创建
            </Button>
          </div>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <FormItem field="code" label="code" rules={[{ required: true }]}>
          <Input placeholder="code" />
        </FormItem>
        <FormItem field="name" label="name" rules={[{ required: true }]}>
          <Input placeholder="name" />
        </FormItem>
        <FormItem field="description" label="description">
          <Input placeholder="description" />
        </FormItem>
        <FormItem field="permission_ids_text" label="permission_ids">
          <Input.TextArea placeholder="permission_ids，逗号分隔" />
        </FormItem>
      </Form>
    </Modal>
  );
}
