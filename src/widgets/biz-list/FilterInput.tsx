import React from 'react';
import { Input, type InputProps } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import useLocale from '@shared/lib/useLocale';

export type FilterInputProps = InputProps & {
  /** 右侧搜索图标，默认展示 */
  showSearchIcon?: boolean;
};

/**
 * 筛选区普通输入框 — Arco Input + 筛选默认项
 */
export default function FilterInput({
  allowClear = true,
  placeholder,
  showSearchIcon = false,
  suffix,
  ...rest
}: FilterInputProps) {
  const t = useLocale();
  return (
    <Input
      allowClear={allowClear}
      placeholder={placeholder ?? t['common.placeholder']}
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
