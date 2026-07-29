import React, { useEffect } from 'react';
import Logo from '@shared/assets/logo.svg?react';
import LoginForm from './form';
import styles from './style/index.module.less';

function Login() {
  useEffect(() => {
    document.body.setAttribute('arco-theme', 'light');
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles['banner-brand']}>
          <Logo />
          <span>IM-28 Management</span>
        </div>
        <div className={styles['banner-copy']}>
          <h1>
            Elevate your
            <br />
            communication management
          </h1>
          <p>
            A comprehensive backend to manage accounts, control precise permissions,
            and audit system operations securely.
          </p>
        </div>
        <div className={styles['banner-footer']}>© 2026 NexIM Corp · Privacy Policy</div>
      </div>
      <div className={styles.content}>
        <div className={styles['content-inner']}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
Login.displayName = 'LoginPage';

export default Login;
