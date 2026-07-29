import React, { useState } from 'react';
import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Grid,
  Space,
  type FormInstance
} from '@arco-design/web-react';
import { IconDown, IconUp } from '@arco-design/web-react/icon';
import cs from 'classnames';

const { Row, Col } = Grid;

/** 对齐 Arco Pro 列表筛选：单列 span=8（一行约 3 项），宽字段 span=12 */
const FIELD_COL_SPAN = {
  1: 8,
  2: 12
} as const;

export type FilterFieldProps = {
  children: React.ReactNode;
  /** 1 → Col span=8；2 → span=12（时间区间等） */
  span?: 1 | 2;
  className?: string;
};

/** 筛选项：Arco Grid.Col + Form.Item（Pro 列表页标准） */
export function FilterField({ children, span = 1, className }: FilterFieldProps) {
  return (
    <Col
      className={cs('use-biz-filter-field', className)}
      span={FIELD_COL_SPAN[span]}
      data-filter-field="true"
      data-span={span}
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

export const bizFilterSelectProps = {
  dropdownMenuClassName: 'use-biz-filter-dropdown'
} as const;

export type SearchFilterBarProps = {
  children: React.ReactNode;
  form?: FormInstance;
  onSearch?: () => void;
  onReset?: () => void;
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
 * 搜索筛选 — Arco Design Pro 标准：
 * Card + Form(layout=vertical) + Grid.Row/Col + Space
 * 视觉 token（填充控件、标签字号等）用 use-biz-filter-bar 补齐
 */
export default function SearchFilterBar({
  children,
  form,
  onSearch,
  onReset,
  collapsible = true,
  collapsedCount = 4,
  defaultCollapsed = true,
  searchText = '查询',
  resetText = '清除全部',
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
          <Row className="use-biz-filter-fields" gutter={[16, 12]} align="end">
            {visibleChildren.map((child, index) => {
              const key = child.key ?? index;
              if (isFilterFieldElement(child)) {
                return React.cloneElement(child, { key });
              }
              return <FilterField key={key}>{child}</FilterField>;
            })}
            <Col className="use-biz-filter-actions" flex="auto">
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
      </ConfigProvider>
    </Card>
  );
}
