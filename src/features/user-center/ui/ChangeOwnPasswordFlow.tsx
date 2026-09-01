import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Result } from '@arco-design/web-react';
import { IconCheckCircleFill, IconClose } from '@arco-design/web-react/icon';
import cs from 'classnames';
import {
  postV1AdminAuthPasswordUpdate,
  postV1AdminAuthSecurityVerify
} from '@shared/api/admin/auth';
import iconWarning from '@assets/icon/icon-exclamation-circle-fill.svg';
import { GaVerifyModal } from '@features/ga-verify';
import useLocale from '@shared/lib/useLocale';
import '@shared/ui/biz-form-modal.less';
import './user-center-modal.less';

const FormItem = Form.Item;

export type ChangeOwnPasswordFlowProps = {
  visible: boolean;
  username?: string;
  onCancel: () => void;
  /** 成功后点「重新登录」 */
  onRelogin: () => void;
};

type Step = 'confirm' | 'ga' | 'form' | 'success';

type PasswordForm = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

function hasConsecutiveChars(value: string): boolean {
  for (let i = 0; i < value.length - 2; i += 1) {
    const a = value.charCodeAt(i);
    const b = value.charCodeAt(i + 1);
    const c = value.charCodeAt(i + 2);
    if (a === b && b === c) return true;
    if (b === a + 1 && c === b + 1) return true;
    if (b === a - 1 && c === b - 1) return true;
  }
  return false;
}

/**
 * 个人中心改密流程
 * 确认 979:40720 → GaVerifyModal → 设置新密码 979:40879 → 成功 979:40992
 */
