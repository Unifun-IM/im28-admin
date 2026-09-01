import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Result,
  Select
} from '@arco-design/web-react';
import { IconCheckCircleFill, IconCopy } from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import cs from 'classnames';
import { postV1AdminSystemUsersCreate } from '@shared/api/admin/systemUsers';
import { postV1AdminRolesList } from '@shared/api/admin/rbac';
import useLocale from '@shared/lib/useLocale';
import '@shared/ui/biz-form-modal.less';
import './create-account-modal.less';

const FormItem = Form.Item;

const IPV4_RE =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

type FormValues = {
  username: string;
  role_id: number;
  ip_text: string;
};

function parseIps(raw: string): string[] {
  return raw
    .split(/[\s,，;；\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type CreateAccountModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
};

type Step = 'form' | 'success';

/**
 * 新建账号 — Figma 666:21800 / 921:44334 / 1217:27788
 * 不传密码：服务端生成 temporary_password，成功页一次性展示
 * IP 非必填：留空传空数组表示不限制；正式调整请走 update-ip-whitelist
 */
export default function CreateAccountModal({
  visible,
  onCancel,
  onSuccess
}: CreateAccountModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<FormValues>();
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [roleOptions, setRoleOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [created, setCreated] = useState<{
    username: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    if (!visible) return;
    setStep('form');
    setCreated(null);
    form.resetFields();
    postV1AdminRolesList({ page: 1, page_size: 100 }).then((res) => {
      setRoleOptions(
        (res.data?.list || [])
          .map((item) => ({
            label: item.role?.name || item.role?.code || String(item.role?.id),
            value: Number(item.role?.id)
          }))
          .filter((o) => Number.isFinite(o.value))
      );
    });
  }, [visible, form]);

  const copyText = (text: string) => {
    copy(text);
    Message.success(common['common.copied']);
  };

  const copyAccountAndPassword = () => {
    if (!created) return;
    copyText(
      `${t['createAccount.success.username']}：${created.username}\n${t['createAccount.success.password']}：${created.password}`
    );
  };

  const submit = async () => {
    try {
      const values = await form.validate();
      // 留空 = 不限制来源 IP（空数组）
      const ips = parseIps(values.ip_text || '');
      const invalid = ips.find((ip) => !IPV4_RE.test(ip));
      if (invalid) {
        Message.error(
          t['createAccount.msg.invalidIp'].replace('{ip}', invalid)
        );
        return;
      }

      const username = values.username.trim();
      setSubmitting(true);

      const body: AdminAPI.CreateSysUserRequest & {
        ip_whitelist: string[];
      } = {
        username,
        role_ids: [values.role_id],
        status: 'active',
        ip_whitelist: ips
      };
      const res = await postV1AdminSystemUsersCreate(body);
      setCreated({
        username: res.data?.username || username,
        password: res.data?.temporary_password || ''
      });
      setStep('success');
      onSuccess?.();
    } catch {
      // validate / request
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={step === 'form' ? t['createAccount.title'] : undefined}
      visible={visible}
      onCancel={onCancel}
      footer={
        step === 'success' ? null : (
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <Button type="outline" className="!min-w-[80px]" onClick={onCancel}>
              {common['common.cancel']}
            </Button>
            <Button
              type="primary"
              className="!min-w-[80px]"
              loading={submitting}
              onClick={submit}
            >
              {common['common.create']}
            </Button>
          </div>
        )
      }
      unmountOnExit
      closable={false}
      maskClosable={false}
      className={cs('use-biz-form-modal', 'use-create-account-modal', {
        'is-success': step === 'success'
      })}
      wrapClassName="use-create-account-modal-wrap"
      style={{ width: 780 }}
    >
      {step === 'form' ? (
        <Form
          form={form}
          layout="vertical"
          requiredSymbol={{ position: 'end' }}
        >
          <FormItem
            field="username"
            label={t['createAccount.field.username']}
            rules={[
              {
                required: true,
                message: t['createAccount.placeholder.username']
              }
            ]}
          >
            <Input
              placeholder={t['createAccount.placeholder.username']}
              allowClear
            />
          </FormItem>
          <FormItem
            field="role_id"
            label={t['createAccount.field.roleIds']}
            rules={[
              {
                required: true,
                message: t['createAccount.placeholder.roleIds']
              }
            ]}
          >
            <Select
              placeholder={t['createAccount.placeholder.roleIds']}
              options={roleOptions}
              allowClear
            />
          </FormItem>
          <FormItem
            field="ip_text"
            label={t['createAccount.field.ipWhitelist']}
            extra={
              <span className="text-caption-compact text-arco-danger">
                {t['createAccount.field.ipWhitelistExtra']}
              </span>
            }
          >
            <Input
              placeholder={t['createAccount.placeholder.ipWhitelist']}
              allowClear
            />
          </FormItem>
        </Form>
      ) : (
        <div className="use-create-account-success px-20 py-6">
          <Result
            status="success"
            icon={
              <IconCheckCircleFill className="text-[48px] text-[rgb(var(--success-6))]" />
            }
            title={t['createAccount.success.title']}
            subTitle={
              <span className="inline-block max-w-[420px] text-center">
                {t['createAccount.success.subTitle']}
              </span>
            }
          />
          <div className="use-create-account-credential mx-auto mt-4 w-full max-w-[520px] rounded-lg border border-solid border-[var(--color-border-2)] p-3 text-caption-compact text-arco-text-1">
            <div className="flex items-center gap-6">
              <span className="w-[120px] shrink-0">
                {t['createAccount.success.username']}
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                <span className="truncate">{created?.username}</span>
                <button
                  type="button"
                  className="inline-flex size-[14px] shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
                  onClick={() =>
                    created?.username && copyText(created.username)
                  }
                >
                  <IconCopy />
                </button>
              </div>
            </div>
            <div className="my-3 h-px w-full bg-[var(--color-border-2)]" />
            <div className="flex items-center gap-6">
              <span className="w-[120px] shrink-0">
                {t['createAccount.success.password']}
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                <span className="truncate">{created?.password}</span>
                <button
                  type="button"
                  className="inline-flex size-[14px] shrink-0 items-center justify-center border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
                  onClick={() =>
                    created?.password && copyText(created.password)
                  }
                >
                  <IconCopy />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button type="secondary" onClick={copyAccountAndPassword}>
              {t['createAccount.success.copyBoth']}
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
      )}
    </Modal>
  );
}
