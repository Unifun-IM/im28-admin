import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Select
} from '@arco-design/web-react';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import useLocale from '@shared/lib/useLocale';
import './ip-blacklist-action-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

export type AddIpBlacklistPayload = {
  ips: string[];
  reason: string;
  reason_description?: string;
};

export type AddIpBlacklistModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: (payload: AddIpBlacklistPayload) => void;
};

/** 逗号 / 空格 / 换行 / 分号分隔 */
export function parseIpList(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[\s,;，；]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

/**
 * 添加 IP 黑名单 — Figma 979:44120
 * 接口未就绪：校验通过后交给页面做本地 mock
 */
export default function AddIpBlacklistModal({
  visible,
  onCancel,
  onSuccess
}: AddIpBlacklistModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<{
    ips: string;
    reason: string;
    reason_description?: string;
  }>();
  const [submitting, setSubmitting] = useState(false);

  const reasonOptions = useMemo(
    () =>
      (
        [
          'highFreq',
          'loginFail',
          'crawler',
          'fraud'
        ] as const
      ).map((key) => ({
        label: t[`ipBlacklist.reason.${key}`],
        value: t[`ipBlacklist.reason.${key}`]
      })),
    [t]
  );

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
  }, [visible, form]);

  const submit = async () => {
    try {
      const values = await form.validate();
      const ips = parseIpList(values.ips || '');
      if (!ips.length) {
        Message.warning(t['ipBlacklist.add.msg.ipRequired']);
        return;
      }
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
          <img alt="" src={iconWarning} className="size-5" />
          <span>{t['ipBlacklist.add.title']}</span>
        </span>
      }
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button type="outline" className="min-w-[80px]" onClick={onCancel}>
            {common['common.cancel']}
          </Button>
          <Button
            type="primary"
            status="danger"
            className="min-w-[80px]"
            loading={submitting}
            onClick={submit}
          >
            {t['ipBlacklist.add.submit']}
          </Button>
        </div>
      }
    >
      <p className="m-0 mb-3 text-[14px] leading-[21px] text-arco-text-1">
        {t['ipBlacklist.add.tip']}
      </p>
      <Form
        form={form}
        layout="vertical"
        requiredSymbol={{ position: 'end' }}
        className="use-ip-blacklist-action-form"
      >
        <FormItem
          field="ips"
          label={
            <span className="inline-flex flex-wrap items-center gap-1">
              <span>{t['ipBlacklist.add.field.ip']}</span>
              <span className="text-[12px] font-normal leading-[18px] text-arco-text-3">
                {t['ipBlacklist.add.field.ipHint']}
              </span>
            </span>
          }
          rules={[
            {
              required: true,
              message: t['ipBlacklist.add.msg.ipRequired']
            }
          ]}
        >
          <TextArea
            placeholder={t['ipBlacklist.add.placeholder.ip']}
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
        </FormItem>
        <FormItem
          field="reason"
          label={t['ipBlacklist.add.field.reason']}
          rules={[
            {
              required: true,
              message: t['ipBlacklist.add.placeholder.reason']
            }
          ]}
        >
          <Select
            allowClear
            placeholder={t['ipBlacklist.add.placeholder.reason']}
            options={reasonOptions}
          />
        </FormItem>
        <FormItem
          field="reason_description"
          label={t['ipBlacklist.add.field.reasonDescription']}
        >
          <TextArea
            placeholder={t['ipBlacklist.add.placeholder.reasonDescription']}
            autoSize={{ minRows: 2, maxRows: 4 }}
          />
        </FormItem>
      </Form>
    </Modal>
  );
}
