import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Result,
  VerificationCode
} from '@arco-design/web-react';
import { IconCheckCircleFill, IconCopy } from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import cs from 'classnames';
import { resetAccountPassword } from '@shared/api/biz';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

export type ResetPasswordTarget = {
  id: string;
  account: string;
  /** 展示名，如「张三」；无则只显示账号 */
  name?: string;
};

export type ResetPasswordModalProps = {
  visible: boolean;
  target: ResetPasswordTarget | null;
  onCancel: () => void;
  onSuccess?: () => void;
};

type Step = 'confirm' | 'ga' | 'success';

/**
 * 重置密码 — Figma 921:44486
 * GA 验证 — Figma 921:44417
 * 成功 — Figma 921:44606
 */
export default function ResetPasswordModal({
  visible,
  target,
  onCancel,
  onSuccess
}: ResetPasswordModalProps) {
  const [form] = Form.useForm();
  const [step, setStep] = useState<Step>('confirm');
  const [gaCode, setGaCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    account: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    if (!visible) return;
    setStep('confirm');
    setGaCode('');
    setResult(null);
    form.resetFields();
  }, [visible, form, target?.id]);

  const displayName = target
    ? target.name
      ? `${target.name}（${target.account}）`
      : target.account
    : '';

  const copyText = (text: string, tip = '已复制') => {
    copy(text);
    Message.success(tip);
  };

  const goGa = () => {
    setStep('ga');
  };

  const submitReset = async () => {
    if (!target || gaCode.length < 6) return;
    setSubmitting(true);
    try {
      const remark = String(form.getFieldValue('remark') || '');
      const res = (await resetAccountPassword({
        id: target.id,
        account: target.account,
        remark,
        gaCode
      })) as { account?: string; password?: string };
      setResult({
        account: String(res.account || target.account),
        password: String(res.password || '')
      });
      setStep('success');
      onSuccess?.();
    } catch {
      Message.error('重置失败，请检查验证码后重试');
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
          onClick={goGa}
        >
          重置密码
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
      className={cs('use-reset-password-modal', {
        'is-ga': step === 'ga',
        'is-success': step === 'success'
      })}
      wrapClassName="use-reset-password-modal-wrap"
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
            <span>重置密码？</span>
          </div>
        ) : null
      }
    >
      {step === 'confirm' ? (
        <Form form={form} layout="vertical">
          <p className="m-0 mb-3 text-[14px] leading-[21px] text-arco-text-1">
            确定要重置「{displayName}」的登录密码吗？
          </p>
          <ul className="m-0 mb-3 list-disc pl-[21px] text-[14px] leading-[21px] text-arco-text-1">
            <li>当前密码将立即失效</li>
            <li>该账号将退出所有已登录设备</li>
            <li>下次登录时必须修改密码</li>
          </ul>
          <FormItem field="remark" label="备注">
            <TextArea placeholder="添加备注" autoSize={{ minRows: 2, maxRows: 4 }} />
          </FormItem>
        </Form>
      ) : null}

      {step === 'ga' ? (
        <>
          <div className="box-border px-0 pb-3 pt-0">
            <div className="text-[20px] font-medium leading-7 text-arco-text-1">
              GA验证码
            </div>
            <div className="text-[12px] leading-5 text-arco-text-3">
              请输入由您的身份验证器应用生成的6位验证码
            </div>
          </div>
          <div className="box-border py-3">
            <VerificationCode
              className="use-login-otp"
              length={6}
              value={gaCode}
              onChange={setGaCode}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <Button className="!min-w-[80px]" onClick={onCancel}>
              取消
            </Button>
            <Button
              type="primary"
              className="!min-w-[80px]"
              loading={submitting}
              disabled={gaCode.length < 6}
              onClick={submitReset}
            >
              确定
            </Button>
          </div>
        </>
      ) : null}

      {step === 'success' ? (
        <div className="px-10 py-6">
          <Result
            status="success"
            icon={
              <IconCheckCircleFill className="text-[48px] text-[rgb(var(--success-6))]" />
            }
            title="密码重置成功"
            subTitle={
              <div className="text-center">
                <p className="m-0">
                  临时密码仅展示一次，关闭后将无法再次查看。请通过安全方式发送给用户。
                </p>
                <p className="m-0">用户下次登录时必须修改密码。</p>
              </div>
            }
          />
          <div className="mx-auto mt-4 w-full max-w-[520px] rounded-lg border border-solid border-[rgba(0,0,0,0.08)] bg-[var(--color-bg-2,#fff)] p-3">
            <div className="flex items-center gap-6">
              <span className="w-[120px] shrink-0 text-[12px] leading-[18px] text-arco-text-1">
                登录账号
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                <span className="truncate text-[12px] leading-[18px] text-arco-text-1">
                  {result?.account}
                </span>
                <button
                  type="button"
                  aria-label="复制账号"
                  className="inline-flex size-[14px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
                  onClick={() =>
                    result?.account && copyText(result.account, '账号已复制')
                  }
                >
                  <IconCopy className="text-[14px]" />
                </button>
              </div>
            </div>
            <div className="my-3 h-px bg-[rgba(0,0,0,0.08)]" />
            <div className="flex items-center gap-6">
              <span className="w-[120px] shrink-0 text-[12px] leading-[18px] text-arco-text-1">
                临时密码
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                <span className="truncate text-[12px] leading-[18px] text-arco-text-1">
                  {result?.password}
                </span>
                <button
                  type="button"
                  aria-label="复制密码"
                  className="inline-flex size-[14px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
                  onClick={() =>
                    result?.password &&
                    copyText(result.password, '密码已复制')
                  }
                >
                  <IconCopy className="text-[14px]" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              className="!rounded-lg !bg-[var(--color-fill-2,#f2f3f5)] !text-arco-text-2"
              onClick={() => {
                if (!result) return;
                copyText(
                  `登录账号：${result.account}\n临时密码：${result.password}`,
                  '账号和密码已复制'
                );
              }}
            >
              复制账号和密码
            </Button>
            <Button
              type="primary"
              className="!w-[100px] !rounded-lg"
              onClick={onCancel}
            >
              完成
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
