import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Result
} from '@arco-design/web-react';
import { IconCheckCircleFill } from '@arco-design/web-react/icon';
import cs from 'classnames';
import { postV1AdminSystemUsersResetTwoFactor } from '@shared/api/admin/systemUsers';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import useLocale from '@shared/lib/useLocale';
import './reset-ga-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

export type ResetGaTarget = {
  id: number;
  username: string;
};

export type ResetGaModalProps = {
  visible: boolean;
  target: ResetGaTarget | null;
  onCancel: () => void;
  onSuccess?: () => void;
};

type Step = 'form' | 'success';

/** 重置 GA — AdminAPI.ResetSysUserTwoFactorRequest */
export default function ResetGaModal({
  visible,
  target,
  onCancel,
  onSuccess
}: ResetGaModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<AdminAPI.ResetSysUserTwoFactorRequest>();
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible || !target) return;
    setStep('form');
    form.resetFields();
    form.setFieldsValue({ id: target.id });
  }, [visible, form, target]);

  const submit = async () => {
    try {
      const values = await form.validate();
      if (target?.id == null) return;
      setSubmitting(true);
      const body: AdminAPI.ResetSysUserTwoFactorRequest = {
        id: target.id,
        two_factor_code: values.two_factor_code,
        remark: values.remark?.trim() || undefined
      };
      await postV1AdminSystemUsersResetTwoFactor(body);
      Message.success(common['common.success']);
      setStep('success');
      onSuccess?.();
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
      closable={step === 'form'}
      maskClosable={step === 'form'}
      className={cs('use-reset-ga-modal', { 'is-success': step === 'success' })}
      style={{ width: step === 'success' ? 480 : 480 }}
      title={
        step === 'form' ? (
          <div className="flex items-center gap-2">
            <img alt="" src={iconWarning} className="size-5" />
            <span>{t['resetGa.title']}</span>
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
            {t['resetGa.target']
              .replace('{username}', target?.username || '')
              .replace('{id}', String(target?.id ?? ''))}
          </p>
          <p className="m-0 mb-4 text-[12px] leading-[18px] text-arco-text-3">
            {t['resetGa.hint']}
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
            title={t['resetGa.success.title']}
            subTitle={t['resetGa.success.subTitle']}
          />
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
