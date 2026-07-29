import {
  Form,
  Input,
  Checkbox,
  Link,
  Button,
  Space,
  Slider,
  Message
} from '@arco-design/web-react';
import { FormInstance } from '@arco-design/web-react/es/Form';
import { IconLock, IconUser } from '@arco-design/web-react/icon';
import React, { useEffect, useRef, useState } from 'react';

import { setAccessToken } from '@shared/api/request';
import { postApiUserLogin } from '@shared/api/user';
import useLocale from '@shared/lib/useLocale';
import useStorage from '@shared/lib/useStorage';

import locale from './locale';

export default function LoginForm() {
  const formRef = useRef<FormInstance>();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [loginParams, setLoginParams, removeLoginParams] = useStorage('loginParams');

  const t = useLocale(locale);
  const [rememberPassword, setRememberPassword] = useState(!!loginParams);

  function afterLoginSuccess(params: API.LoginRequest, accessToken?: string) {
    if (rememberPassword) {
      setLoginParams(JSON.stringify(params));
    } else {
      removeLoginParams();
    }
    localStorage.setItem('userStatus', 'login');
    setAccessToken(accessToken || 'mock-admin-token');
    window.location.href = '/user/query';
  }

  async function login(params: API.LoginRequest) {
    setErrorMessage('');
    setLoading(true);
    try {
      const res = await postApiUserLogin(params);
      if (res.status === 'ok') {
        afterLoginSuccess(params, res.access_token);
      } else {
        setErrorMessage(res.msg || t['login.form.login.errMsg']);
      }
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : t['login.form.login.errMsg'];
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  function onSubmitClick() {
    if (sliderValue < 100) {
      Message.warning(t['login.form.slider']);
      return;
    }
    formRef.current?.validate().then((values) => {
      login(values as API.LoginRequest);
    });
  }

  useEffect(() => {
    const remembered = !!loginParams;
    setRememberPassword(remembered);
    if (formRef.current && remembered) {
      const parseParams = JSON.parse(loginParams);
      formRef.current.setFieldsValue(parseParams);
    }
  }, [loginParams]);

  return (
    <div className="w-full">
      <div className="text-[36px] font-bold leading-[44px] text-[#1d2129]">
        {t['login.form.title']}
      </div>
      <div className="mt-1 text-xs leading-[18px] text-[#86909c]">
        {t['login.form.subTitle']}
      </div>
      <div className="h-8 leading-8 text-[rgb(var(--red-6))]">{errorMessage}</div>
      <Form
        className="use-login-form"
        layout="vertical"
        ref={formRef}
        initialValues={{ userName: 'admin', password: 'admin' }}
      >
        <Form.Item
          field="userName"
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
          rules={[{ required: true, message: t['login.form.password.errMsg'] }]}
        >
          <Input.Password
            prefix={<IconLock />}
            placeholder={t['login.form.password.placeholder']}
            onPressEnter={onSubmitClick}
          />
        </Form.Item>
        <Form.Item>
          <div style={{ marginBottom: 8, color: 'var(--color-text-3)', fontSize: 12 }}>
            {t['login.form.slider']}
          </div>
          <Slider
            value={sliderValue}
            onChange={(v) => setSliderValue(Number(v))}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Space size={16} direction="vertical" style={{ width: '100%' }}>
          <div className="flex justify-between">
            <Checkbox checked={rememberPassword} onChange={setRememberPassword}>
              {t['login.form.rememberPassword']}
            </Checkbox>
            <Link>{t['login.form.forgetPassword']}</Link>
          </div>
          <Button type="primary" long onClick={onSubmitClick} loading={loading}>
            {t['login.form.login']}
          </Button>
        </Space>
      </Form>
    </div>
  );
}
