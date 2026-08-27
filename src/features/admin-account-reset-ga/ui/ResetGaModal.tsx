import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Result } from '@arco-design/web-react';
import { IconCheckCircleFill } from '@arco-design/web-react/icon';
import cs from 'classnames';
import { postV1AdminSystemUsersResetTwoFactor } from '@shared/api/admin/systemUsers';
import iconWarning from '@assets/icon/icon-exclamation-circle-fill.svg';
import { GaVerifyModal } from '@features/ga-verify';
import useLocale from '@shared/lib/useLocale';
import '@shared/ui/biz-form-modal.less';
import './reset-ga-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

export type ResetGaTarget = {
  id: number;
  username: string;
  display_name?: string;
};

export type ResetGaModalProps = {
  visible: boolean;
  target: ResetGaTarget | null;
  onCancel: () => void;
  onSuccess?: () => void;
};

type Step = 'confirm' | 'ga' | 'success';

/**
 * 重置谷歌 — Figma 921:44697 / 921:44417 / 921:44748
 * AdminAPI.ResetSysUserTwoFactorRequest
 */
export default function ResetGaModal({
  visible,
  target,
  onCancel,
  onSuccess
}: ResetGaModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<{ remark?: string }>();
  const [step, setStep] = useState<Step>('confirm');
  const [submitting, setSubmitting] = useState(false);
  const [remark, setRemark] = useState<string | undefined>();
  const [gaErrorTick, setGaErrorTick] = useState(0);

  useEffect(() => {
    if (!visible || !target) return;
    setStep('confirm');
    setRemark(undefined);
    setGaErrorTick(0);
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
      const body: AdminAPI.ResetSysUserTwoFactorRequest = {
        id: target.id,
        two_factor_code: code,
        remark
      };
      await postV1AdminSystemUsersResetTwoFactor(body);
      setStep('success');
      onSuccess?.();
    } catch {
      setGaErrorTick((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible && step === 'confirm'}
        onCancel={onCancel}
        unmountOnExit
        closable={false}
        maskClosable={false}
        className="use-biz-form-modal use-reset-ga-modal"
        wrapClassName="use-reset-ga-modal-wrap"
        style={{ width: 480 }}
        title={
          <div className="flex items-center gap-2">
            <img alt="" src={iconWarning} className="size-5" />
            <span>{t['resetGa.title']}</span>
          </div>
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button type="outline" className="!min-w-[80px]" onClick={onCancel}>
              {common['common.cancel']}
            </Button>
            <Button
              type="primary"
              status="danger"
              className="!min-w-[80px]"
              onClick={goGa}
            >
              {t['resetGa.action.confirm']}
            </Button>
          </div>
        }
      >
        <p className="m-0 text-[14px] leading-[21px] text-arco-text-1">
          {t['resetGa.target'].replace('{name}', displayLabel)}
        </p>
        <ul className="m-0 mt-3 list-disc pl-[21px] text-[14px] leading-[21px] text-arco-text-1">
          <li>{t['resetGa.bullet.1']}</li>
          <li>{t['resetGa.bullet.2']}</li>
          <li>{t['resetGa.bullet.3']}</li>
        </ul>
        <Form form={form} layout="vertical" className="mt-3">
          <FormItem field="remark" label={t['accounts.field.remark']}>
            <TextArea
              placeholder={t['resetGa.placeholder.remark']}
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
        className={cs('use-biz-form-modal', 'use-reset-ga-modal', 'is-success')}
        wrapClassName="use-reset-ga-modal-wrap"
        style={{ width: 780 }}
      >
        <div className="use-reset-ga-success px-20 py-6">
          <Result
            status="success"
            icon={
              <IconCheckCircleFill className="text-[48px] text-[rgb(var(--success-6))]" />
            }
            title={t['resetGa.success.title']}
            subTitle={t['resetGa.success.subTitle']}
          />
          <div className="mt-4 flex justify-center">
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
