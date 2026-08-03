import React from 'react';
import {
  Form,
  Input,
  type InputProps,
  type SelectProps
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import useLocale from '@shared/lib/useLocale';
import FilterSelect from './FilterSelect';
import { useFilterSearch } from './FilterSearchContext';

function firstOptionValue(
  options: SelectProps['options']
): string | number | undefined {
  const first = options?.[0];
  if (first == null) return undefined;
  if (typeof first === 'object') {
    return (first as { value?: string | number }).value;
  }
  return first as string | number;
}

export type FilterKeywordInputProps = Omit<InputProps, 'addBefore'> & {
  /** 类型字段名，写入同级 Form */
  typeField: string;
  typeOptions: SelectProps['options'];
  typeInitialValue?: string | number;
  /** 前缀 Select 宽度，默认 80 */
  typeWidth?: number | string;
};

/**
 * 关键词搜索：Input + addBefore(类型 Select) + 搜索图标
 * 回车 / 点搜索图标触发筛选区 onSearch（Figma：点击可直接搜索）
 */
export default function FilterKeywordInput({
  typeField,
  typeOptions,
  typeInitialValue,
  typeWidth = 80,
  allowClear = true,
  placeholder,
  suffix,
  onPressEnter,
  ...rest
}: FilterKeywordInputProps) {
  const t = useLocale();
  const { onSearch } = useFilterSearch();

  const triggerSearch = () => {
    onSearch?.();
  };

  return (
    <Input
      allowClear={allowClear}
      placeholder={placeholder ?? t['common.placeholder']}
      addBefore={
        <Form.Item
          field={typeField}
          noStyle
          initialValue={typeInitialValue ?? firstOptionValue(typeOptions)}
        >
          <FilterSelect options={typeOptions} style={{ width: typeWidth }} />
        </Form.Item>
      }
      suffix={
        suffix ?? (
          <IconSearch
            className="use-biz-filter-search-icon"
            onClick={triggerSearch}
          />
        )
      }
      onPressEnter={(e) => {
        onPressEnter?.(e);
        triggerSearch();
      }}
      {...rest}
    />
  );
}
