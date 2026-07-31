import {
  Form,
  Input,
  Button,
  Message,
  Modal
} from '@arco-design/web-react';
import { FormInstance } from '@arco-design/web-react/es/Form';
import { IconLock, IconUser } from '@arco-design/web-react/icon';
import React, { useRef, useState } from 'react';

import {
  postV1AdminAuthLogin,
  postV1AdminAuthPasswordChange,
  postV1AdminAuthTwoFactorConfirm,
  postV1AdminAuthTwoFactorSetup,
  postV1AdminAuthTwoFactorVerify
} from '@shared/api/admin/auth';
import { setAccessToken } from '@shared/api/request';
import useLocale from '@shared/lib/useLocale';

import GaBindModal from './GaBindModal';
import GaVerifyModal from './GaVerifyModal';
import SlideCaptcha from './SlideCaptcha';
import locale from './locale';

type PendingAuth = {
  next_step: NonNullable<
    AdminAPI.SysUserLoginEnvelope['data']
  >['next_step'];
  pre_auth_token: string;
};

/**
 * 登录表单 — 对接 AdminAPI auth（username / password / next_step）
 */
export default function LoginForm() {
  const formRef = useRef<FormInstance>();
  const [loading, setLoading] = useState(false);
  const [gaLoading, setGaLoading] = useState(false);
  const [sliderOk, setSliderOk] = useState(false);
  const [pending, setPending] = useState<PendingAuth | null>(null);
  const [setup, setSetup] = useState<AdminAPI.SetupTwoFactorEnvelope['data']>();
  const [pwdVisible, setPwdVisible] = useState(false);
  const [pwdForm] = Form.useForm<AdminAPI.ChangeSysUserPasswordRequest>();

  const t = useLocale(locale);

  function finishLogin(token?: AdminAPI.Token) {
    const access = token?.access_token;
    if (!access) {
      Message.error(t['login.form.login.errMsg']);
      return;
    }
    localStorage.setItem('userStatus', 'login');
    setAccessToken(access);
    Message.success(t['login.msg.loginSuccess']);
    window.setTimeout(() => {
      window.location.href = '/user/query';
    }, 400);
  }

  async function applyLoginData(
    data: NonNullable<AdminAPI.SysUserLoginEnvelope['data']>
  ) {
    const next: PendingAuth = {
      next_step: data.next_step,
      pre_auth_token: data.pre_auth_token
    };
    setPending(next);
    if (data.next_step === 'change_password') {
      pwdForm.setFieldsValue({
        pre_auth_token: data.pre_auth_token,
        current_password: '',
        new_password: ''
      });
      setPwdVisible(true);
      return;
    }
    if (data.next_step === 'bind_two_factor') {
      const setupRes = await postV1AdminAuthTwoFactorSetup({
        pre_auth_token: data.pre_auth_token
      });
      setSetup(setupRes.data);
      return;
    }
    // verify_two_factor
    setSetup(undefined);
  }

  async function login(params: AdminAPI.SysUserLoginRequest) {
    setLoading(true);
    try {
      const res = await postV1AdminAuthLogin(params);
      if (res.data) {
        await applyLoginData(res.data);
      }
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : t['login.form.login.errMsg'];
      Message.error(message);
      setSliderOk(false);
    } finally {
      setLoading(false);
    }
  }

  function onSubmitClick() {
    if (!sliderOk) {
      Message.warning(t['login.form.slider']);
      return;
    }
    formRef.current?.validate().then((values) => {
      login(values as AdminAPI.SysUserLoginRequest);
    });
  }

  function closeGa() {
    setPending(null);
    setSetup(undefined);
    setSliderOk(false);
  }

  async function submitVerify(code: string) {
    if (!pending) return;
    setGaLoading(true);
    try {
      const res = await postV1AdminAuthTwoFactorVerify({
        pre_auth_token: pending.pre_auth_token,
        code
      });
      finishLogin(res.data?.token);
    } catch {
      // request 已 toast
    } finally {
      setGaLoading(false);
    }
  }

  async function submitBind(code: string) {
    if (!pending) return;
    setGaLoading(true);
    try {
      const res = await postV1AdminAuthTwoFactorConfirm({
        pre_auth_token: pending.pre_auth_token,
        code
      });
      finishLogin(res.data?.token);
    } catch {
      // request 已 toast
    } finally {
      setGaLoading(false);
    }
  }

  async function submitPasswordChange() {
    try {
      const values = await pwdForm.validate();
      setLoading(true);
      const res = await postV1AdminAuthPasswordChange(values);
      setPwdVisible(false);
      if (res.data) {
        await applyLoginData({
          next_step: res.data.next_step,
          pre_auth_token: res.data.pre_auth_token,
          expires_in: res.data.expires_in
        });
      }
    } catch {
      // validate / request
    } finally {
      setLoading(false);
    }
  }

  const otpauthUri = setup?.otpauth_uri;
  const qrUrl = otpauthUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUri)}`
    : undefined;

  return (
    <div className="flex w-full flex-col gap-[24px]">
      <div className="flex w-full flex-col">
        <div className="text-[36px] font-bold leading-[44px] text-[var(--color-text-1,#1d2129)]">
          {t['login.form.title']}
        </div>
        <div className="text-[12px] leading-[18px] text-[var(--color-text-3,#86909c)]">
          {t['login.form.subTitle']}
        </div>
      </div>

      <Form
        className="use-login-form"
        layout="vertical"
        ref={formRef}
        initialValues={{ username: '', password: '' }}
        requiredSymbol={false}
      >
        <div className="flex flex-col gap-[16px]">
          <Form.Item
            field="username"
            className="!mb-0"
            rules={[{ required: true, message: t['login.form.userName.errMsg'] }]}
          >
            <Input
              prefix={<IconUser />}
              placeholder={t['login.form.userName.placeholder']}
              onPressEnter={onSubmitClick}
            />
          </Form.Item>
          <Form.Item
            field="password"
            className="!mb-0"
            rules={[{ required: true, message: t['login.form.password.errMsg'] }]}
          >
            <Input.Password
              prefix={<IconLock />}
              placeholder={t['login.form.password.placeholder']}
              onPressEnter={onSubmitClick}
            />
          </Form.Item>
          <SlideCaptcha value={sliderOk} onChange={setSliderOk} />
          <Button type="primary" long onClick={onSubmitClick} loading={loading}>
            {t['login.form.login']}
          </Button>
        </div>
      </Form>

      <GaVerifyModal
        visible={pending?.next_step === 'verify_two_factor'}
        loading={gaLoading}
        onCancel={closeGa}
        onOk={submitVerify}
      />
      <GaBindModal
        visible={pending?.next_step === 'bind_two_factor' && Boolean(setup)}
        loading={gaLoading}
        secret={setup?.secret}
        qrUrl={qrUrl}
        onCancel={closeGa}
        onOk={submitBind}
      />

      <Modal
        title="修改密码"
        visible={pwdVisible}
        onCancel={() => {
          setPwdVisible(false);
          closeGa();
        }}
        onOk={submitPasswordChange}
        confirmLoading={loading}
        unmountOnExit
      >
        <Form form={pwdForm} layout="vertical">
          <Form.Item field="pre_auth_token" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            field="current_password"
            label="current_password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            field="new_password"
            label="new_password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
