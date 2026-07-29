import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Space,
  Table,
  Tooltip,
  type FormInstance,
  type TableProps
} from '@arco-design/web-react';
import { IconRefresh, IconSettings } from '@arco-design/web-react/icon';
import cs from 'classnames';

import DataSummary, { type SummaryItem } from './DataSummary';
import SearchFilterBar from './SearchFilterBar';
import TableBatchBar from './TableBatchBar';
import styles from './style/index.module.less';

export type BizListPageProps<T = Record<string, unknown>> = {
  form?: FormInstance;
  filter?: React.ReactNode;
  onSearch?: () => void;
  onReset?: () => void;
  summary?: SummaryItem[];
  /** 表格卡片标题，如「角色列表」 */
  title?: React.ReactNode;
  /** 右侧操作按钮区（不含刷新/列设置） */
  toolbar?: React.ReactNode;
  onRefresh?: () => void;
  showColumnSetting?: boolean;
  onColumnSetting?: () => void;
  /** 批量操作：有选中行时浮出 */
  batchActions?: {
    onArchive?: (keys: (string | number)[]) => void;
    onEdit?: (keys: (string | number)[]) => void;
    onDelete?: (keys: (string | number)[]) => void;
    extra?: React.ReactNode;
  };
  tableProps: TableProps<T>;
  className?: string;
};

/** 标准业务列表：筛选 → 汇总 → 表格（含标题栏 / 批量条） */
export default function BizListPage<T extends Record<string, unknown>>({
  form,
  filter,
  onSearch,
  onReset,
  summary,
  title,
  toolbar,
  onRefresh,
  showColumnSetting,
  onColumnSetting,
  batchActions,
  tableProps,
  className
}: BizListPageProps<T>) {
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const enableColumnSetting = showColumnSetting ?? Boolean(title);

  const selectedRowKeys = (tableProps.rowSelection?.selectedRowKeys ||
    []) as (string | number)[];
  const selectedCount = selectedRowKeys.length;

  const displayData = useMemo(() => {
    const data = (tableProps.data || []) as T[];
    if (!showSelectedOnly || !selectedCount) return data;
    const keySet = new Set(selectedRowKeys.map(String));
    const rowKey = tableProps.rowKey ?? 'id';
    return data.filter((row) => {
      const key =
        typeof rowKey === 'function'
          ? rowKey(row)
          : (row as Record<string, unknown>)[rowKey as string];
      return keySet.has(String(key));
    });
  }, [
    tableProps.data,
    tableProps.rowKey,
    showSelectedOnly,
    selectedCount,
    selectedRowKeys
  ]);

  const pagination =
    tableProps.pagination === false
      ? false
      : {
          showTotal: true,
          sizeCanChange: true,
          sizeOptions: [10, 20, 50, 100],
          ...(typeof tableProps.pagination === 'object' ? tableProps.pagination : {})
        };

  return (
    <div className={cs(styles.bizListPage, className)}>
      {filter && (
        <SearchFilterBar form={form} onSearch={onSearch} onReset={onReset}>
          {filter}
        </SearchFilterBar>
      )}
      {summary && summary.length > 0 && <DataSummary items={summary} />}
      <Card className={cs(styles.sectionCard, styles.tableCard)} bordered={false}>
        {(title || toolbar || onRefresh || enableColumnSetting) && (
          <div className={styles.tableHeader}>
            <div className={styles.tableTitle}>{title}</div>
            <div className={styles.tableToolbar}>
              {(onRefresh || enableColumnSetting) && (
                <div className={styles.tableIconGroup}>
                  {onRefresh && (
                    <Tooltip content="刷新">
                      <Button
                        type="text"
                        className={styles.tableIconBtn}
                        icon={<IconRefresh />}
                        onClick={onRefresh}
                      />
                    </Tooltip>
                  )}
                  {enableColumnSetting && (
                    <Tooltip content="列设置">
                      <Button
                        type="text"
                        className={styles.tableIconBtn}
                        icon={<IconSettings />}
                        onClick={onColumnSetting}
                      />
                    </Tooltip>
                  )}
                </div>
              )}
              {toolbar && <Space size={8}>{toolbar}</Space>}
            </div>
          </div>
        )}
        <div className={styles.tableWrap}>
          <Table
            rowKey="id"
            border={false}
            {...tableProps}
            className={cs(styles.bizTable, tableProps.className)}
            data={displayData}
            pagination={pagination}
          />
          {batchActions && (
            <TableBatchBar
              count={selectedCount}
              showSelectedOnly={showSelectedOnly}
              onShowSelectedOnlyChange={setShowSelectedOnly}
              onArchive={
                batchActions.onArchive
                  ? () => batchActions.onArchive?.(selectedRowKeys)
                  : undefined
              }
              onEdit={
                batchActions.onEdit
                  ? () => batchActions.onEdit?.(selectedRowKeys)
                  : undefined
              }
              onDelete={
                batchActions.onDelete
                  ? () => batchActions.onDelete?.(selectedRowKeys)
                  : undefined
              }
              extra={batchActions.extra}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
