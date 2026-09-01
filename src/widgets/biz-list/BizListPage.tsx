import React, {
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
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
import useMediaQuery, { MOBILE_MEDIA_QUERY } from '@shared/lib/useMediaQuery';
import { EmptyState } from '@shared/ui';
import DataSummary, { type SummaryItem } from './DataSummary';
import SearchFilterBar from './SearchFilterBar';
import TableBatchBar from './TableBatchBar';
import {
  DEFAULT_AUXILIARY_COLUMN_WIDTH,
  resolveBizTableLayout,
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
  /** 是否展示表格全屏按钮，默认有标题或刷新时展示 */
  showFullscreen?: boolean;
  /** 透传 SearchFilterBar */
  filterExtraActions?: React.ReactNode;
  filterResetText?: string;
  filterCollapsible?: boolean;
  filterDefaultCollapsed?: boolean;
  /**
   * 批量操作（Figma 741:24735 / 804:19957）
   * 提供后：表头「批量操作」进入模式才显示选择列；有选中时浮出批量条
   */
  batchActions?: {
    onArchive?: (keys: (string | number)[]) => void;
    onEdit?: (keys: (string | number)[]) => void;
    onDelete?: (keys: (string | number)[]) => void;
    extra?: React.ReactNode;
    /** light 工具栏右侧（默认）；dark 居中浮条 */
    theme?: 'dark' | 'light';
    /** 退出批量：清空选中并关闭选择列 */
    onExit?: () => void;
  };
  tableProps: TableProps<T>;
  className?: string;
};

/** 标准业务列表：筛选 → 汇总 → 表格（含标题栏 / 批量条 / 表格全屏） */
export function BizListPage<T extends Record<string, unknown>>({
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
  const compactActions = useMediaQuery(MOBILE_MEDIA_QUERY);
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [tableAvailableWidth, setTableAvailableWidth] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  /** 有 batchActions 时：点「批量操作」后才进入选择模式 */
  const [batchSelectMode, setBatchSelectMode] = useState(false);
  const tableFullscreen = pageTabsStore.tableFullscreen;
  const enableFullscreen =
    showFullscreen ?? (title != null && title !== '' || Boolean(onRefresh));

  const needsBatchEntry = Boolean(batchActions);
  const inBatchSelect = !needsBatchEntry || batchSelectMode;
  const hasRowSelection = Boolean(tableProps.rowSelection) && inBatchSelect;
  const selectedRowKeys = useMemo(
    () =>
      (tableProps.rowSelection?.selectedRowKeys || []) as (string | number)[],
    [tableProps.rowSelection?.selectedRowKeys]
  );
  const selectedCount = selectedRowKeys.length;

  useLayoutEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return undefined;

    const syncWidth = () => {
      const nextWidth = Math.floor(container.clientWidth);
      setTableAvailableWidth((current) =>
        current === nextWidth ? current : nextWidth
      );
    };

    syncWidth();
    if (typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(syncWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const exitBatchSelect = () => {
    setBatchSelectMode(false);
    setShowSelectedOnly(false);
    batchActions?.onExit?.();
  };

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

  /** 有选择列时默认左侧固定；配置了 batchActions 时仅批量模式下展示 */
  const rowSelection = useMemo(() => {
    if (!tableProps.rowSelection) return undefined;
    if (needsBatchEntry && !batchSelectMode) return undefined;
    return {
      fixed: true,
      ...tableProps.rowSelection
    };
  }, [tableProps.rowSelection, needsBatchEntry, batchSelectMode]);
  const auxiliaryColumnWidth =
    (rowSelection
      ? rowSelection.columnWidth ?? DEFAULT_AUXILIARY_COLUMN_WIDTH
      : 0) +
    (tableProps.expandedRowRender
      ? tableProps.expandProps?.width ?? DEFAULT_AUXILIARY_COLUMN_WIDTH
      : 0);

  // 依赖 lang：切换语言后强制按新表头文案规范化列
  const tableLayout = useMemo(
    () =>
      resolveBizTableLayout(
        (tableProps.columns || []) as TableColumnProps<T>[],
        {
          compactActions,
          auxiliaryColumnWidth,
          availableWidth: tableAvailableWidth
        }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lang 变化时需重算 i18n 表头
    [
      auxiliaryColumnWidth,
      compactActions,
      tableAvailableWidth,
      tableProps.columns,
      lang
    ]
  );
  const columns = tableLayout.columns;
  const pagination = resolveBizPagination(
    tableProps.pagination as false | undefined | Record<string, unknown>,
    displayData.length,
    { compact: compactActions }
  );

  const scroll = useMemo(() => {
    const incoming = tableProps.scroll || {};
    return {
      x: tableLayout.scrollX,
      ...incoming
    };
  }, [tableLayout.scrollX, tableProps.scroll]);

  const batchTheme = batchActions?.theme || 'light';
  const batchInToolbar = batchTheme === 'light';

  return (
    <div
      className={cs(
        'flex w-full min-w-0 max-w-full flex-col gap-4 overflow-x-hidden',
        tableFullscreen && 'use-biz-list-fullscreen min-h-0 flex-1',
        className
      )}
    >
      {/* 表格全屏：隐藏筛选 / 汇总，仅保留表格 */}
      {!tableFullscreen && filter ? (
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
      {!tableFullscreen && summary && summary.length > 0 ? (
        <DataSummary items={summary} />
      ) : null}
      <Card
        className={cs(
          'use-biz-table-card relative w-full min-w-0 max-w-full !p-0',
          // 无分页时裁切底角，避免末行方角顶出卡片圆角；有分页保留 visible 以便固定列阴影
          pagination === false ? 'overflow-hidden' : 'overflow-visible',
          tableFullscreen && 'use-biz-table-card-fullscreen flex min-h-0 flex-1 flex-col'
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
            <div className="flex min-w-0 max-w-full items-center gap-3">
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
            <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-2 max-md:w-full max-md:shrink max-md:justify-start">
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
                        tableFullscreen
                          ? t['pageTabs.exitFullscreen']
                          : t['pageTabs.fullscreen']
                      }
                    >
                      <Button
                        type="secondary"
                        className="use-biz-table-icon-btn"
                        icon={
                          tableFullscreen ? <IconShrink /> : <IconExpand />
                        }
                        aria-pressed={tableFullscreen}
                        onClick={() => pageTabsStore.toggleTableFullscreen()}
                      />
                    </Tooltip>
                  )}
                </div>
              )}
              {batchInToolbar &&
                batchActions &&
                batchSelectMode &&
                selectedCount > 0 && (
                  <TableBatchBar
                    count={selectedCount}
                    showSelectedOnly={showSelectedOnly}
                    onShowSelectedOnlyChange={setShowSelectedOnly}
                    theme="light"
                    onExit={exitBatchSelect}
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
              {/* 未进批量 / 已进但未选：表头「批量操作」或「取消批量」— Figma 741:24735 */}
              {!tableFullscreen &&
                batchInToolbar &&
                batchActions &&
                !(batchSelectMode && selectedCount > 0) && (
                  <Button
                    type="secondary"
                    onClick={() =>
                      batchSelectMode
                        ? exitBatchSelect()
                        : setBatchSelectMode(true)
                    }
                  >
                    {batchSelectMode
                      ? t['common.cancelBatch']
                      : t['common.batchActions']}
                  </Button>
                )}
              {/* 表格全屏时隐藏业务操作按钮，只留刷新/退出全屏 */}
              {!tableFullscreen &&
                toolbar &&
                !(batchInToolbar && batchSelectMode && selectedCount > 0) && (
                  <Space size={8}>{toolbar}</Space>
                )}
              {!tableFullscreen && toolbarAlways && (
                <Space size={8}>{toolbarAlways}</Space>
              )}
            </div>
            {/* dark 浮条：仍需表头入口进入选择模式 */}
            {!tableFullscreen &&
              !batchInToolbar &&
              batchActions &&
              !batchSelectMode && (
                <Button
                  type="secondary"
                  className="absolute right-4 top-3 z-10 max-md:static"
                  onClick={() => setBatchSelectMode(true)}
                >
                  {t['common.batchActions']}
                </Button>
              )}
            {batchActions && !batchInToolbar && batchSelectMode && (
              <>
                {selectedCount <= 0 && (
                  <Button
                    type="secondary"
                    className="absolute right-4 top-3 z-10 max-md:static"
                    onClick={exitBatchSelect}
                  >
                    {t['common.cancelBatch']}
                  </Button>
                )}
                <TableBatchBar
                  count={selectedCount}
                  showSelectedOnly={showSelectedOnly}
                  onShowSelectedOnlyChange={setShowSelectedOnly}
                  theme={batchTheme}
                  onExit={exitBatchSelect}
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
              </>
            )}
          </div>
        )}
        <div
          ref={tableContainerRef}
          className={cs(
            'relative min-w-0 max-w-full overflow-x-hidden',
            tableFullscreen && 'min-h-0 flex-1 overflow-y-auto'
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
            rowSelection={rowSelection}
            scroll={scroll}
            pagination={pagination as TableProps<T>['pagination']}
            noDataElement={tableProps.noDataElement ?? <EmptyState />}
          />
        </div>
      </Card>
    </div>
  );
}

const ObservedBizListPage = observer(BizListPage);

export default ObservedBizListPage;
