import imLocale from '@shared/locale/im';

/** 从 locale 取 IM 对齐枚举文案，缺省回退原值或 `--` */
export function imLabel(
  t: Record<string, string>,
  ns: string,
  value: string | number | undefined | null,
  fallback = '--'
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const key = `im.${ns}.${value}`;
  return t[key] ?? String(value);
}

/** 当前 UI 语言对应的 im 文案包（非 React 场景读 arco-lang） */
export function resolveImLocale(lang?: string): Record<string, string> {
  const key =
    lang ||
    (typeof localStorage !== 'undefined'
      ? localStorage.getItem('arco-lang') || 'zh-CN'
      : 'zh-CN');
  const pack = imLocale as Record<string, Record<string, string>>;
  return pack[key] || pack['zh-CN'] || {};
}

/** im.msg / im.event 文案；支持 `{name}` 占位 */
export function imMsg(
  t: Record<string, string> | undefined,
  key: string,
  fallback: string,
  vars?: Record<string, string | number>
): string {
  const dict = t || resolveImLocale();
  let text =
    dict[`im.msg.${key}`] || dict[`im.event.${key}`] || fallback;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}
