import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Message, Modal } from '@arco-design/web-react';
import { postV1AdminRiskIpBlacklistRemove } from '@shared/api/admin/adminfengkongguanli';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import { GaVerifyModal } from '@features/ga-verify';
import useLocale from '@shared/lib/useLocale';
import './ip-blacklist-action-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

export type ReleaseIpBlacklistPayload = {
  ip: string;
  reason_description?: string;
};

export type ReleaseIpBlacklistModalProps = {
  visible: boolean;
  ip?: string | null;
  onCancel: () => void;
  onSuccess?: () => void;
};

type Step = 'form' | 'ga';

/**
 * 解除 IP 黑名单 — Figma 979:41995 → GaVerifyModal
 */
export default function ReleaseIpBlacklistModal({
  visible,
  ip,
  onCancel,
  onSuccess
}: ReleaseIpBlacklistModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<{ reason_description?: string }>();
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [gaErrorTick, setGaErrorTick] = useState(0);
  const [pendingDesc, setPendingDesc] = useState<string | undefined>();

  useEffect(() => {
    if (!visible) return;
    setStep('form');
    setPendingDesc(undefined);
    setGaErrorTick(0);
    form.resetFields();
  }, [visible, form, ip]);

  const goGa = async () => {
    try {
      const values = await form.validate();
      if (!ip) return;
      setPendingDesc(values.reason_description?.trim() || undefined);
      setGaErrorTick(0);
      setStep('ga');
    } catch {
      // validate
    }
  };

  const submitGa = async (code: string) => {
    if (submitting || !ip) return;
    try {
      setSubmitting(true);
      await postV1AdminRiskIpBlacklistRemove({
        ip_address: ip,
        reason_description: pendingDesc,
        two_factor_code: code
      });
      Message.success(t['ipBlacklist.release.msg.success']);
      onSuccess?.();
      onCancel();
    } catch {
      setGaErrorTick((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        className="use-ip-blacklist-action-modal"
        wrapClassName="use-ip-blacklist-action-modal-wrap"
        visible={visible && step === 'form'}
        onCancel={onCancel}
        unmountOnExit
        maskClosable={false}
        style={{ width: 780 }}
        title={
          <span className="inline-flex items-center gap-2">
            <img alt="" src={iconWarning} className="size-5" />
            <span>{t['ipBlacklist.release.title']}</span>
          </span>
        }
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button type="outline" className="min-w-[80px]" onClick={onCancel}>
              {common['common.cancel']}
            </Button>
            <Button
              type="primary"
              className="min-w-[80px]"
              onClick={goGa}
            >
              {t['ipBlacklist.release.submit']}
            </Button>
          </div>
        }
      >
        <p className="m-0 mb-3 text-[14px] leading-[21px] text-arco-text-1">
          {t['ipBlacklist.release.tip'].replace('{ip}', ip || '--')}
        </p>
        <Form
          form={form}
          layout="vertical"
          className="use-ip-blacklist-action-form"
        >
          <FormItem
            field="reason_description"
            label={t['ipBlacklist.release.field.reasonDescription']}
          >
            <TextArea
              placeholder={t['ipBlacklist.release.placeholder.reasonDescription']}
              autoSize={{ minRows: 2, maxRows: 4 }}
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
    </>
  );
}
