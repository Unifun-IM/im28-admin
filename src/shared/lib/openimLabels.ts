import openimLocale from '@shared/locale/openim';

/** 从 locale 取 OpenIM 对齐枚举文案，缺省回退原值或 `--` */
export function openimLabel(
  t: Record<string, string>,
  ns: string,
  value: string | number | undefined | null,
  fallback = '--'
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const key = `openim.${ns}.${value}`;
  return t[key] ?? String(value);
}

/** 当前 UI 语言对应的 openim 文案包（非 React 场景读 arco-lang） */
export function resolveOpenimLocale(lang?: string): Record<string, string> {
  const key =
    lang ||
    (typeof localStorage !== 'undefined'
      ? localStorage.getItem('arco-lang') || 'zh-CN'
      : 'zh-CN');
  const pack = openimLocale as Record<string, Record<string, string>>;
  return pack[key] || pack['zh-CN'] || {};
}

/** openim.msg / openim.event 文案；支持 `{name}` 占位 */
export function openimMsg(
  t: Record<string, string> | undefined,
  key: string,
  fallback: string,
  vars?: Record<string, string | number>
): string {
  const dict = t || resolveOpenimLocale();
  let text =
    dict[`openim.msg.${key}`] || dict[`openim.event.${key}`] || fallback;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return text;
}
