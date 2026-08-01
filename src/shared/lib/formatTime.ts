import dayjs from 'dayjs';

/** 默认展示格式：YYYY-MM-DD HH:mm:ss */
export const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/** 仅日期 */
export const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * 将 RFC3339 / ISO 时间格式化为可读字符串。
 * 空值或非法时间返回 fallback（默认 `--`）。
 */
export function formatDateTime(
  value?: string | number | Date | null,
  format: string = DATE_TIME_FORMAT,
  fallback = '--'
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const d = dayjs(value);
  return d.isValid() ? d.format(format) : fallback;
}

/** 仅日期部分 */
export function formatDate(
  value?: string | number | Date | null,
  fallback = '--'
): string {
  return formatDateTime(value, DATE_FORMAT, fallback);
}
