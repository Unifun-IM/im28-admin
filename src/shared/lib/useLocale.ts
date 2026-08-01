import { useContext, useMemo } from 'react';

import { GlobalContext } from '@shared/lib/global-context';
import defaultLocale from '@shared/locale';

type LocalePack = Record<string, Record<string, string>>;

/**
 * 读取文案。默认使用 `@shared/locale` 合并包（共用 + 各业务）。
 * 仍可传入局部 pack 做覆盖（测试 / 特例）。
 */
function useLocale(locale: LocalePack | null = null) {
  const { lang } = useContext(GlobalContext);
  const localeKey = lang || 'zh-CN';

  return useMemo(() => {
    const shared =
      (defaultLocale as LocalePack)[localeKey] ||
      (defaultLocale as LocalePack)['zh-CN'] ||
      {};
    if (!locale) return shared;
    const override = locale[localeKey] || locale['zh-CN'] || {};
    return { ...shared, ...override };
  }, [locale, localeKey]);
}

export default useLocale;
