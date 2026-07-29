import React, { useState } from 'react';
import { Button, Form, Grid, Space, type FormInstance } from '@arco-design/web-react';
import { IconDown, IconUp } from '@arco-design/web-react/icon';
import cs from 'classnames';

import styles from './style/index.module.less';

const { Row, Col } = Grid;

export type SearchFilterBarProps = {
  children: React.ReactNode;
  form?: FormInstance;
  onSearch?: () => void;
  onReset?: () => void;
  /** 超过一行时展示展开/收起，默认 true */
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  searchText?: string;
  resetText?: string;
  expandText?: string;
  collapseText?: string;
  className?: string;
};

/** Figma 搜索筛选区域：单行 / 多行展开 */
export default function SearchFilterBar({
  children,
  form,
  onSearch,
  onReset,
  collapsible = true,
  defaultCollapsed = true,
  searchText = '查询',
  resetText = '重置',
  expandText = '展开',
  collapseText = '收起',
  className
}: SearchFilterBarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const childArray = React.Children.toArray(children);
  const showToggle = collapsible && childArray.length > 3;
  const visibleChildren =
    showToggle && collapsed ? childArray.slice(0, 3) : childArray;

  return (
    <div className={cs(styles.filterBar, className)}>
      <Form form={form} layout="inline" labelAlign="left">
        <Row gutter={16} style={{ width: '100%' }} align="center">
          {visibleChildren.map((child, index) => (
            <Col key={index} xs={24} sm={12} md={8} lg={6}>
              {child}
            </Col>
          ))}
          <Col flex="auto" style={{ textAlign: 'right', marginBottom: 16 }}>
            <Space>
              {showToggle && (
                <Button
                  type="text"
                  onClick={() => setCollapsed((v) => !v)}
                  icon={collapsed ? <IconDown /> : <IconUp />}
                >
                  {collapsed ? expandText : collapseText}
                </Button>
              )}
              <Button onClick={onReset}>{resetText}</Button>
              <Button type="primary" onClick={onSearch}>
                {searchText}
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
