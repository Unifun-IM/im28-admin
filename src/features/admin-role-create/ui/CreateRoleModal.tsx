import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Switch
} from '@arco-design/web-react';
import { createRole } from '@shared/api/biz';
import PermissionConfig from './PermissionConfig';
import './create-role-modal.less';

const FormItem = Form.Item;

export type CreateRoleModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
};

/**
 * 新建角色 — Figma 666:21515
 */
export default function CreateRoleModal({
  visible,
  onCancel,
  onSuccess
}: CreateRoleModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const enabled = Form.useWatch('enabled', form);

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    form.setFieldsValue({
      enabled: true,
      perms: []
    });
  }, [visible, form]);

  const submit = async () => {
    try {
      const values = await form.validate();
      if (!values.perms?.length) {
        Message.warning('请至少选择一项权限');
        return;
      }
      setSubmitting(true);
      await createRole({
        name: values.name,
        desc: values.desc || '',
        enabled: values.enabled !== false,
        perms: values.perms
      });
      Message.success('角色创建成功');
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
      className="use-create-role-modal"
      wrapClassName="use-create-role-modal-wrap"
      style={{ width: 780 }}
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[14px] leading-[21px] text-arco-text-1">
              启用角色
            </span>
            <Switch
              checked={enabled !== false}
              className="use-switch-success"
              onChange={(v) => form.setFieldValue('enabled', v)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button className="!min-w-[80px]" onClick={onCancel}>
              取消
            </Button>
            <Button
              type="primary"
              className="!min-w-[80px]"
              loading={submitting}
              onClick={submit}
            >
              确认创建
            </Button>
          </div>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredSymbol={{ position: 'end' }}
        initialValues={{ enabled: true, perms: [] }}
      >
        <FormItem
          field="name"
          label="角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        >
          <Input placeholder="输入名称" allowClear />
        </FormItem>
        <FormItem field="desc" label="角色描述">
          <Input placeholder="输入描述" allowClear />
        </FormItem>
        <FormItem
          field="perms"
          label="权限配置"
          triggerPropName="value"
          rules={[{ required: true, message: '请配置权限' }]}
        >
          <PermissionConfig />
        </FormItem>
      </Form>
    </Modal>
  );
}
