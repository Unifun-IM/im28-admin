import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Result
} from '@arco-design/web-react';
import { IconCheckCircleFill, IconCopy } from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import cs from 'classnames';
import { postV1AdminSystemUsersResetPassword } from '@shared/api/admin/systemUsers';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import useLocale from '@shared/lib/useLocale';
import './reset-password-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

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

type Step = 'form' | 'success';

/** 重置密码 — AdminAPI.ResetSysUserPasswordRequest / ResetSysUserPasswordEnvelope */
export default function ResetPasswordModal({
  visible,
  target,
  onCancel,
  onSuccess
}: ResetPasswordModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<AdminAPI.ResetSysUserPasswordRequest>();
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    username: string;
    temporary_password: string;
  } | null>(null);

  useEffect(() => {
    if (!visible || !target) return;
    setStep('form');
    setResult(null);
    form.resetFields();
    form.setFieldsValue({ id: target.id });
  }, [visible, form, target]);

  const submit = async () => {
    try {
      const values = await form.validate();
      if (target?.id == null) return;
      setSubmitting(true);
      const body: AdminAPI.ResetSysUserPasswordRequest = {
        id: target.id,
        two_factor_code: values.two_factor_code,
        remark: values.remark?.trim() || undefined
      };
      const res = await postV1AdminSystemUsersResetPassword(body);
      setResult({
        username: res.data?.username || target.username,
        temporary_password: res.data?.temporary_password || ''
      });
      setStep('success');
      onSuccess?.();
    } catch {
      // validate / request
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = (text: string) => {
    copy(text);
    Message.success(common['common.copied']);
  };

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      unmountOnExit
      closable={step === 'form'}
      maskClosable={step === 'form'}
      className={cs('use-reset-password-modal', {
        'is-success': step === 'success'
      })}
      style={{ width: step === 'success' ? 520 : 480 }}
      title={
        step === 'form' ? (
          <div className="flex items-center gap-2">
            <img alt="" src={iconWarning} className="size-5" />
            <span>{t['resetPassword.title']}</span>
          </div>
        ) : undefined
      }
      footer={
        step === 'form' ? (
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
        ) : null
      }
    >
      {step === 'form' ? (
        <>
          <p className="m-0 mb-3 text-[14px] leading-[22px] text-arco-text-2">
            {t['resetPassword.target']
              .replace('{username}', target?.username || '')
              .replace('{id}', String(target?.id ?? ''))}
          </p>
          <p className="m-0 mb-4 text-[12px] leading-[18px] text-arco-text-3">
            {t['resetPassword.hint']}
          </p>
          <Form form={form} layout="vertical">
            <FormItem field="id" hidden>
              <Input />
            </FormItem>
            <FormItem
              field="two_factor_code"
              label={t['accounts.field.twoFactorCode']}
              rules={[
                { required: true, message: t['accounts.msg.twoFactorRequired'] },
                {
                  match: /^\d{6}$/,
                  message: t['accounts.msg.twoFactorFormat']
                }
              ]}
            >
              <Input
                maxLength={6}
                placeholder={t['accounts.placeholder.twoFactorCode']}
                allowClear
              />
            </FormItem>
            <FormItem field="remark" label={t['accounts.field.remark']}>
              <TextArea
                placeholder={t['accounts.placeholder.remark']}
                maxLength={200}
                showWordLimit
              />
            </FormItem>
          </Form>
        </>
      ) : (
        <div className="px-10 py-6">
          <Result
            status="success"
            icon={
              <IconCheckCircleFill className="text-[48px] text-[rgb(var(--success-6))]" />
            }
            title={t['resetPassword.success.title']}
            subTitle={t['resetPassword.success.subTitle']}
          />
          <div className="mx-auto mt-4 w-full max-w-[420px] rounded-lg border border-solid border-[rgba(0,0,0,0.08)] p-3 text-[12px]">
            <div>
              {common['common.username']}：{result?.username}
            </div>
            <div className="mt-2 flex items-center gap-2">
              {t['resetPassword.success.tempPassword']}：
              {result?.temporary_password}
              <button
                type="button"
                className="border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
                onClick={() =>
                  result?.temporary_password &&
                  copyText(result.temporary_password)
                }
              >
                <IconCopy />
              </button>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Button type="primary" onClick={onCancel}>
              {common['common.done']}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
