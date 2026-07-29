import {
  Form,
  Input,
  Button,
  Message
} from '@arco-design/web-react';
import { FormInstance } from '@arco-design/web-react/es/Form';
import { IconLock, IconUser } from '@arco-design/web-react/icon';
import React, { useRef, useState } from 'react';

import { setAccessToken } from '@shared/api/request';
import { postApiUserLogin } from '@shared/api/user';
import useLocale from '@shared/lib/useLocale';

import GaBindModal from './GaBindModal';
import GaVerifyModal from './GaVerifyModal';
import SlideCaptcha from './SlideCaptcha';
import locale from './locale';

type PendingLogin = {
  params: API.LoginRequest;
  accessToken?: string;
  gaBound: boolean;
};

/**
 * 登录表单 — Figma 602:35197 / 602:35261 / 602:35325
 * 含滑块、GA 验证/绑定弹窗与 Message 文案
 */
export default function LoginForm() {
  const formRef = useRef<FormInstance>();
  const [loading, setLoading] = useState(false);
  const [gaLoading, setGaLoading] = useState(false);
  const [sliderOk, setSliderOk] = useState(false);
  const [pending, setPending] = useState<PendingLogin | null>(null);
  const [gaMode, setGaMode] = useState<'verify' | 'bind' | null>(null);

  const t = useLocale(locale);

  function finishLogin(accessToken?: string) {
    localStorage.setItem('userStatus', 'login');
    setAccessToken(accessToken || 'mock-admin-token');
    Message.success(t['login.msg.loginSuccess']);
    window.setTimeout(() => {
      window.location.href = '/user/query';
    }, 400);
  }

  async function login(params: API.LoginRequest) {
    setLoading(true);
    try {
      const res = await postApiUserLogin(params);
      if (res.status === 'ok') {
        const gaBound = res.ga_bound !== false;
        setPending({
          params,
          accessToken: res.access_token,
          gaBound
        });
        setGaMode(gaBound ? 'verify' : 'bind');
      } else {
        Message.error(res.msg || t['login.form.login.errMsg']);
        setSliderOk(false);
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
      login(values as API.LoginRequest);
    });
  }

  function closeGa() {
    setGaMode(null);
    setPending(null);
    setSliderOk(false);
  }

  function submitGa(code: string) {
    if (!pending) return;
    setGaLoading(true);
    // Mock：任意 6 位通过；`000000` 模拟 GA 错误锁定
    window.setTimeout(() => {
      setGaLoading(false);
      if (code === '000000') {
        Message.error(t['login.msg.gaLocked']);
        return;
      }
      if (code === '111111') {
        Message.error(t['login.msg.gaErr']);
        return;
      }
      setGaMode(null);
      finishLogin(pending.accessToken);
    }, 300);
  }

  return (
    <div className="flex w-full flex-col gap-[24px]">
      <div>
        <div className="text-[36px] font-bold leading-[44px] text-arco-text-1">
          {t['login.form.title']}
        </div>
        <div className="text-[12px] leading-[18px] text-arco-text-3">
          {t['login.form.subTitle']}
        </div>
      </div>

      <Form
        className="use-login-form"
        layout="vertical"
        ref={formRef}
        initialValues={{ userName: 'admin', password: 'admin' }}
        requiredSymbol={false}
      >
        <div className="flex flex-col gap-[16px]">
          <Form.Item
            field="userName"
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
        visible={gaMode === 'verify'}
        loading={gaLoading}
        onCancel={closeGa}
        onOk={submitGa}
      />
      <GaBindModal
        visible={gaMode === 'bind'}
        loading={gaLoading}
        onCancel={closeGa}
        onOk={submitGa}
      />
    </div>
  );
}
