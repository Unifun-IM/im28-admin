import React from 'react';
import {
  Form,
  Input,
  type InputProps,
  type SelectProps
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import FilterSelect from './FilterSelect';

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
 * 超出 Arco 单控件能力，故抽成业务组件；前缀下拉复用 FilterSelect 样式
 */
export default function FilterKeywordInput({
  typeField,
  typeOptions,
  typeInitialValue,
  typeWidth = 80,
  allowClear = true,
  placeholder = '请输入',
  suffix,
  ...rest
}: FilterKeywordInputProps) {
  return (
    <Input
      allowClear={allowClear}
      placeholder={placeholder}
      addBefore={
        <Form.Item
          field={typeField}
          noStyle
          initialValue={typeInitialValue ?? firstOptionValue(typeOptions)}
        >
          <FilterSelect options={typeOptions} style={{ width: typeWidth }} />
        </Form.Item>
      }
      suffix={suffix ?? <IconSearch className="text-arco-text-3" />}
      {...rest}
    />
  );
}
