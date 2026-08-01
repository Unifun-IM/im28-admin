import React, { useEffect } from 'react';
import { Button, Form, Input, Modal } from '@arco-design/web-react';

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
      <div className="box-border flex h-[48px] items-center border-0 border-b border-solid border-[rgba(0,0,0,0.08)] px-[24px]">
        <span className="text-[16px] font-medium leading-6 text-[var(--color-text-1,#1d2129)]">
          设置新密码
        </span>
      </div>

      <div className="box-border flex max-h-[680px] flex-col gap-[24px] overflow-auto px-[24px] pb-[60px] pt-[12px]">
        <p className="m-0 text-[14px] leading-[21px] text-black">
          你正在使用默认密码登录。请设置一个仅你本人知晓的新密码。
        </p>

        <Form
          form={form}
          layout="vertical"
          requiredSymbol={{ position: 'end' }}
          className="use-login-force-pwd-form"
        >
          <Form.Item
            field="current_password"
            label="默认密码"
            rules={[{ required: true, message: '请输入默认密码' }]}
          >
            <Input.Password placeholder="请输入默认密码" autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            field="new_password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              {
                validator: (value, callback) => {
                  const current = form.getFieldValue('current_password') || '';
                  if (!value) {
                    callback();
                    return;
                  }
                  if (/\s/.test(value)) {
                    callback('密码不能包含空格');
                    return;
                  }
                  if (value.length < 8 || value.length > 20) {
                    callback('密码长度需为8-20位');
                    return;
                  }
                  if (
                    !/[A-Z]/.test(value) ||
                    !/[a-z]/.test(value) ||
                    !/\d/.test(value) ||
                    !/[^A-Za-z0-9]/.test(value)
                  ) {
                    callback('密码需包含数字、字母及特殊字符');
                    return;
                  }
                  if (value === current) {
                    callback('新密码不能与初始密码相同');
                    return;
                  }
                  if (
                    username &&
                    value.toLowerCase().includes(String(username).toLowerCase())
                  ) {
                    callback('密码不能包含登录账号');
                    return;
                  }
                  if (hasConsecutiveChars(value)) {
                    callback('密码不能包含连续字符');
                    return;
                  }
                  callback();
                }
              }
            ]}
          >
            <Input.Password placeholder="请输入新密码" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            field="confirm_password"
            label="确认新密码"
            rules={[
              { required: true, message: '请再次输入密码' },
              {
                validator: (value, callback) => {
                  if (value && value !== form.getFieldValue('new_password')) {
                    callback('两次输入密码不一致');
                    return;
                  }
                  callback();
                }
              }
            ]}
          >
            <Input.Password placeholder="请再次输入密码" autoComplete="new-password" />
          </Form.Item>
        </Form>

        <div className="text-[14px] leading-[21px] text-black">
          <p className="m-0">密码须满足：</p>
          <ul className="m-0 list-disc pl-[21px]">
            <li>8–20 个字符</li>
            <li>包含大写字母、小写字母、数字和特殊字符</li>
            <li>不能与默认密码相同</li>
            <li>不能包含登录账号或连续字符</li>
          </ul>
        </div>
      </div>

      <div className="box-border flex h-[48px] items-center justify-end gap-[8px] border-0 border-t border-solid border-[var(--color-border-1,#f2f3f5)] px-[24px]">
        <Button className="min-w-[80px]" disabled={loading} onClick={onExit}>
          退出登录
        </Button>
        <Button
          type="primary"
          className="min-w-[80px]"
          loading={loading}
          onClick={handleOk}
        >
          确认修改
        </Button>
      </div>
    </Modal>
  );
}
