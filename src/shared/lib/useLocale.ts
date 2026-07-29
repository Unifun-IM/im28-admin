import { useContext } from 'react';

import { GlobalContext } from '@shared/lib/global-context';
import defaultLocale from '@shared/locale';

function useLocale(locale = null) {
  const { lang } = useContext(GlobalContext);
  const pack = (locale || defaultLocale) as Record<string, Record<string, string>>;
  return pack[lang || 'zh-CN'] || pack['zh-CN'] || {};
}

export default useLocale;
