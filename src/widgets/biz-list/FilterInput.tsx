import React from 'react';
import { Input, type InputProps } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';

export type FilterInputProps = InputProps & {
  /** 右侧搜索图标，默认展示 */
  showSearchIcon?: boolean;
};

/**
 * 筛选区普通输入框 — Arco Input + 筛选默认项
 */
export default function FilterInput({
  allowClear = true,
  placeholder = '请输入',
  showSearchIcon = false,
  suffix,
  ...rest
}: FilterInputProps) {
  return (
    <Input
      allowClear={allowClear}
      placeholder={placeholder}
      suffix={
        suffix ??
        (showSearchIcon ? (
          <IconSearch className="text-arco-text-3" />
        ) : undefined)
      }
      {...rest}
    />
  );
}
