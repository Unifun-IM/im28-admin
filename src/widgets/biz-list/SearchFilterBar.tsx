import React, { useState } from 'react';
import {
  Button,
  Card,
  Form,
  Grid,
  Space,
  type FormInstance
} from '@arco-design/web-react';
import { IconDown, IconUp } from '@arco-design/web-react/icon';
import cs from 'classnames';

const { Row, Col } = Grid;

export type FilterFieldProps = {
  children: React.ReactNode;
  /**
   * 1 | narrow → Col span 6（约一行 4 个）；
   * 2 → span 12；
   * full → span 24
   */
  span?: 1 | 2 | 'narrow' | 'full';
  className?: string;
};

function resolveColSpan(span: FilterFieldProps['span'] = 1): number {
  if (span === 'full') return 24;
  if (span === 2) return 12;
  return 6;
}

/** 筛选项：薄封装 Grid.Col；视觉由 .use-biz-filter-bar 补齐 */
export function FilterField({
  children,
  span = 1,
  className
}: FilterFieldProps) {
  return (
    <Col
      className={cs('use-biz-filter-field', className)}
      data-filter-field="true"
      span={resolveColSpan(span)}
    >
      {children}
    </Col>
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
 * 搜索筛选 — Arco 标准：Card + Form(vertical) + Grid + Space
 * 视觉 token：.use-biz-filter-bar
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
      <Form form={form} layout="vertical" requiredSymbol={false} size="default">
        <Row gutter={[16, 16]} align="end">
          {visibleChildren.map((child, index) => {
            const key = child.key ?? index;
            if (isFilterFieldElement(child)) {
              return React.cloneElement(child, { key });
            }
            return <FilterField key={key}>{child}</FilterField>;
          })}
          <Col flex="auto" className="use-biz-filter-actions">
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
          </Col>
        </Row>
      </Form>
    </Card>
  );
}
