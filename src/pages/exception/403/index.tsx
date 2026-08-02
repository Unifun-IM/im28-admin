import React from 'react';
import { Button, Result } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import useLocale from '@shared/lib/useLocale';
import styles from './style/index.module.less';

/**
 * 403 — 对齐 Arco Design Pro exception/403
 * 对接权限后：无访问权限时渲染
 */
function Exception403() {
  const t = useLocale();
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <Result
        className={styles.result}
        status="403"
        subTitle={t['exception.result.403.description']}
        extra={
          <Button key="back" type="primary" onClick={() => navigate(-1)}>
            {t['exception.result.403.back']}
          </Button>
        }
      />
    </div>
  );
}

export default Exception403;
