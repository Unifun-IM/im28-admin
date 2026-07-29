import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Space,
  Table,
  Tooltip,
  type FormInstance,
  type TableColumnProps,
  type TableProps
} from '@arco-design/web-react';
import { IconRefresh, IconSettings } from '@arco-design/web-react/icon';
import cs from 'classnames';

import DataSummary, { type SummaryItem } from './DataSummary';
import SearchFilterBar from './SearchFilterBar';
import TableBatchBar from './TableBatchBar';
import {
  normalizeBizColumns,
  resolveBizPagination
} from './tableDefaults';

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

  const hasRowSelection = Boolean(tableProps.rowSelection);
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

  const columns = useMemo(
    () =>
      normalizeBizColumns(
        (tableProps.columns || []) as TableColumnProps<T>[]
      ),
    [tableProps.columns]
  );

  const hasFixedRight = columns.some((col) => col.fixed === 'right');

  const pagination = resolveBizPagination(
    tableProps.pagination as false | undefined | Record<string, unknown>,
    displayData.length
  );

  const scroll = useMemo(() => {
    const incoming = tableProps.scroll || {};
    if (!hasFixedRight) return incoming;
    return {
      x: true as const,
      ...incoming
    };
  }, [hasFixedRight, tableProps.scroll]);

  return (
    <div className={cs('flex flex-col gap-4', className)}>
      {filter && (
        <SearchFilterBar form={form} onSearch={onSearch} onReset={onReset}>
          {filter}
        </SearchFilterBar>
      )}
      {summary && summary.length > 0 && <DataSummary items={summary} />}
      <Card
        className="use-biz-table-card relative overflow-visible !p-0"
        bordered={false}
      >
        {(title ||
          toolbar ||
          onRefresh ||
          enableColumnSetting ||
          hasRowSelection) && (
          <div className="relative box-border flex h-14 items-center justify-between gap-4 px-3 max-md:h-auto max-md:flex-wrap max-md:p-3">
            <div className="flex min-w-0 items-center gap-3">
              {title != null && title !== '' && (
                <div className="text-sm font-medium leading-[21px] text-arco-text-1">
                  {title}
                </div>
              )}
              {/* 无批量条时，标题旁兜底展示已选数量 */}
              {hasRowSelection && !batchActions && selectedCount > 0 && (
                <div className="text-sm leading-[21px] text-arco-text-3">
                  已选{' '}
                  <span className="font-medium text-primary-6">
                    {selectedCount}
                  </span>{' '}
                  项
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {(onRefresh || enableColumnSetting) && (
                <div className="flex items-center gap-2">
                  {onRefresh && (
                    <Tooltip content="刷新">
                      <Button
                        type="text"
                        className="!h-8 !w-8 !rounded !p-0 !text-arco-text-2 hover:!bg-arco-fill-2 hover:!text-arco-text-1"
                        icon={<IconRefresh />}
                        onClick={onRefresh}
                      />
                    </Tooltip>
                  )}
                  {enableColumnSetting && (
                    <Tooltip content="列设置">
                      <Button
                        type="text"
                        className="!h-8 !w-8 !rounded !p-0 !text-arco-text-2 hover:!bg-arco-fill-2 hover:!text-arco-text-1"
                        icon={<IconSettings />}
                        onClick={onColumnSetting}
                      />
                    </Tooltip>
                  )}
                </div>
              )}
              {toolbar && <Space size={8}>{toolbar}</Space>}
            </div>
            {batchActions && (
              <TableBatchBar
                count={selectedCount}
                showSelectedOnly={showSelectedOnly}
                onShowSelectedOnlyChange={setShowSelectedOnly}
                className="pointer-events-auto absolute left-1/2 top-3 z-20 -translate-x-1/2 max-md:static max-md:translate-x-0 max-md:self-center"
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
        )}
        <div className="relative">
          <Table
            rowKey="id"
            border={false}
            {...tableProps}
            className={cs('use-biz-table', tableProps.className)}
            columns={columns}
            data={displayData}
            scroll={scroll}
            pagination={pagination as TableProps<T>['pagination']}
          />
        </div>
      </Card>
    </div>
  );
}
