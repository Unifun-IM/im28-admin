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
import { createAccount } from '@shared/api/biz';

const FormItem = Form.Item;

const ROLE_OPTIONS = [
  { label: '超级管理员', value: '超级管理员' },
  { label: '管理员', value: '管理员' },
  { label: '客服', value: '客服' },
  { label: '财务', value: '财务' },
  { label: 'AAA', value: 'AAA' }
];

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

/**
 * 新建账号 — Figma 666:21799
 * 创建成功 — Figma 921:44334
 */
export default function CreateAccountModal({
  visible,
  onCancel,
  onSuccess
}: CreateAccountModalProps) {
  const [form] = Form.useForm();
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{
    account: string;
    password: string;
  } | null>(null);

  useEffect(() => {
    if (!visible) return;
    setStep('form');
    setCreated(null);
    form.resetFields();
    form.setFieldsValue({ password: genPassword() });
  }, [visible, form]);

  const title = step === 'form' ? '新建账号' : undefined;

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
              const res = (await createAccount(values)) as {
                account?: string;
                password?: string;
              };
              setCreated({
                account: String(res.account || values.account),
                password: String(res.password || values.password)
              });
              setStep('success');
              onSuccess?.();
            } catch {
              // validate fail
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
      title={title}
      visible={visible}
      onCancel={onCancel}
      footer={footer}
      unmountOnExit
      closable={step === 'form'}
      maskClosable={step === 'form'}
      className={cs('use-create-account-modal', {
        'is-success': step === 'success'
      })}
      wrapClassName="use-create-account-modal-wrap"
      style={{ width: 780 }}
    >
      {step === 'form' ? (
        <Form form={form} layout="vertical" requiredSymbol={{ position: 'end' }}>
          <FormItem
            field="account"
            label="账号"
            rules={[{ required: true, message: '请输入账号' }]}
          >
            <Input placeholder="输入账号" allowClear />
          </FormItem>
          <FormItem
            field="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input
              placeholder="请输入密码"
              allowClear
              suffix={
                <button
                  type="button"
                  aria-label="复制密码"
                  className="inline-flex cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-3 hover:text-arco-text-1"
                  onClick={() => {
                    const pwd = form.getFieldValue('password');
                    if (pwd) copyText(String(pwd), '密码已复制');
                  }}
                >
                  <IconCopy />
                </button>
              }
            />
          </FormItem>
          <FormItem
            field="role"
            label="关联角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色" options={ROLE_OPTIONS} allowClear />
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
            subTitle="请妥善保存初始密码。关闭弹窗后将无法再次查看，用户首次登录时需修改密码。"
          />
          <div className="mx-auto mt-4 w-full max-w-[520px] rounded-lg border border-solid border-[rgba(0,0,0,0.08)] bg-[var(--color-bg-2,#fff)] p-3">
            <div className="flex items-center gap-6">
              <span className="w-[120px] shrink-0 text-[12px] leading-[18px] text-arco-text-1">
                登录账号
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                <span className="truncate text-[12px] leading-[18px] text-arco-text-1">
                  {created?.account}
                </span>
                <button
                  type="button"
                  aria-label="复制账号"
                  className="inline-flex size-[14px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
                  onClick={() =>
                    created?.account &&
                    copyText(created.account, '账号已复制')
                  }
                >
                  <IconCopy className="text-[14px]" />
                </button>
              </div>
            </div>
            <div className="my-3 h-px bg-[rgba(0,0,0,0.08)]" />
            <div className="flex items-center gap-6">
              <span className="w-[120px] shrink-0 text-[12px] leading-[18px] text-arco-text-1">
                初始密码
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
                <span className="truncate text-[12px] leading-[18px] text-arco-text-1">
                  {created?.password}
                </span>
                <button
                  type="button"
                  aria-label="复制密码"
                  className="inline-flex size-[14px] cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[rgb(var(--primary-6))]"
                  onClick={() =>
                    created?.password &&
                    copyText(created.password, '密码已复制')
                  }
                >
                  <IconCopy className="text-[14px]" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              className="!rounded-lg !bg-[var(--color-fill-2,#f2f3f5)] !text-arco-text-2"
              onClick={() => {
                if (!created) return;
                copyText(
                  `登录账号：${created.account}\n初始密码：${created.password}`,
                  '账号和密码已复制'
                );
              }}
            >
              复制账号和密码
            </Button>
            <Button
              type="primary"
              className="!w-[100px] !rounded-lg"
              onClick={onCancel}
            >
              完成
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
