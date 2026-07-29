import React, { useState } from 'react';
import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Space,
  type FormInstance
} from '@arco-design/web-react';
import { IconDown, IconUp } from '@arco-design/web-react/icon';
import cs from 'classnames';

/**
 * 对齐 Figma 602:35072：
 * - 窄字段 224 / 宽字段 456（=224×2+8）/ 通栏 full
 * - 容器 flex-wrap + gap 8
 */
export type FilterFieldProps = {
  children: React.ReactNode;
  /**
   * 1 | narrow → 224px；
   * 2 → 456px（时间区间等）；
   * full → 通栏
   */
  span?: 1 | 2 | 'narrow' | 'full';
  className?: string;
};

/** 筛选项：固定宽字段，由外层 flex-wrap 排布 */
export function FilterField({ children, span = 1, className }: FilterFieldProps) {
  const dataSpan =
    span === 'full' ? 'full' : span === 2 ? '2' : '1';
  return (
    <div
      className={cs('use-biz-filter-field', className)}
      data-filter-field="true"
      data-span={dataSpan}
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

/** 展开 Fragment，避免 `<>` 被当成单个 child */
function flattenFilterChildren(children: React.ReactNode): React.ReactElement[] {
  const out: React.ReactElement[] = [];
  React.Children.forEach(children, (child) => {
    if (child == null || typeof child === 'boolean') return;
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      out.push(
        ...flattenFilterChildren(
          (child.props as { children?: React.ReactNode }).children
        )
      );
      return;
    }
    out.push(child);
  });
  return out;
}

export const bizFilterSelectProps = {
  // 面板样式由 dropdownRender 包裹的 .use-biz-filter-dropdown 驱动
} as const;

export type SearchFilterBarProps = {
  children: React.ReactNode;
  form?: FormInstance;
  onSearch?: () => void;
  onReset?: () => void;
  /** 重置左侧的额外操作（如「批量搜索」「取消批量搜索」） */
  extraActions?: React.ReactNode;
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
 * 搜索筛选 — Figma 602:35071 / 602:35072
 * Card + Form(vertical) + flex-wrap gap-8；视觉 token 用 use-biz-filter-bar
 */
export default function SearchFilterBar({
  children,
  form,
  onSearch,
  onReset,
  extraActions,
  collapsible = true,
  collapsedCount = 4,
  defaultCollapsed = true,
  searchText = '查询',
  resetText = '重置',
  expandText = '展开筛选',
  collapseText = '收起筛选',
  className
}: SearchFilterBarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const childArray = flattenFilterChildren(children);
  const showToggle = collapsible && childArray.length > collapsedCount;
  const visibleChildren =
    showToggle && collapsed ? childArray.slice(0, collapsedCount) : childArray;

  return (
    <Card
      bordered={false}
      className={cs('use-biz-filter-bar', className)}
      bodyStyle={{ padding: 12 }}
    >
      <ConfigProvider
        componentConfig={{
          Select: { ...bizFilterSelectProps }
        }}
      >
        <Form form={form} layout="vertical" requiredSymbol={false} size="default">
          <div className="use-biz-filter-fields">
            {visibleChildren.map((child, index) => {
              const key = child.key ?? index;
              if (isFilterFieldElement(child)) {
                return React.cloneElement(child, { key });
              }
              return <FilterField key={key}>{child}</FilterField>;
            })}
            <div className="use-biz-filter-actions">
              <Space size={8}>
                {showToggle && (
                  <Button
                    type="text"
                    className="use-biz-filter-action-text"
                    icon={collapsed ? <IconDown /> : <IconUp />}
                    onClick={() => setCollapsed((v) => !v)}
                  >
                    {collapsed ? expandText : collapseText}
                  </Button>
                )}
                {extraActions}
                <Button
                  type="text"
                  className="use-biz-filter-action-text"
                  onClick={onReset}
                >
                  {resetText}
                </Button>
                <Button
                  type="primary"
                  className="use-biz-filter-action-search"
                  onClick={onSearch}
                >
                  {searchText}
                </Button>
              </Space>
            </div>
          </div>
        </Form>
      </ConfigProvider>
    </Card>
  );
}
