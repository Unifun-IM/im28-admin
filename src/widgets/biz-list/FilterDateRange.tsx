import React from 'react';
import {
  DatePicker,
  type RangePickerProps
} from '@arco-design/web-react';
import useLocale from '@shared/lib/useLocale';

export type FilterDateRangeProps = RangePickerProps;

/**
 * 筛选区日期时间区间 — Arco RangePicker，默认撑满字段宽
 */
export default function FilterDateRange({
  style,
  placeholder,
  allowClear = true,
  ...rest
}: FilterDateRangeProps) {
  const t = useLocale();
  return (
    <DatePicker.RangePicker
      allowClear={allowClear}
      placeholder={
        placeholder ?? [t['common.dateStart'], t['common.dateEnd']]
      }
      style={{ width: '100%', ...style }}
      {...rest}
    />
  );
}
