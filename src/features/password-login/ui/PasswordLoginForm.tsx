import { IconLock, IconUser } from '@arco-design/web-react/icon';

import { Alert, Button, Checkbox, Form, Input, Space } from '@shared/ui';

export function PasswordLoginForm() {
  function onSubmit() {
    return undefined;
  }

  return (
    <Form className="login-form" layout="vertical" onSubmit={onSubmit}>
      <Alert
        className="login-form-alert"
        content="登录接口待接入，当前页面仅完成 Pro 登录界面搭建。"
        type="info"
      />
      <Form.Item
        field="username"
        label="账号"
        rules={[{ required: true, message: '请输入账号' }]}
      >
        <Input
          addBefore={<IconUser />}
          autoComplete="username"
          placeholder="请输入账号"
        />
      </Form.Item>
      <Form.Item
        field="password"
        label="密码"
        rules={[{ required: true, message: '请输入密码' }]}
      >
        <Input.Password
          addBefore={<IconLock />}
          autoComplete="current-password"
          placeholder="请输入密码"
        />
      </Form.Item>
      <div className="login-form-row">
        <Checkbox>记住登录状态</Checkbox>
        <Button type="text">忘记密码</Button>
      </div>
      <Space className="login-form-actions" direction="vertical" size={12}>
        <Button htmlType="submit" long type="primary">
          登录
        </Button>
      </Space>
    </Form>
  );
}
