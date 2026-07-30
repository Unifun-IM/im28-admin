import React from 'react';
import {
  DatePicker,
  type RangePickerProps
} from '@arco-design/web-react';

export type FilterDateRangeProps = RangePickerProps;

/**
 * 筛选区日期时间区间 — Arco RangePicker，默认撑满字段宽
 */
export default function FilterDateRange({
  style,
  placeholder = ['开始时间', '结束时间'],
  allowClear = true,
  ...rest
}: FilterDateRangeProps) {
  return (
    <DatePicker.RangePicker
      allowClear={allowClear}
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
      {...rest}
    />
  );
}
