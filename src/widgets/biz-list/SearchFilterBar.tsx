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

/** 一行 4 个筛选项（24 / 4 = 6），对齐 Arco Design Pro search-table */
export const FILTER_COLS_PER_ROW = 4;
export const FILTER_COL_SPAN = 24 / FILTER_COLS_PER_ROW;

export type FilterFieldProps = {
  children: React.ReactNode;
  /**
   * 占位列数（按「一行 4 格」计）：
   * - 1 | narrow → 1 格（Col span 6）
   * - 2 → 2 格（Col span 12，少用）
   * - full → 通栏（Col span 24）
   * @default 1
   */
  span?: 1 | 2 | 'narrow' | 'full';
  className?: string;
};

function resolveColSpan(span: FilterFieldProps['span'] = 1): number {
  if (span === 'full') return 24;
  if (span === 2) return FILTER_COL_SPAN * 2;
  return FILTER_COL_SPAN;
}

/** 操作区占满当前行剩余栅格（Pro search-table 惯例） */
function resolveActionsSpan(fieldSpans: number[]): number {
  const usedInLastRow =
    fieldSpans.reduce((sum, s) => sum + s, 0) % 24;
  return usedInLastRow === 0 ? 24 : 24 - usedInLastRow;
}

/** 筛选项：薄封装 Grid.Col；默认一行四个 */
export function FilterField({
  children,
  span = 1,
  className
}: FilterFieldProps) {
  return (
    <Col
      className={cs('use-biz-filter-field', className)}
      data-filter-field="true"
      data-span={span === 'full' ? 'full' : span === 2 ? '2' : '1'}
      span={resolveColSpan(span)}
      xs={24}
      sm={span === 'full' ? 24 : 12}
      md={resolveColSpan(span)}
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

function getChildColSpan(child: React.ReactElement): number {
  if (isFilterFieldElement(child)) {
    return resolveColSpan(
      (child.props as FilterFieldProps).span
    );
  }
  return FILTER_COL_SPAN;
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
 * 搜索筛选 — 对齐 Arco Design Pro search-table：
 * Card + Form(vertical) + Grid.Row(gutter=[24, 16]) + Col span=6（一行四个）
 * 操作按钮占满行末剩余栅格并右对齐
 */
export default function SearchFilterBar({
  children,
  form,
  onSearch,
  onReset,
  extraActions,
  collapsible = true,
  collapsedCount = FILTER_COLS_PER_ROW,
  defaultCollapsed = true,
  searchText = '查询',
  resetText = '重置',
  expandText = '展开',
  collapseText = '收起',
  className
}: SearchFilterBarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const childArray = flattenFilterChildren(children);
  const showToggle = collapsible && childArray.length > collapsedCount;
  const visibleChildren =
    showToggle && collapsed ? childArray.slice(0, collapsedCount) : childArray;

  const fieldSpans = visibleChildren.map(getChildColSpan);
  const actionsSpan = resolveActionsSpan(fieldSpans);

  return (
    <Card
      bordered={false}
      className={cs('use-biz-filter-bar', className)}
      bodyStyle={{ padding: 12 }}
    >
      <Form form={form} layout="vertical" requiredSymbol={false} size="default">
        {/* Pro：横向 24 / 上下行 16 */}
        <Row gutter={[24, 16]}>
          {visibleChildren.map((child, index) => {
            const key = child.key ?? index;
            if (isFilterFieldElement(child)) {
              return React.cloneElement(child, { key });
            }
            return <FilterField key={key}>{child}</FilterField>;
          })}
          <Col
            className="use-biz-filter-actions"
            span={actionsSpan}
            xs={24}
            sm={actionsSpan === 24 ? 24 : Math.max(actionsSpan, 12)}
            md={actionsSpan}
          >
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