export default function ChangeOwnPasswordFlow({
  visible,
  username = '',
  onCancel,
  onRelogin
}: ChangeOwnPasswordFlowProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<PasswordForm>();
  const [step, setStep] = useState<Step>('confirm');
  const [submitting, setSubmitting] = useState(false);
  const [gaErrorTick, setGaErrorTick] = useState(0);
  const [securityToken, setSecurityToken] = useState('');

  useEffect(() => {
    if (!visible) return;
    setStep('confirm');
    setSubmitting(false);
    setGaErrorTick(0);
    setSecurityToken('');
    form.resetFields();
  }, [visible, form]);

  const submitGa = async (code: string) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const verify = await postV1AdminAuthSecurityVerify({
        operation: 'update_password',
        two_factor_code: code
      });
      const token = verify.data?.security_token;
      if (!token) {
        setGaErrorTick((n) => n + 1);
        return;
      }
      setSecurityToken(token);
      form.resetFields();
      setStep('form');
    } catch {
      setGaErrorTick((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const submitPassword = async () => {
    if (submitting || !securityToken) return;
    try {
      const values = await form.validate();
      setSubmitting(true);
      await postV1AdminAuthPasswordUpdate({
        security_token: securityToken,
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password
      });
      setStep('success');
    } catch {
      // validate / request — token 可能已消费，失败回确认重走
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 确认 — Figma 979:40720 */}
      <Modal
        visible={visible && step === 'confirm'}
        onCancel={onCancel}
        unmountOnExit
        closable={false}
        maskClosable={false}
        className="use-biz-form-modal use-change-own-pwd-modal"
        wrapClassName="use-user-center-modal-wrap"
        style={{ width: 480 }}
        title={
          <div className="flex items-center gap-2">
            <img alt="" src={iconWarning} className="size-5" />
            <span>{t['userCenter.pwdConfirm.title']}</span>
          </div>
        }
        footer={
          <div className="flex w-full flex-wrap justify-end gap-2">
            <Button type="outline" className="!min-w-[80px]" onClick={onCancel}>
              {common['common.cancel']}
            </Button>
            <Button
              type="primary"
              status="danger"
              className="!min-w-[80px]"
              onClick={() => {
                setGaErrorTick(0);
                setStep('ga');
              }}
            >
              {t['userCenter.changePassword']}
            </Button>
          </div>
        }
      >
        <p className="m-0 text-sm text-arco-text-1">
          {t['userCenter.pwdConfirm.desc']}
        </p>
        <ul className="m-0 mt-3 list-disc pl-[21px] text-sm text-arco-text-1">
          <li>{t['userCenter.pwdConfirm.bullet.1']}</li>
          <li>{t['userCenter.pwdConfirm.bullet.2']}</li>
        </ul>
      </Modal>

      <GaVerifyModal
        visible={visible && step === 'ga'}
        loading={submitting}
        errorTick={gaErrorTick}
        onCancel={onCancel}
        onOk={submitGa}
      />

      {/* 设置新密码 — Figma 979:40879 */}
      <Modal
        visible={visible && step === 'form'}
        onCancel={onCancel}
        unmountOnExit
        closable={false}
        maskClosable={false}
        className="use-biz-form-modal use-change-own-pwd-modal use-change-own-pwd-form"
        wrapClassName="use-user-center-modal-wrap"
        style={{ width: 780 }}
        title={
          <div className="flex w-full items-center justify-between">
            <span>{t['userCenter.pwdForm.title']}</span>
            <button
              type="button"
              aria-label={common['common.close']}
              className="inline-flex size-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-2 hover:text-arco-text-1"
              onClick={onCancel}
            >
              <IconClose className="text-[16px]" />
            </button>
          </div>
        }
        footer={
          <div className="flex w-full flex-wrap justify-end gap-2">
            <Button type="outline" className="!min-w-[80px]" onClick={onCancel}>
              {common['common.cancel']}
            </Button>
            <Button
              type="primary"
              className="!min-w-[80px]"
              loading={submitting}
              onClick={submitPassword}
            >
              {common['common.confirm']}
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          requiredSymbol={{ position: 'end' }}
          className="use-change-own-pwd-fields"
        >
          <FormItem
            field="current_password"
            label={t['userCenter.field.oldPassword']}
            rules={[
              {
                required: true,
                message: t['userCenter.msg.currentPasswordRequired']
              }
            ]}
          >
            <Input.Password
              autoComplete="current-password"
              placeholder={t['userCenter.placeholder.oldPassword']}
            />
          </FormItem>
          <FormItem
            field="new_password"
            label={t['userCenter.field.newPassword']}
            rules={[
              {
                required: true,
                message: t['userCenter.msg.newPasswordRequired']
              },
              {
                validator: (value, callback) => {
                  const v = String(value || '');
                  if (v.length < 8 || v.length > 20) {
                    callback(t['userCenter.msg.passwordLength']);
                    return;
                  }
                  if (
                    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(
                      v
                    )
                  ) {
                    callback(t['userCenter.msg.passwordComplexity']);
                    return;
                  }
                  if (
                    username &&
                    v.toLowerCase().includes(username.toLowerCase())
                  ) {
                    callback(t['userCenter.msg.passwordContainsUsername']);
                    return;
                  }
                  if (hasConsecutiveChars(v)) {
                    callback(t['userCenter.msg.passwordConsecutive']);
                    return;
                  }
                  callback();
                }
              }
            ]}
          >
            <Input.Password
              autoComplete="new-password"
              placeholder={t['userCenter.placeholder.newPassword']}
            />
          </FormItem>
          <FormItem
            field="confirm_password"
            label={t['userCenter.field.confirmNewPassword']}
            rules={[
              {
                required: true,
                message: t['userCenter.msg.confirmPasswordRequired']
              },
              {
                validator: (value, callback) => {
                  if (value !== form.getFieldValue('new_password')) {
                    callback(t['userCenter.msg.passwordMismatch']);
                    return;
                  }
                  callback();
                }
              }
            ]}
          >
            <Input.Password
              autoComplete="new-password"
              placeholder={t['userCenter.placeholder.confirmPassword']}
            />
          </FormItem>
        </Form>
        <div className="mt-1 text-sm text-arco-text-1">
          <p className="m-0">{t['userCenter.pwdForm.rulesTitle']}</p>
          <ul className="m-0 list-disc pl-[21px]">
            <li>{t['userCenter.pwdForm.rule.1']}</li>
            <li>{t['userCenter.pwdForm.rule.2']}</li>
            <li>{t['userCenter.pwdForm.rule.3']}</li>
            <li>{t['userCenter.pwdForm.rule.4']}</li>
          </ul>
        </div>
      </Modal>

      {/* 成功 — Figma 979:40992 */}
      <Modal
        visible={visible && step === 'success'}
        onCancel={onRelogin}
        unmountOnExit
        closable={false}
        maskClosable={false}
        footer={null}
        className={cs(
          'use-biz-form-modal',
          'use-change-own-pwd-modal',
          'is-success'
        )}
        wrapClassName="use-user-center-modal-wrap"
        style={{ width: 780 }}
      >
        <div className="px-20 py-6">
          <Result
            status="success"
            icon={
              <IconCheckCircleFill className="text-[48px] text-[rgb(var(--success-6))]" />
            }
            title={t['userCenter.pwdSuccess.title']}
            extra={
              <Button
                type="primary"
                className="!min-w-[100px]"
                onClick={onRelogin}
              >
                {t['userCenter.pwdSuccess.relogin']}
              </Button>
            }
          />
        </div>
      </Modal>
    </>
  );
}
