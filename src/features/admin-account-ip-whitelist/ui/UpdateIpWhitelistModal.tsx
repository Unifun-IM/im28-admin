import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Message, Modal } from '@arco-design/web-react';
import { postV1AdminSystemUsersUpdateIpWhitelist } from '@shared/api/admin/systemUsers';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import useLocale from '@shared/lib/useLocale';
import './update-ip-whitelist-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

const IPV4_RE =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

export type IpWhitelistTarget = {
  id: number;
  username: string;
  ip_whitelist?: string[];
};

export type UpdateIpWhitelistModalProps = {
  visible: boolean;
  target: IpWhitelistTarget | null;
  onCancel: () => void;
  onSuccess?: () => void;
};

function parseIps(raw: string): string[] {
  return raw
    .split(/[\s,，;；\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** 调整后台 IP 白名单 — AdminAPI.UpdateSysUserIPWhitelistRequest */
export default function UpdateIpWhitelistModal({
  visible,
  target,
  onCancel,
  onSuccess
}: UpdateIpWhitelistModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<{
    id: number;
    ip_text: string;
    two_factor_code: string;
  }>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible || !target) return;
    form.resetFields();
    form.setFieldsValue({
      id: target.id,
      ip_text: (target.ip_whitelist || []).join('\n'),
      two_factor_code: ''
    });
  }, [visible, form, target]);

  const submit = async () => {
    try {
      const values = await form.validate();
      if (target?.id == null) return;
      const ips = parseIps(values.ip_text || '');
      const invalid = ips.find((ip) => !IPV4_RE.test(ip));
      if (invalid) {
        Message.error(
          t['ipWhitelist.msg.invalidIp'].replace('{ip}', invalid)
        );
        return;
      }
      setSubmitting(true);
      const body: AdminAPI.UpdateSysUserIPWhitelistRequest = {
        id: target.id,
        ip_whitelist: ips,
        two_factor_code: values.two_factor_code
      };
      await postV1AdminSystemUsersUpdateIpWhitelist(body);
      Message.success(common['common.success']);
      onSuccess?.();
      onCancel();
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
      className="use-update-ip-whitelist-modal"
      style={{ width: 520 }}
      title={
        <div className="flex items-center gap-2">
          <img alt="" src={iconWarning} className="size-5" />
          <span>{t['ipWhitelist.title']}</span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>{common['common.cancel']}</Button>
          <Button type="primary" loading={submitting} onClick={submit}>
            {common['common.confirm']}
          </Button>
        </div>
      }
    >
      <p className="m-0 mb-3 text-[14px] leading-[22px] text-arco-text-2">
        {t['ipWhitelist.target']
          .replace('{username}', target?.username || '')
          .replace('{id}', String(target?.id ?? ''))}
      </p>
      <p className="m-0 mb-4 text-[12px] leading-[18px] text-arco-text-3">
        {t['ipWhitelist.hint']}
      </p>
      <Form form={form} layout="vertical">
        <FormItem field="id" hidden>
          <Input />
        </FormItem>
        <FormItem
          field="ip_text"
          label={t['ipWhitelist.field.ips']}
          extra={t['ipWhitelist.field.ipsExtra']}
        >
          <TextArea
            placeholder={t['ipWhitelist.placeholder.ips']}
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
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
      </Form>
    </Modal>
  );
}
