import React, { useMemo } from 'react';
import {
  Checkbox,
  Select,
  Space,
  type SelectProps
} from '@arco-design/web-react';
import cs from 'classnames';

import { bizFilterSelectProps } from './SearchFilterBar';

function getOptionValues(
  options: SelectProps['options']
): (string | number)[] {
  if (!options?.length) return [];
  return options
    .map((opt) => {
      if (opt == null || typeof opt !== 'object') return opt as string | number;
      return (opt as { value?: string | number }).value as string | number;
    })
    .filter((v) => v !== undefined && v !== null);
}

/**
 * 筛选区 Select — 基于 Arco Select；多选补全选 / 清除（Figma 602:35116）
 */
export default function FilterSelect(props: SelectProps) {
  const {
    mode,
    options,
    value,
    defaultValue,
    onChange,
    dropdownRender,
    showSearch,
    allowClear,
    className,
    ...rest
  } = props;

  const isMultiple = mode === 'multiple' || mode === 'tags';
  const allValues = useMemo(() => getOptionValues(options), [options]);

  const selectedValues = useMemo(() => {
    const raw = value ?? defaultValue;
    if (raw == null) return [] as (string | number)[];
    return (Array.isArray(raw) ? raw : [raw]) as (string | number)[];
  }, [value, defaultValue]);

  const allSelected =
    isMultiple &&
    allValues.length > 0 &&
    allValues.every((v) => selectedValues.includes(v));
  const someSelected =
    isMultiple && selectedValues.length > 0 && !allSelected;

  const handleSelectAll = () => {
    if (!isMultiple) return;
    onChange?.((allSelected ? [] : allValues) as never, {} as never);
  };

  const handleClear = () => {
    if (!selectedValues.length) return;
    onChange?.((isMultiple ? [] : undefined) as never, {} as never);
  };

  const renderDropdown: SelectProps['dropdownRender'] = (menu) => {
    const body = (
      <>
        {isMultiple && allValues.length > 0 && (
          <div
            className="use-biz-filter-select-all"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleSelectAll}
          >
            <Space size={4}>
              <Checkbox checked={allSelected} indeterminate={someSelected} />
              <span>全选</span>
            </Space>
          </div>
        )}
        {menu}
        {isMultiple && (
          <div
            className={cs(
              'use-biz-filter-select-clear',
              selectedValues.length === 0 && 'is-disabled'
            )}
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClear}
          >
            清除
          </div>
        )}
      </>
    );
    return dropdownRender ? dropdownRender(body) : body;
  };

  return (
    <Select
      {...bizFilterSelectProps}
      {...rest}
      mode={mode}
      options={options}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      allowClear={allowClear}
      showSearch={showSearch ?? isMultiple}
      dropdownRender={renderDropdown}
      className={className}
    />
  );
}
