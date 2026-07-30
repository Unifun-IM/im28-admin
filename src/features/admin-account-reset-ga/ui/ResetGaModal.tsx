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
import { resetAccountGa } from '@shared/api/biz';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

export type ResetGaTarget = {
  id: string;
  account: string;
  name?: string;
};

export type ResetGaModalProps = {
  visible: boolean;
  target: ResetGaTarget | null;
  onCancel: () => void;
  onSuccess?: () => void;
};

type Step = 'confirm' | 'success';

/**
 * 重置谷歌 — Figma 921:44697
 * 重置成功 — Figma 921:44748
 */
export default function ResetGaModal({
  visible,
  target,
  onCancel,
  onSuccess
}: ResetGaModalProps) {
  const [form] = Form.useForm();
  const [step, setStep] = useState<Step>('confirm');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setStep('confirm');
    form.resetFields();
  }, [visible, form, target?.id]);

  const displayName = target
    ? target.name
      ? `${target.name}（${target.account}）`
      : target.account
    : '';

  const submitReset = async () => {
    if (!target) return;
    setSubmitting(true);
    try {
      const remark = String(form.getFieldValue('remark') || '');
      await resetAccountGa({
        id: target.id,
        account: target.account,
        remark
      });
      setStep('success');
      onSuccess?.();
    } catch {
      Message.error('重置失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  const footer =
    step === 'confirm' ? (
      <div className="flex w-full items-center justify-end gap-2">
        <Button className="!min-w-[80px]" onClick={onCancel}>
          取消
        </Button>
        <Button
          status="danger"
          type="primary"
          className="!min-w-[80px]"
          loading={submitting}
          onClick={submitReset}
        >
          重置谷歌
        </Button>
      </div>
    ) : null;

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={footer}
      unmountOnExit
      closable={false}
      maskClosable={step !== 'success'}
      className={cs('use-reset-ga-modal', {
        'is-success': step === 'success'
      })}
      wrapClassName="use-reset-ga-modal-wrap"
      style={{ width: step === 'success' ? 780 : 480 }}
      title={
        step === 'confirm' ? (
          <div className="flex items-center gap-2">
            <span className="relative inline-block size-5 shrink-0 overflow-hidden">
              <img
                alt=""
                src={iconWarning}
                className="absolute inset-0 block size-full max-w-none"
              />
            </span>
            <span>重置谷歌？</span>
          </div>
        ) : null
      }
    >
      {step === 'confirm' ? (
        <Form form={form} layout="vertical">
          <p className="m-0 mb-3 text-[14px] leading-[21px] text-arco-text-1">
            确定要重置「{displayName}」的谷歌验证码吗？
          </p>
          <ul className="m-0 mb-3 list-disc pl-[21px] text-[14px] leading-[21px] text-arco-text-1">
            <li>当前绑定的 Google 验证码将立即失效</li>
            <li>该账号将退出所有已登录设备</li>
            <li>下次登录时必须重新绑定 Google 谷歌验证码</li>
          </ul>
          <FormItem field="remark" label="备注">
            <TextArea
              placeholder="添加备注"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
          </FormItem>
        </Form>
      ) : (
        <div className="px-10 py-6">
          <Result
            status="success"
            icon={
              <IconCheckCircleFill className="text-[48px] text-[rgb(var(--success-6))]" />
            }
            title="Google 验证码已重置"
            subTitle="该账号下次登录时必须重新绑定 Google 验证码后，才能进入后台。"
          />
          <div className="mt-4 flex items-center justify-center">
            <Button
              type="primary"
              className="!w-[100px] !rounded-lg"
              onClick={onCancel}
            >
              完成
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
