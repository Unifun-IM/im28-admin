import React from 'react';
import { Result, Button } from '@arco-design/web-react';
import locale from './locale';
import useLocale from '@shared/lib/useLocale';

function Exception403() {
  const t = useLocale(locale);

  return (
    <div className="relative h-[calc(100vh-168px)] bg-arco-bg-1">
      <Result
        className="absolute top-1/2 -translate-y-1/2"
        status="403"
        subTitle={t['exception.result.403.description']}
        extra={
          <Button key="back" type="primary">
            {t['exception.result.403.back']}
          </Button>
        }
      />
    </div>
  );
}

export default Exception403;
