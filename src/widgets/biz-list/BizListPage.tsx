import React, { useContext, useEffect, useMemo, useState } from 'react';
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
import {
  IconExpand,
  IconRefresh,
  IconShrink
} from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import cs from 'classnames';
import './biz-list.less';

import { pageTabsStore } from '@entities/page-tabs';
import { GlobalContext } from '@shared/lib/global-context';
import useLocale from '@shared/lib/useLocale';
import { EmptyState } from '@shared/ui';
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
  /** 右侧操作按钮区（不含刷新/全屏）；浅色批量条出现时会隐藏 */
  toolbar?: React.ReactNode;
  /** 始终展示的右侧操作（如「添加白名单」），不受批量选中隐藏 */
  toolbarAlways?: React.ReactNode;
  onRefresh?: () => void;
  /** 是否展示全屏按钮，默认有标题或刷新时展示 */
  showFullscreen?: boolean;
  /** 透传 SearchFilterBar */
  filterExtraActions?: React.ReactNode;
  filterResetText?: string;
  filterCollapsible?: boolean;
  filterDefaultCollapsed?: boolean;
  /** 批量操作：有选中行时浮出 */
  batchActions?: {
    onArchive?: (keys: (string | number)[]) => void;
    onEdit?: (keys: (string | number)[]) => void;
    onDelete?: (keys: (string | number)[]) => void;
    extra?: React.ReactNode;
    /** dark 居中浮条；light 跟工具栏右侧 */
    theme?: 'dark' | 'light';
  };
  tableProps: TableProps<T>;
  className?: string;
};

/** 标准业务列表：筛选 → 汇总 → 表格（含标题栏 / 批量条 / 全屏） */
function BizListPage<T extends Record<string, unknown>>({
  form,
  filter,
  onSearch,
  onReset,
  summary,
  title,
  toolbar,
  toolbarAlways,
  onRefresh,
  showFullscreen,
  filterExtraActions,
  filterResetText,
  filterCollapsible,
  filterDefaultCollapsed,
  batchActions,
  tableProps,
  className
}: BizListPageProps<T>) {
  const { lang } = useContext(GlobalContext);
  const t = useLocale();
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const contentFullscreen = pageTabsStore.contentFullscreen;
  const enableFullscreen =
    showFullscreen ?? (title != null && title !== '' || Boolean(onRefresh));

  useEffect(() => {
    if (!contentFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') pageTabsStore.setContentFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [contentFullscreen]);

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

  // 依赖 lang：切换语言后强制按新表头文案规范化列
  const columns = useMemo(
    () =>
      normalizeBizColumns(
        (tableProps.columns || []) as TableColumnProps<T>[]
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lang 变化时需重算 i18n 表头
    [tableProps.columns, lang]
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

  const batchTheme = batchActions?.theme || 'dark';
  const batchInToolbar = batchTheme === 'light';

  return (
    <div
      className={cs(
        'flex flex-col gap-4',
        contentFullscreen && 'use-biz-list-fullscreen min-h-0 flex-1',
        className
      )}
    >
      {/* 全屏：隐藏筛选 / 汇总，仅保留表格 */}
      {!contentFullscreen && filter ? (
        <SearchFilterBar
          form={form}
          onSearch={onSearch}
          onReset={onReset}
          extraActions={filterExtraActions}
          resetText={filterResetText}
          collapsible={filterCollapsible}
          defaultCollapsed={filterDefaultCollapsed}
        >
          {filter}
        </SearchFilterBar>
      ) : null}
      {!contentFullscreen && summary && summary.length > 0 ? (
        <DataSummary items={summary} />
      ) : null}
      <Card
        className={cs(
          'use-biz-table-card relative !p-0',
          // 无分页时裁切底角，避免末行方角顶出卡片圆角；有分页保留 visible 以便固定列阴影
          pagination === false ? 'overflow-hidden' : 'overflow-visible',
          contentFullscreen && 'use-biz-table-card-fullscreen flex min-h-0 flex-1 flex-col'
        )}
        bordered={false}
      >
        {(title ||
          toolbar ||
          toolbarAlways ||
          onRefresh ||
          enableFullscreen ||
          hasRowSelection) && (
          <div className="use-biz-table-toolbar relative max-md:h-auto max-md:flex-wrap">
            <div className="flex min-w-0 items-center gap-3">
              {title != null && title !== '' && (
                <div className="use-biz-table-toolbar-title">{title}</div>
              )}
              {/* 无批量条时，标题旁兜底展示已选数量 */}
              {hasRowSelection && !batchActions && selectedCount > 0 && (
                <div className="text-sm leading-[21px] text-arco-text-3">
                  {t['common.selectedCount'].replace(
                    '{n}',
                    String(selectedCount)
                  )}
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {(onRefresh || enableFullscreen) && (
                <div className="flex items-center gap-2">
                  {onRefresh && (
                    <Tooltip content={t['common.refresh']}>
                      <Button
                        type="secondary"
                        className="use-biz-table-icon-btn"
                        icon={<IconRefresh />}
                        onClick={onRefresh}
                      />
                    </Tooltip>
                  )}
                  {enableFullscreen && (
                    <Tooltip
                      content={
                        contentFullscreen
                          ? t['pageTabs.exitFullscreen']
                          : t['pageTabs.fullscreen']
                      }
                    >
                      <Button
                        type="secondary"
                        className="use-biz-table-icon-btn"
                        icon={
                          contentFullscreen ? <IconShrink /> : <IconExpand />
                        }
                        aria-pressed={contentFullscreen}
                        onClick={() =>
                          pageTabsStore.toggleContentFullscreen()
                        }
                      />
                    </Tooltip>
                  )}
                </div>
              )}
              {batchInToolbar && batchActions && (
                <TableBatchBar
                  count={selectedCount}
                  showSelectedOnly={showSelectedOnly}
                  onShowSelectedOnlyChange={setShowSelectedOnly}
                  theme="light"
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
              {/* 全屏时隐藏业务操作按钮，只留刷新/退出全屏 */}
              {!contentFullscreen &&
                toolbar &&
                !(batchInToolbar && selectedCount > 0) && (
                  <Space size={8}>{toolbar}</Space>
                )}
              {!contentFullscreen && toolbarAlways && (
                <Space size={8}>{toolbarAlways}</Space>
              )}
            </div>
            {batchActions && !batchInToolbar && (
              <TableBatchBar
                count={selectedCount}
                showSelectedOnly={showSelectedOnly}
                onShowSelectedOnlyChange={setShowSelectedOnly}
                theme={batchTheme}
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
        <div
          className={cs(
            'relative',
            contentFullscreen && 'min-h-0 flex-1 overflow-auto'
          )}
        >
          <Table
            key={lang || 'zh-CN'}
            rowKey="id"
            border={false}
            {...tableProps}
            stripe={tableProps.stripe ?? true}
            className={cs(
              'use-biz-table',
              pagination === false && 'is-no-pagination',
              tableProps.className
            )}
            columns={columns}
            data={displayData}
            scroll={scroll}
            pagination={pagination as TableProps<T>['pagination']}
            noDataElement={tableProps.noDataElement ?? <EmptyState />}
          />
        </div>
      </Card>
    </div>
  );
}

export default observer(BizListPage);
