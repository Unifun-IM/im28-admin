import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Select
} from '@arco-design/web-react';
import iconSuccess from '@shared/assets/icon-check-circle-fill.svg';
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
  onSuccess?: (payload: BatchReleaseIpBlacklistPayload) => void;
};

/**
 * 批量解除 IP 黑名单 — Figma 979:42912
 */
export default function BatchReleaseIpBlacklistModal({
  visible,
  ips,
  onCancel,
  onSuccess
}: BatchReleaseIpBlacklistModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<{
    reason: string;
    reason_description?: string;
  }>();
  const [submitting, setSubmitting] = useState(false);
  const count = ips.length;

  const reasonOptions = useMemo(
    () =>
      (
        ['mistaken', 'appeal', 'riskCleared', 'other'] as const
      ).map((key) => ({
        label: t[`ipBlacklist.releaseReason.${key}`],
        value: t[`ipBlacklist.releaseReason.${key}`]
      })),
    [t]
  );

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
  }, [visible, form, ips]);

  const submit = async () => {
    try {
      const values = await form.validate();
      if (!ips.length) return;
      setSubmitting(true);
      Message.warning(common['common.apiNotReady']);
      onSuccess?.({
        ips,
        reason: values.reason,
        reason_description: values.reason_description
      });
      onCancel();
    } catch {
      // validate
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      className="use-ip-blacklist-action-modal"
      wrapClassName="use-ip-blacklist-action-modal-wrap"
      visible={visible}
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
            loading={submitting}
            onClick={submit}
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
  );
}
