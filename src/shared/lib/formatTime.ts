import dayjs from 'dayjs';

export type TimeFormatPreference = '12h' | '24h';

/** 24 小时制默认展示 */
export const DATE_TIME_FORMAT_24H = 'YYYY-MM-DD HH:mm:ss';

/** 12 小时制默认展示 */
export const DATE_TIME_FORMAT_12H = 'YYYY-MM-DD hh:mm:ss A';

/** @deprecated 使用 getDateTimeFormat()；保留兼容旧引用 */
export const DATE_TIME_FORMAT = DATE_TIME_FORMAT_24H;

/** 仅日期 */
export const DATE_FORMAT = 'YYYY-MM-DD';

let timeFormatPreference: TimeFormatPreference = '24h';

/** 由应用层或实体层同步全局系统参数中的 time_format。 */
export function setTimeFormatPreference(
  preference: TimeFormatPreference
): void {
  timeFormatPreference = preference;
}

/** 按当前时间格式偏好解析日期时间格式。 */
export function getDateTimeFormat(): string {
  return timeFormatPreference === '12h'
    ? DATE_TIME_FORMAT_12H
    : DATE_TIME_FORMAT_24H;
}

/**
 * 将 RFC3339 / ISO 时间格式化为可读字符串。
 * 未传 format 时跟随当前时间格式偏好（12h / 24h）。
 * 空值或非法时间返回 fallback（默认 `--`）。
 */
export function formatDateTime(
  value?: string | number | Date | null,
  format?: string,
  fallback = '--'
): string {
  if (value === undefined || value === null || value === '') return fallback;
  const d = dayjs(value);
  if (!d.isValid()) return fallback;
  return d.format(format ?? getDateTimeFormat());
}

/** 仅日期部分 */
export function formatDate(
  value?: string | number | Date | null,
  fallback = '--'
): string {
  return formatDateTime(value, DATE_FORMAT, fallback);
}
