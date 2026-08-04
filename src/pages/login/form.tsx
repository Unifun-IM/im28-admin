import {
  Form,
  Input,
  Button,
  Message
} from '@arco-design/web-react';
import { FormInstance } from '@arco-design/web-react/es/Form';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  postV1AdminAuthLogin,
  postV1AdminAuthPasswordChange,
  postV1AdminAuthTwoFactorConfirm,
  postV1AdminAuthTwoFactorSetup,
  postV1AdminAuthTwoFactorVerify
} from '@shared/api/admin/auth';
import { setAuthTokens } from '@shared/api/request';
import {
  isIpAccessDeniedError
} from '@shared/lib/ipAccessDenied';
import useLocale from '@shared/lib/useLocale';

import ForceChangePasswordModal from './ForceChangePasswordModal';
import ForcePasswordNoticeModal from './ForcePasswordNoticeModal';
import GaBindModal from './GaBindModal';
import { GaVerifyModal } from '@features/ga-verify';
import iconUnlock from './assets/icon-unlock.svg';
import iconUser from './assets/icon-user.svg';
import { mapLoginToast } from './mapLoginToast';
import SlideCaptcha from './SlideCaptcha';

type PendingAuth = {
  next_step: NonNullable<
    AdminAPI.SysUserLoginEnvelope['data']
  >['next_step'];
  pre_auth_token: string;
};

/**
 * 登录表单 — AdminAPI auth next_step
 *
 * Toast 文案仅用前端 Figma 979:39539，不透出后端 message
 */
export default function LoginForm() {
  const formRef = useRef<FormInstance>();
  const [loading, setLoading] = useState(false);
  const [gaLoading, setGaLoading] = useState(false);
  const [sliderOk, setSliderOk] = useState(false);
  const [pending, setPending] = useState<PendingAuth | null>(null);
  const [setup, setSetup] = useState<AdminAPI.SetupTwoFactorEnvelope['data']>();
  const [pwdNoticeVisible, setPwdNoticeVisible] = useState(false);
  const [pwdFormVisible, setPwdFormVisible] = useState(false);
  /** 改密后进入的绑 GA 为强制流程 */
  const [forceBind, setForceBind] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [gaErrorTick, setGaErrorTick] = useState(0);

  const t = useLocale();
  const navigate = useNavigate();

  function finishLogin(token?: AdminAPI.Token) {
    const access = token?.access_token;
    if (!access) {
      Message.error(t['login.msg.verifyFail']);
      return;
    }
    localStorage.setItem('userStatus', 'login');
    setAuthTokens(token);
    Message.success(t['login.msg.loginSuccess']);
    window.setTimeout(() => {
      window.location.href = '/dashboard';
    }, 400);
  }

  /** 退出首次强制流程 / 取消二步：回到登录表单 */
  function exitOnboarding() {
    setPending(null);
    setSetup(undefined);
    setPwdNoticeVisible(false);
    setPwdFormVisible(false);
    setForceBind(false);
    setGaErrorTick(0);
    setSliderOk(false);
  }

  async function openBindTwoFactor(preAuthToken: string, mandatory: boolean) {
    setForceBind(mandatory);
    setGaErrorTick(0);
    const setupRes = await postV1AdminAuthTwoFactorSetup(
      { pre_auth_token: preAuthToken },
      { skipErrorHandler: true }
    );
    setSetup(setupRes.data);
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
      setForceBind(false);
      setSetup(undefined);
      setPwdFormVisible(false);
      setPwdNoticeVisible(true);
      return;
    }

    if (data.next_step === 'bind_two_factor') {
      setPwdNoticeVisible(false);
      setPwdFormVisible(false);
      try {
        // 绑定为首次强制步骤，不可跳过（取消=退出登录）
        await openBindTwoFactor(data.pre_auth_token, true);
      } catch (error) {
        Message.error(mapLoginToast(error, 'gaSetup', t));
        exitOnboarding();
      }
      return;
    }

    // verify_two_factor
    setPwdNoticeVisible(false);
    setPwdFormVisible(false);
    setForceBind(false);
    setSetup(undefined);
    setGaErrorTick(0);
  }

  async function login(params: AdminAPI.SysUserLoginRequest) {
    setLoading(true);
    setLoginUsername(params.username);
    try {
      const res = await postV1AdminAuthLogin(params, {
        skipErrorHandler: true
      });
      if (res.data) {
        await applyLoginData(res.data);
      }
    } catch (error) {
      if (isIpAccessDeniedError(error)) {
        navigate('/ip-denied', { replace: true });
        return;
      }
      Message.error(mapLoginToast(error, 'login', t));
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

  async function submitVerify(code: string) {
    if (!pending) return;
    setGaLoading(true);
    try {
      const res = await postV1AdminAuthTwoFactorVerify(
        {
          pre_auth_token: pending.pre_auth_token,
          code
        },
        { skipErrorHandler: true }
      );
      finishLogin(res.data?.token);
    } catch (error) {
      Message.error(mapLoginToast(error, 'gaVerify', t));
      setGaErrorTick((n) => n + 1);
    } finally {
      setGaLoading(false);
    }
  }

  async function submitBind(code: string) {
    if (!pending) return;
    setGaLoading(true);
    try {
      const res = await postV1AdminAuthTwoFactorConfirm(
        {
          pre_auth_token: pending.pre_auth_token,
          code
        },
        { skipErrorHandler: true }
      );
      finishLogin(res.data?.token);
    } catch (error) {
      Message.error(mapLoginToast(error, 'gaBind', t));
      setGaErrorTick((n) => n + 1);
    } finally {
      setGaLoading(false);
    }
  }

  async function submitPasswordChange(
    values: AdminAPI.ChangeSysUserPasswordRequest
  ) {
    setLoading(true);
    try {
      const res = await postV1AdminAuthPasswordChange(values, {
        skipErrorHandler: true
      });
      setPwdFormVisible(false);
      if (res.data) {
        await applyLoginData({
          next_step: res.data.next_step,
          pre_auth_token: res.data.pre_auth_token,
          expires_in: res.data.expires_in
        });
      }
    } catch (error) {
      Message.error(mapLoginToast(error, 'passwordChange', t));
    } finally {
      setLoading(false);
    }
  }

  const otpauthUri = setup?.otpauth_uri;
  const qrUrl = otpauthUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUri)}`
    : undefined;

  const bindVisible =
    pending?.next_step === 'bind_two_factor' && Boolean(setup);

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
              prefix={
                <img src={iconUser} alt="" className="block size-[14px]" />
              }
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
              prefix={
                <img src={iconUnlock} alt="" className="block size-[14px]" />
              }
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

      <ForcePasswordNoticeModal
        visible={pwdNoticeVisible}
        onContinue={() => {
          setPwdNoticeVisible(false);
          setPwdFormVisible(true);
        }}
      />

      <ForceChangePasswordModal
        visible={pwdFormVisible}
        loading={loading}
        username={loginUsername}
        initialToken={pending?.pre_auth_token}
        onExit={exitOnboarding}
        onSubmit={submitPasswordChange}
      />

      <GaVerifyModal
        visible={pending?.next_step === 'verify_two_factor'}
        loading={gaLoading}
        errorTick={gaErrorTick}
        onCancel={exitOnboarding}
        onOk={submitVerify}
      />

      <GaBindModal
        visible={bindVisible}
        loading={gaLoading}
        errorTick={gaErrorTick}
        mandatory={forceBind}
        secret={setup?.secret}
        qrUrl={qrUrl}
        onCancel={exitOnboarding}
        onOk={submitBind}
      />
    </div>
  );
}
