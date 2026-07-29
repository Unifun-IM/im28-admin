import Mock from 'mockjs';
import { isSSR } from '@shared/lib/is';

import './user';
import './message-box';
import './biz';

if (!isSSR) {
  Mock.setup({
    timeout: '500-1500',
  });
}
