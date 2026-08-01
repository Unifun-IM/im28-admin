import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Message, Modal } from '@arco-design/web-react';
import { postV1AdminSystemUsersResetPassword } from '@shared/api/admin/systemUsers';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import useLocale from '@shared/lib/useLocale';
import './reset-password-modal.less';

const FormItem = Form.Item;

export type ResetPasswordTarget = {
  id: number;
  username: string;
};

export type ResetPasswordModalProps = {
  visible: boolean;
  target: ResetPasswordTarget | null;
  onCancel: () => void;
  onSuccess?: () => void;
};

/** 重置密码 — AdminAPI.ResetSysUserPasswordRequest */
export default function ResetPasswordModal({
  visible,
  target,
  onCancel,
  onSuccess
}: ResetPasswordModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<AdminAPI.ResetSysUserPasswordRequest>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible || !target) return;
    form.resetFields();
    form.setFieldsValue({ id: target.id, password: '' });
  }, [visible, form, target]);

  const submit = async () => {
    try {
      const values = await form.validate();
      setSubmitting(true);
      await postV1AdminSystemUsersResetPassword(values);
      Message.success(common['common.success']);
      onSuccess?.();
      onCancel();
    } catch {
      // validate / request
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      unmountOnExit
      style={{ width: 480 }}
      title={
        <div className="flex items-center gap-2">
          <img alt="" src={iconWarning} className="size-5" />
          <span>{t['resetPassword.title']}</span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>{common['common.cancel']}</Button>
          <Button
            type="primary"
            status="danger"
            loading={submitting}
            onClick={submit}
          >
            {common['common.confirm']}
          </Button>
        </div>
      }
    >
      <p className="m-0 mb-3 text-[14px]">
        {t['resetPassword.target']
          .replace('{username}', target?.username || '')
          .replace('{id}', String(target?.id ?? ''))}
      </p>
      <Form form={form} layout="vertical">
        <FormItem field="id" hidden>
          <Input />
        </FormItem>
        <FormItem
          field="password"
          label={common['common.password']}
          rules={[{ required: true }]}
        >
          <Input.Password placeholder={t['resetPassword.placeholder.password']} />
        </FormItem>
      </Form>
    </Modal>
  );
}
