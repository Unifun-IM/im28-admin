import React, { useState } from 'react';
import { Button, Form, type FormInstance } from '@arco-design/web-react';
import { IconDown, IconUp } from '@arco-design/web-react/icon';
import cs from 'classnames';

import styles from './style/index.module.less';

export type FilterFieldProps = {
  children: React.ReactNode;
  /** 1 = 224px；2 = 456px（时间区间等） */
  span?: 1 | 2;
  className?: string;
};

/** Figma 筛选项容器：标签在上，控件固定宽度 */
export function FilterField({ children, span = 1, className }: FilterFieldProps) {
  return (
    <div
      className={cs(
        styles.filterField,
        span === 2 && styles.filterFieldWide,
        className
      )}
      data-filter-field="true"
      data-span={span}
    >
      {children}
    </div>
  );
}

function isFilterFieldElement(
  child: React.ReactNode
): child is React.ReactElement {
  return (
    React.isValidElement(child) &&
    (child.type === FilterField ||
      (child.props as { 'data-filter-field'?: string })?.['data-filter-field'] ===
        'true')
  );
}

export type SearchFilterBarProps = {
  children: React.ReactNode;
  form?: FormInstance;
  onSearch?: () => void;
  onReset?: () => void;
  /** 字段多于 collapsedCount 时展示展开/收起 */
  collapsible?: boolean;
  collapsedCount?: number;
  defaultCollapsed?: boolean;
  searchText?: string;
  resetText?: string;
  expandText?: string;
  collapseText?: string;
  className?: string;
};

/**
 * Figma 搜索筛选区域（node 602:35071）
 * - 白底描边卡片、12px 内边距、8px 圆角
 * - 标签在上（12px / #4E5969）、与控件间距 8px
 * - 控件填充底 #F7F8FA、高 32、圆角 8
 * - 单列 224px / 时间区间 456px，flex-wrap gap 8
 * - 右侧操作贴底：展开筛选/收起筛选（可选）+ 清除全部 + 查询
 */
export default function SearchFilterBar({
  children,
  form,
  onSearch,
  onReset,
  collapsible = true,
  collapsedCount = 3,
  defaultCollapsed = true,
  searchText = '查询',
  resetText = '清除全部',
  expandText = '展开筛选',
  collapseText = '收起筛选',
  className
}: SearchFilterBarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const childArray = React.Children.toArray(children).filter(Boolean);
  const showToggle = collapsible && childArray.length > collapsedCount;
  const visibleChildren =
    showToggle && collapsed ? childArray.slice(0, collapsedCount) : childArray;

  return (
    <div className={cs(styles.filterBar, className)}>
      <Form form={form} layout="vertical" requiredSymbol={false} size="default">
        <div className={styles.filterRow}>
          {visibleChildren.map((child, index) =>
            isFilterFieldElement(child) ? (
              <React.Fragment key={index}>{child}</React.Fragment>
            ) : (
              <FilterField key={index}>{child}</FilterField>
            )
          )}
          <div className={styles.filterActions}>
            {showToggle && (
              <Button
                type="text"
                className={styles.filterTextBtn}
                onClick={() => setCollapsed((v) => !v)}
              >
                {collapsed ? expandText : collapseText}
                {collapsed ? (
                  <IconDown className={styles.filterToggleIcon} />
                ) : (
                  <IconUp className={styles.filterToggleIcon} />
                )}
              </Button>
            )}
            <Button type="text" className={styles.filterTextBtn} onClick={onReset}>
              {resetText}
            </Button>
            <Button
              type="primary"
              className={styles.filterSearchBtn}
              onClick={onSearch}
            >
              {searchText}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
