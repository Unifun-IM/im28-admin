import React from 'react';
import type { SelectProps } from '@arco-design/web-react';

import FilterSelect from './FilterSelect';

export type FilterMultiSelectProps = Omit<SelectProps, 'mode'>;

/**
 * 筛选区下拉多选 — FilterSelect + mode=multiple
 *（下拉内搜索 / 全选 / 清除）
 */
export default function FilterMultiSelect(props: FilterMultiSelectProps) {
  return <FilterSelect {...props} mode="multiple" />;
}
