import React, { useEffect, useMemo, useState } from 'react';
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
import './create-account-modal.less';

const FormItem = Form.Item;

function genPassword(len = 14) {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789#@$%';
  let out = '';
  for (let i = 0; i < len; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export type CreateAccountModalProps = {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
};

type Step = 'form' | 'success';

export default function CreateAccountModal({
  visible,
  onCancel,
  onSuccess
}: CreateAccountModalProps) {
  const [form] = Form.useForm<AdminAPI.CreateSysUserRequest>();
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
    form.setFieldsValue({ password: genPassword(), status: 'active' });
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

  const footer = useMemo(() => {
    if (step === 'success') return null;
    return (
      <div className="flex w-full items-center justify-end gap-2">
        <Button className="!min-w-[80px]" onClick={onCancel}>
          取消
        </Button>
        <Button
          type="primary"
          className="!min-w-[80px]"
          loading={submitting}
          onClick={async () => {
            try {
              const values = await form.validate();
              setSubmitting(true);
              await postV1AdminSystemUsersCreate(values);
              setCreated({
                username: values.username,
                password: values.password
              });
              setStep('success');
              onSuccess?.();
            } catch {
              // validate
            } finally {
              setSubmitting(false);
            }
          }}
        >
          确认创建
        </Button>
      </div>
    );
  }, [step, submitting, form, onCancel, onSuccess]);

  const copyText = (text: string, tip = '已复制') => {
    copy(text);
    Message.success(tip);
  };

  return (
    <Modal
      title={step === 'form' ? '新建账号' : undefined}
      visible={visible}
      onCancel={onCancel}
      footer={footer}
      unmountOnExit
      closable={step === 'form'}
      maskClosable={step === 'form'}
      className={cs('use-create-account-modal', {
        'is-success': step === 'success'
      })}
      style={{ width: 780 }}
    >
      {step === 'form' ? (
        <Form form={form} layout="vertical" requiredSymbol={{ position: 'end' }}>
          <FormItem
            field="username"
            label="username"
            rules={[{ required: true }]}
          >
            <Input placeholder="username" allowClear />
          </FormItem>
          <FormItem field="display_name" label="display_name">
            <Input placeholder="display_name" allowClear />
          </FormItem>
          <FormItem
            field="password"
            label="password"
            rules={[{ required: true }]}
          >
            <Input placeholder="password" allowClear />
          </FormItem>
          <FormItem field="role_ids" label="role_ids">
            <Select
              mode="multiple"
              placeholder="role_ids"
              options={roleOptions}
              allowClear
            />
          </FormItem>
          <FormItem field="description" label="description">
            <Input placeholder="description" allowClear />
          </FormItem>
          <FormItem field="status" label="status">
            <Select
              options={[
                { label: 'active', value: 'active' },
                { label: 'disabled', value: 'disabled' }
              ]}
            />
          </FormItem>
        </Form>
      ) : (
        <div className="px-10 py-6">
          <Result
            status="success"
            icon={
              <IconCheckCircleFill className="text-[48px] text-[rgb(var(--success-6))]" />
            }
            title="账号创建成功"
            subTitle="请妥善保存初始密码。"
          />
          <div className="mx-auto mt-4 w-full max-w-[520px] rounded-lg border border-solid border-[rgba(0,0,0,0.08)] p-3 text-[12px]">
            <div>username：{created?.username}</div>
            <div className="mt-2 flex items-center gap-2">
              password：{created?.password}
              <button
                type="button"
                className="border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
                onClick={() =>
                  created?.password && copyText(created.password)
                }
              >
                <IconCopy />
              </button>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Button type="primary" onClick={onCancel}>
              完成
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
