import React from 'react';
import { Input, type InputProps } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import useLocale from '@shared/lib/useLocale';
import { useFilterSearch } from './FilterSearchContext';

export type FilterInputProps = InputProps & {
  /** 右侧搜索图标，默认展示 */
  showSearchIcon?: boolean;
};

/**
 * 筛选区普通输入框 — Arco Input + 筛选默认项
 * 开启搜索图标时：回车 / 点图标触发筛选区 onSearch
 */
export default function FilterInput({
  allowClear = true,
  placeholder,
  showSearchIcon = false,
  suffix,
  onPressEnter,
  ...rest
}: FilterInputProps) {
  const t = useLocale();
  const { onSearch } = useFilterSearch();
  const triggerSearch = () => {
    onSearch?.();
  };

  return (
    <Input
      allowClear={allowClear}
      placeholder={placeholder ?? t['common.placeholder']}
      suffix={
        suffix ??
        (showSearchIcon ? (
          <IconSearch
            className="use-biz-filter-search-icon"
            onClick={triggerSearch}
          />
        ) : undefined)
      }
      onPressEnter={
        showSearchIcon
          ? (e) => {
              onPressEnter?.(e);
              triggerSearch();
            }
          : onPressEnter
      }
      {...rest}
    />
  );
}
