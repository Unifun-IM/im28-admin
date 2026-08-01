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
