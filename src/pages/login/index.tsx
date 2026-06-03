import { PasswordLoginForm } from '@features/password-login';
import { Card, Typography } from '@shared/ui';

export function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-visual" aria-label="Arco Design Pro">
        <div className="login-brand-mark">IM</div>
        <Typography.Title heading={2} style={{ margin: 0 }}>
          im-admin
        </Typography.Title>
        <Typography.Text className="login-brand-subtitle">
          Arco Design Pro
        </Typography.Text>
      </section>
      <Card className="login-card">
        <Typography.Title heading={3} style={{ marginTop: 0 }}>
          登录
        </Typography.Title>
        <Typography.Text className="login-card-subtitle" type="secondary">
          管理后台工作台入口
        </Typography.Text>
        <PasswordLoginForm />
      </Card>
    </main>
  );
}
