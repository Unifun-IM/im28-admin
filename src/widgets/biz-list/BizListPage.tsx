import React from 'react';
import {
  Card,
  Space,
  Table,
  type FormInstance,
  type TableProps
} from '@arco-design/web-react';
import cs from 'classnames';

import DataSummary, { type SummaryItem } from './DataSummary';
import SearchFilterBar from './SearchFilterBar';
import styles from './style/index.module.less';

export type BizListPageProps<T = Record<string, unknown>> = {
  form?: FormInstance;
  filter?: React.ReactNode;
  onSearch?: () => void;
  onReset?: () => void;
  summary?: SummaryItem[];
  toolbar?: React.ReactNode;
  tableProps: TableProps<T>;
  className?: string;
};

/** 标准业务列表：筛选 → 汇总 → 工具栏 → 表格 */
export default function BizListPage<T extends Record<string, unknown>>({
  form,
  filter,
  onSearch,
  onReset,
  summary,
  toolbar,
  tableProps,
  className
}: BizListPageProps<T>) {
  return (
    <div className={cs(styles.bizListPage, className)}>
      {filter && (
        <Card className={styles.sectionCard} bordered={false}>
          <SearchFilterBar form={form} onSearch={onSearch} onReset={onReset}>
            {filter}
          </SearchFilterBar>
        </Card>
      )}
      {summary && summary.length > 0 && (
        <Card className={styles.sectionCard} bordered={false}>
          <DataSummary items={summary} />
        </Card>
      )}
      <Card className={styles.sectionCard} bordered={false}>
        {toolbar && (
          <div className={styles.toolbar}>
            <Space>{toolbar}</Space>
          </div>
        )}
        <Table
          rowKey="id"
          border={false}
          pagination={{
            showTotal: true,
            sizeCanChange: true,
            ...(typeof tableProps.pagination === 'object' ? tableProps.pagination : {})
          }}
          {...tableProps}
        />
      </Card>
    </div>
  );
}
