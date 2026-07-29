import React, { useState } from 'react';
import { Button, Grid, Statistic } from '@arco-design/web-react';
import { IconDown, IconUp } from '@arco-design/web-react/icon';
import cs from 'classnames';

import styles from './style/index.module.less';

const { Row, Col } = Grid;

export type SummaryItem = {
  label: string;
  value: string | number;
  suffix?: string;
};

export type DataSummaryProps = {
  items: SummaryItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
};

/** Figma 数据汇总区域 */
export default function DataSummary({
  items,
  collapsible = true,
  defaultCollapsed = false,
  className
}: DataSummaryProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  if (!items.length) return null;

  return (
    <div className={cs(styles.summary, className)}>
      <div className={styles.summaryHeader}>
        <span className={styles.summaryTitle}>数据汇总</span>
        {collapsible && (
          <Button
            type="text"
            size="mini"
            icon={collapsed ? <IconDown /> : <IconUp />}
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? '展开' : '收起'}
          </Button>
        )}
      </div>
      {!collapsed && (
        <Row gutter={16}>
          {items.map((item) => (
            <Col key={item.label} xs={12} sm={8} md={6} lg={4}>
              <div className={styles.summaryCard}>
                <Statistic title={item.label} value={item.value} suffix={item.suffix} />
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
