import React from 'react';
import { Button, Result } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import useLocale from '@shared/lib/useLocale';
import styles from './style/index.module.less';

/**
 * 404 — 对齐 Arco Design Pro exception/404
 * https://github.com/arco-design/arco-design-pro
 */
function Exception404() {
  const t = useLocale();
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <Result
        className={styles.result}
        status="404"
        subTitle={t['exception.result.404.description']}
        extra={[
          <Button
            key="again"
            style={{ marginRight: 16 }}
            onClick={() => navigate(0)}
          >
            {t['exception.result.404.retry']}
          </Button>,
          <Button
            key="back"
            type="primary"
            onClick={() => navigate(-1)}
          >
            {t['exception.result.404.back']}
          </Button>
        ]}
      />
    </div>
  );
}

export default Exception404;
