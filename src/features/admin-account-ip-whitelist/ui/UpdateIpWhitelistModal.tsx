import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Message, Modal } from '@arco-design/web-react';
import { postV1AdminSystemUsersUpdateIpWhitelist } from '@shared/api/admin/systemUsers';
import { GaVerifyModal } from '@features/ga-verify';
import useLocale from '@shared/lib/useLocale';
import '@shared/ui/biz-form-modal.less';
import './update-ip-whitelist-modal.less';

const FormItem = Form.Item;

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

type Step = 'form' | 'ga';

/**
 * 调整白名单 — Figma 1023:23052 / 921:44417 / 1217:27788
 * 留空 = 空数组，表示不限制来源 IP
 * AdminAPI.UpdateSysUserIPWhitelistRequest
 */
export default function UpdateIpWhitelistModal({
  visible,
  target,
  onCancel,
  onSuccess
}: UpdateIpWhitelistModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<{ ip_text: string }>();
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [ips, setIps] = useState<string[]>([]);
  const [gaErrorTick, setGaErrorTick] = useState(0);

  useEffect(() => {
    if (!visible || !target) return;
    setStep('form');
    setIps([]);
    setGaErrorTick(0);
    form.resetFields();
    form.setFieldsValue({
      ip_text: (target.ip_whitelist || []).join(', ')
    });
  }, [visible, form, target]);

  const goGa = async () => {
    try {
      const values = await form.validate();
      // 留空 = 不限制来源 IP（空数组）
      const nextIps = parseIps(values.ip_text || '');
      const invalid = nextIps.find((ip) => !IPV4_RE.test(ip));
      if (invalid) {
        Message.error(
          t['ipWhitelist.msg.invalidIp'].replace('{ip}', invalid)
        );
        return;
      }
      setIps(nextIps);
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
      const body: AdminAPI.UpdateSysUserIPWhitelistRequest = {
        id: target.id,
        ip_whitelist: ips,
        two_factor_code: code
      };
      await postV1AdminSystemUsersUpdateIpWhitelist(body);
      Message.success(common['common.success']);
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
        visible={visible && step === 'form'}
        onCancel={onCancel}
        unmountOnExit
        closable={false}
        maskClosable={false}
        className="use-biz-form-modal use-update-ip-whitelist-modal"
        wrapClassName="use-update-ip-whitelist-modal-wrap"
        style={{ width: 780 }}
        title={t['ipWhitelist.title']}
        footer={
          <div className="flex w-full flex-wrap justify-end gap-2">
            <Button type="outline" className="!min-w-[80px]" onClick={onCancel}>
              {common['common.cancel']}
            </Button>
            <Button
              type="primary"
              className="!min-w-[80px]"
              onClick={goGa}
            >
              {t['ipWhitelist.action.save']}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          requiredSymbol={{ position: 'end' }}
        >
          <FormItem
            field="ip_text"
            label={t['ipWhitelist.field.ips']}
            extra={
              <span className="text-[12px] leading-[18px] text-[rgb(var(--danger-6))]">
                {t['ipWhitelist.field.ipsExtra']}
              </span>
            }
          >
            <Input
              allowClear
              placeholder={t['ipWhitelist.placeholder.ips']}
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
