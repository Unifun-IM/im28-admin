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
import iconWarning from '@assets/icon/icon-exclamation-circle-fill.svg';
import { GaVerifyModal } from '@features/ga-verify';
import useLocale from '@shared/lib/useLocale';
import '@shared/ui/biz-form-modal.less';
import './reset-password-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

export type ResetPasswordTarget = {
  id: number;
  username: string;
  display_name?: string;
};

export type ResetPasswordModalProps = {
  visible: boolean;
  target: ResetPasswordTarget | null;
  onCancel: () => void;
  onSuccess?: () => void;
};

type Step = 'confirm' | 'ga' | 'success';

/**
 * 重置密码 — Figma 921:44486 / 921:44417 / 921:44606
 * AdminAPI.ResetSysUserPasswordRequest / ResetSysUserPasswordEnvelope
 */
export default function ResetPasswordModal({
  visible,
  target,
  onCancel,
  onSuccess
}: ResetPasswordModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<{ remark?: string }>();
  const [step, setStep] = useState<Step>('confirm');
  const [submitting, setSubmitting] = useState(false);
  const [remark, setRemark] = useState<string | undefined>();
  const [gaErrorTick, setGaErrorTick] = useState(0);
  const [result, setResult] = useState<{
    username: string;
    temporary_password: string;
  } | null>(null);

  useEffect(() => {
    if (!visible || !target) return;
    setStep('confirm');
    setRemark(undefined);
    setGaErrorTick(0);
    setResult(null);
    form.resetFields();
  }, [visible, form, target]);

  const displayLabel = (() => {
    const name = (target?.display_name || '').trim();
    const username = target?.username || '';
    if (name && username) return `${name}（${username}）`;
    return name || username || '--';
  })();

  const goGa = async () => {
    try {
      const values = await form.validate();
      setRemark(values.remark?.trim() || undefined);
      setGaErrorTick(0);
      setStep('ga');
    } catch {
      // validate
    }
  };

  const submitGa = async (code: string) => {
    if (submitting || target?.id == null) return;
    try {
      setSubmitting(true);
      const body: AdminAPI.ResetSysUserPasswordRequest = {
        id: target.id,
        two_factor_code: code,
        remark
      };
      const res = await postV1AdminSystemUsersResetPassword(body);
      setResult({
        username: res.data?.username || target.username,
        temporary_password: res.data?.temporary_password || ''
      });
      setStep('success');
      onSuccess?.();
    } catch {
      setGaErrorTick((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = (text: string) => {
    copy(text);
    Message.success(common['common.copied']);
  };

  const copyAccountAndPassword = () => {
    if (!result) return;
    copyText(
      `${t['resetPassword.success.username']}：${result.username}\n${t['resetPassword.success.tempPassword']}：${result.temporary_password}`
    );
  };

  return (
    <>
      <Modal
        visible={visible && step === 'confirm'}
        onCancel={onCancel}
        unmountOnExit
        closable={false}
        maskClosable={false}
        className="use-biz-form-modal use-reset-password-modal"
        wrapClassName="use-reset-password-modal-wrap"
        style={{ width: 480 }}
        title={
          <div className="flex items-center gap-2">
            <img alt="" src={iconWarning} className="size-5" />
            <span>{t['resetPassword.title']}</span>
          </div>
        }
        footer={
          <div className="flex w-full flex-wrap justify-end gap-2">
            <Button type="outline" className="!min-w-[80px]" onClick={onCancel}>
              {common['common.cancel']}
            </Button>
            <Button
              type="primary"
              status="danger"
              className="!min-w-[80px]"
              onClick={goGa}
            >
              {t['resetPassword.action.confirm']}
            </Button>
          </div>
        }
      >
        <p className="m-0 text-sm text-arco-text-1">
          {t['resetPassword.target'].replace('{name}', displayLabel)}
        </p>
        <ul className="m-0 mt-3 list-disc pl-[21px] text-sm text-arco-text-1">
          <li>{t['resetPassword.bullet.1']}</li>
          <li>{t['resetPassword.bullet.2']}</li>
          <li>{t['resetPassword.bullet.3']}</li>
        </ul>
        <Form form={form} layout="vertical" className="mt-3">
          <FormItem field="remark" label={t['accounts.field.remark']}>
            <TextArea
              placeholder={t['resetPassword.placeholder.remark']}
              autoSize={{ minRows: 2, maxRows: 4 }}
              maxLength={200}
            />
          </FormItem>
        </Form>
      </Modal>

      <GaVerifyModal
        visible={visible && step === 'ga'}
        loading={submitting}
        errorTick={gaErrorTick}
        onCancel={onCancel}
        onOk={submitGa}
      />

      <Modal
        visible={visible && step === 'success'}
        onCancel={onCancel}
        unmountOnExit
        closable={false}
        maskClosable={false}
        footer={null}
        className={cs(
          'use-biz-form-modal',
          'use-reset-password-modal',
          'is-success'
        )}
        wrapClassName="use-reset-password-modal-wrap"
        style={{ width: 780 }}
      >
        <div className="use-reset-password-success px-20 py-6">
          <Result
            status="success"
            icon={
              <IconCheckCircleFill className="text-[48px] text-[rgb(var(--success-6))]" />
            }
            title={t['resetPassword.success.title']}
            subTitle={
              <span className="inline-block whitespace-pre-line text-center">
                {t['resetPassword.success.subTitle']}
              </span>
            }
          />
          <div className="use-reset-password-credential mx-auto mt-4 w-full max-w-[520px] rounded-lg border border-solid border-[var(--color-border-2)] p-3 text-caption-compact text-arco-text-1">
            <div className="flex items-center gap-6">
              <span className="w-[120px] shrink-0">
                {t['resetPassword.success.username']}
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                <span className="truncate">{result?.username}</span>
                <button
                  type="button"
                  className="inline-flex size-[14px] shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
                  onClick={() => result?.username && copyText(result.username)}
                >
                  <IconCopy />
                </button>
              </div>
            </div>
            <div className="my-3 h-px w-full bg-[var(--color-border-2)]" />
            <div className="flex items-center gap-6">
              <span className="w-[120px] shrink-0">
                {t['resetPassword.success.tempPassword']}
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                <span className="truncate">{result?.temporary_password}</span>
                <button
                  type="button"
                  className="inline-flex size-[14px] shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
                  onClick={() =>
                    result?.temporary_password &&
                    copyText(result.temporary_password)
                  }
                >
                  <IconCopy />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button type="secondary" onClick={copyAccountAndPassword}>
              {t['resetPassword.success.copyBoth']}
            </Button>
            <Button
              type="primary"
              className="!min-w-[100px]"
              onClick={onCancel}
            >
              {common['common.done']}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
