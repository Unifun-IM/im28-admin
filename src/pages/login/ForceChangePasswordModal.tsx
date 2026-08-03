import React, { useEffect } from 'react';
import { Button, Form, Input, Modal } from '@arco-design/web-react';
import useLocale from '@shared/lib/useLocale';

export type ForceChangePasswordForm = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type ForceChangePasswordModalProps = {
  visible: boolean;
  loading?: boolean;
  /** 当前登录账号，用于「不能包含登录账号」校验 */
  username?: string;
  initialToken?: string;
  onExit: () => void;
  onSubmit: (values: AdminAPI.ChangeSysUserPasswordRequest) => void;
};

/** 连续字符：同字符重复 3、或递增/递减 3 */
function hasConsecutiveChars(value: string): boolean {
  for (let i = 0; i < value.length - 2; i += 1) {
    const a = value.charCodeAt(i);
    const b = value.charCodeAt(i + 1);
    const c = value.charCodeAt(i + 2);
    if (a === b && b === c) return true;
    if (b === a + 1 && c === b + 1) return true;
    if (b === a - 1 && c === b - 1) return true;
  }
  return false;
}

/**
 * 设置新密码 — Figma 922:44914
 * 不可关闭跳过；「取消」= 退出登录（放弃首次流程）
 */
export default function ForceChangePasswordModal({
  visible,
  loading,
  username = '',
  initialToken = '',
  onExit,
  onSubmit
}: ForceChangePasswordModalProps) {
  const t = useLocale();
  const [form] = Form.useForm<ForceChangePasswordForm>();

  useEffect(() => {
    if (!visible) return;
    form.setFieldsValue({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validate();
      onSubmit({
        pre_auth_token: initialToken,
        current_password: values.current_password,
        new_password: values.new_password
      });
    } catch {
      // validate
    }
  };

  return (
    <Modal
      className="use-login-force-modal use-login-force-pwd-modal"
      wrapClassName="use-login-ga-modal-wrap"
      visible={visible}
      title={null}
      footer={null}
      closable={false}
      maskClosable={false}
      escToExit={false}
      unmountOnExit
      style={{ width: 780 }}
    >
      <div className="box-border flex h-[48px] items-center border-0 border-b border-solid border-[var(--color-border-2)] px-[24px]">
        <span className="text-[16px] font-medium leading-6 text-[var(--color-text-1,#1d2129)]">
          {t['login.forcePwd.title']}
        </span>
      </div>

      <div className="box-border flex max-h-[680px] flex-col gap-[24px] overflow-auto px-[24px] pb-[60px] pt-[12px]">
        <p className="m-0 text-[14px] leading-[21px] text-black">
          {t['login.forcePwd.desc']}
        </p>

        <Form
          form={form}
          layout="vertical"
          requiredSymbol={{ position: 'end' }}
          className="use-login-force-pwd-form"
        >
          <Form.Item
            field="current_password"
            label={t['login.forcePwd.current']}
            rules={[
              { required: true, message: t['login.msg.pwdCurrentEmpty'] }
            ]}
          >
            <Input.Password
              placeholder={t['login.msg.pwdCurrentEmpty']}
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item
            field="new_password"
            label={t['login.forcePwd.new']}
            rules={[
              { required: true, message: t['login.msg.pwdNewEmpty'] },
              {
                validator: (value, callback) => {
                  const current = form.getFieldValue('current_password') || '';
                  if (!value) {
                    callback();
                    return;
                  }
                  if (/\s/.test(value)) {
                    callback(t['login.msg.pwdHasSpace']);
                    return;
                  }
                  if (value.length < 8 || value.length > 20) {
                    callback(t['login.msg.pwdLength']);
                    return;
                  }
                  if (
                    !/[A-Z]/.test(value) ||
                    !/[a-z]/.test(value) ||
                    !/\d/.test(value) ||
                    !/[^A-Za-z0-9]/.test(value)
                  ) {
                    callback(t['login.msg.pwdComplexity']);
                    return;
                  }
                  if (value === current) {
                    callback(t['login.msg.pwdSameAsInitial']);
                    return;
                  }
                  if (
                    username &&
                    value.toLowerCase().includes(String(username).toLowerCase())
                  ) {
                    callback(t['login.msg.pwdNoAccount']);
                    return;
                  }
                  if (hasConsecutiveChars(value)) {
                    callback(t['login.msg.pwdConsecutive']);
                    return;
                  }
                  callback();
                }
              }
            ]}
          >
            <Input.Password
              placeholder={t['login.msg.pwdNewEmpty']}
              autoComplete="new-password"
            />
          </Form.Item>
          <Form.Item
            field="confirm_password"
            label={t['login.forcePwd.confirm']}
            rules={[
              { required: true, message: t['login.msg.pwdConfirmEmpty'] },
              {
                validator: (value, callback) => {
                  if (value && value !== form.getFieldValue('new_password')) {
                    callback(t['login.msg.pwdMismatch']);
                    return;
                  }
                  callback();
                }
              }
            ]}
          >
            <Input.Password
              placeholder={t['login.msg.pwdConfirmEmpty']}
              autoComplete="new-password"
            />
          </Form.Item>
        </Form>

        <div className="text-[14px] leading-[21px] text-black">
          <p className="m-0">{t['login.forcePwd.rulesTitle']}</p>
          <ul className="m-0 list-disc pl-[21px]">
            <li>{t['login.forcePwd.rule.len']}</li>
            <li>{t['login.forcePwd.rule.charset']}</li>
            <li>{t['login.forcePwd.rule.notDefault']}</li>
            <li>{t['login.forcePwd.rule.noAccount']}</li>
          </ul>
        </div>
      </div>

      <div className="box-border flex h-[48px] items-center justify-end gap-[8px] border-0 border-t border-solid border-[var(--color-border-1,#f2f3f5)] px-[24px]">
        <Button className="min-w-[80px]" disabled={loading} onClick={onExit}>
          {t['navbar.logout']}
        </Button>
        <Button
          type="primary"
          className="min-w-[80px]"
          loading={loading}
          onClick={handleOk}
        >
          {t['login.forcePwd.submit']}
        </Button>
      </div>
    </Modal>
  );
}
