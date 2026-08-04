import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Select
} from '@arco-design/web-react';
import { postV1AdminRiskIpBlacklistBatchRemove } from '@shared/api/admin/adminfengkongguanli';
import iconSuccess from '@shared/assets/icon-check-circle-fill.svg';
import { GaVerifyModal } from '@features/ga-verify';
import useLocale from '@shared/lib/useLocale';
import './ip-blacklist-action-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

export type BatchReleaseIpBlacklistPayload = {
  ips: string[];
  reason: string;
  reason_description?: string;
};

export type BatchReleaseIpBlacklistModalProps = {
  visible: boolean;
  ips: string[];
  onCancel: () => void;
  onSuccess?: () => void;
};

type FormValues = {
  reason: string;
  reason_description?: string;
};

type PendingPayload = {
  ips: string[];
  reason_description?: string;
};

type Step = 'form' | 'ga';

/**
 * 批量解除 IP 黑名单 — Figma 979:42912 → GaVerifyModal
 * API 仅接受 reason_description；表单原因拼入说明
 */
export default function BatchReleaseIpBlacklistModal({
  visible,
  ips,
  onCancel,
  onSuccess
}: BatchReleaseIpBlacklistModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<FormValues>();
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [gaErrorTick, setGaErrorTick] = useState(0);
  const [pending, setPending] = useState<PendingPayload | null>(null);
  const count = ips.length;

  const reasonOptions = useMemo(
    () =>
      (['mistaken', 'appeal', 'riskCleared', 'other'] as const).map((key) => ({
        label: t[`ipBlacklist.releaseReason.${key}`],
        value: t[`ipBlacklist.releaseReason.${key}`]
      })),
    [t]
  );

  useEffect(() => {
    if (!visible) return;
    setStep('form');
    setPending(null);
    setGaErrorTick(0);
    form.resetFields();
  }, [visible, form, ips]);

  const goGa = async () => {
    try {
      const values = await form.validate();
      if (!ips.length) return;
      const reason = String(values.reason || '').trim();
      const extra = String(values.reason_description || '').trim();
      const reason_description = [reason, extra].filter(Boolean).join('；') || undefined;
      setPending({
        ips: ips.slice(0, 100),
        reason_description
      });
      setGaErrorTick(0);
      setStep('ga');
    } catch {
      // validate
    }
  };

  const submitGa = async (code: string) => {
    if (submitting || !pending?.ips.length) return;
    try {
      setSubmitting(true);
      await postV1AdminRiskIpBlacklistBatchRemove({
        ip_addresses: pending.ips,
        reason_description: pending.reason_description,
        two_factor_code: code
      });
      Message.success(t['ipBlacklist.batchRelease.msg.success']);
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
            <img alt="" src={iconSuccess} className="size-5" />
            <span>{t['ipBlacklist.batchRelease.title']}</span>
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
              {t['ipBlacklist.batchRelease.submit']}
            </Button>
          </div>
        }
      >
        <p className="m-0 mb-3 text-[14px] leading-[21px] text-arco-text-1">
          {t['ipBlacklist.batchRelease.tip'].replace('{n}', String(count))}
        </p>
        <Form
          form={form}
          layout="vertical"
          requiredSymbol={{ position: 'end' }}
          className="use-ip-blacklist-action-form"
        >
          <FormItem
            field="reason"
            label={t['ipBlacklist.batchRelease.field.reason']}
            rules={[
              {
                required: true,
                message: t['ipBlacklist.batchRelease.placeholder.reason']
              }
            ]}
          >
            <Select
              allowClear
              placeholder={t['ipBlacklist.batchRelease.placeholder.reason']}
              options={reasonOptions}
            />
          </FormItem>
          <FormItem
            field="reason_description"
            label={t['ipBlacklist.batchRelease.field.reasonDescription']}
          >
            <TextArea
              placeholder={
                t['ipBlacklist.batchRelease.placeholder.reasonDescription']
              }
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
