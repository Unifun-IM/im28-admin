import React, { useMemo, useState } from 'react';
import {
  Checkbox,
  Input,
  Select,
  type SelectProps
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import cs from 'classnames';

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

function getOptionLabel(opt: NonNullable<SelectProps['options']>[number]): string {
  if (opt == null || typeof opt !== 'object') return String(opt ?? '');
  return String(
    (opt as { label?: React.ReactNode }).label ??
      (opt as { value?: string | number }).value ??
      ''
  );
}

/**
 * 筛选区下拉单选 — Arco Select。
 * 多选请用 FilterMultiSelect（或传 mode="multiple"）：下拉内搜索 / 全选 / 清除。
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
    onVisibleChange,
    ...rest
  } = props;

  const isMultiple = mode === 'multiple' || mode === 'tags';
  const [keyword, setKeyword] = useState('');

  const filteredOptions = useMemo(() => {
    if (!isMultiple || !keyword.trim() || !options?.length) return options;
    const q = keyword.trim().toLowerCase();
    return options.filter((opt) => getOptionLabel(opt).toLowerCase().includes(q));
  }, [isMultiple, keyword, options]);

  const selectedValues = useMemo(() => {
    const raw = value ?? defaultValue;
    if (raw == null) return [] as (string | number)[];
    return (Array.isArray(raw) ? raw : [raw]) as (string | number)[];
  }, [value, defaultValue]);

  const visibleValues = useMemo(
    () => getOptionValues(filteredOptions),
    [filteredOptions]
  );

  const allSelected =
    isMultiple &&
    visibleValues.length > 0 &&
    visibleValues.every((v) => selectedValues.includes(v));
  const someSelected =
    isMultiple &&
    visibleValues.some((v) => selectedValues.includes(v)) &&
    !allSelected;

  const handleSelectAll = () => {
    if (!isMultiple) return;
    if (allSelected) {
      const next = selectedValues.filter((v) => !visibleValues.includes(v));
      onChange?.(next as never, {} as never);
      return;
    }
    const merged = Array.from(new Set([...selectedValues, ...visibleValues]));
    onChange?.(merged as never, {} as never);
  };

  const handleClear = () => {
    if (!selectedValues.length) return;
    onChange?.((isMultiple ? [] : undefined) as never, {} as never);
  };

  const handleVisibleChange = (visible: boolean) => {
    if (!visible) setKeyword('');
    onVisibleChange?.(visible);
  };

  const renderDropdown: SelectProps['dropdownRender'] = (menu) => {
    const body = (
      <div className="use-biz-filter-dropdown">
        {isMultiple && (
          <Input
            className="use-biz-filter-dropdown-search"
            allowClear
            size="small"
            value={keyword}
            placeholder="搜索"
            prefix={<IconSearch />}
            onChange={setKeyword}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {isMultiple && visibleValues.length > 0 && (
          <div
            className="use-biz-filter-select-all"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleSelectAll}
          >
            <Checkbox checked={allSelected} indeterminate={someSelected} />
            <span>全选</span>
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
      </div>
    );
    return dropdownRender ? dropdownRender(body) : body;
  };

  return (
    <Select
      {...rest}
      mode={mode}
      options={isMultiple ? filteredOptions : options}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      allowClear={allowClear}
      /* 多选搜索放在下拉内，与稿面一致 */
      showSearch={isMultiple ? false : (showSearch ?? false)}
      onVisibleChange={handleVisibleChange}
      dropdownRender={renderDropdown}
      className={className}
    />
  );
}
