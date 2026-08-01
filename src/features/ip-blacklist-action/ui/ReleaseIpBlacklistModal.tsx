import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Message, Modal } from '@arco-design/web-react';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
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
  onSuccess?: (payload: ReleaseIpBlacklistPayload) => void;
};

/**
 * 解除 IP 黑名单 — Figma 979:41995
 * 接口未就绪：校验通过后交给页面做本地 mock
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
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
  }, [visible, form, ip]);

  const submit = async () => {
    try {
      const values = await form.validate();
      if (!ip) return;
      setSubmitting(true);
      Message.warning(common['common.apiNotReady']);
      onSuccess?.({
        ip,
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
            loading={submitting}
            onClick={submit}
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
  );
}
