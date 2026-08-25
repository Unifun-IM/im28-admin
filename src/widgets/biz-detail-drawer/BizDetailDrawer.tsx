import React, { useMemo } from 'react';
import {
  Descriptions,
  Drawer,
  Spin,
  Table,
  Tabs,
  type DescriptionsProps,
  type DrawerProps,
  type TableColumnProps,
  type TableProps
} from '@arco-design/web-react';
import cs from 'classnames';

import useLocale from '@shared/lib/useLocale';
import '@shared/ui/biz-detail-table.less';
import './biz-detail-drawer.less';

const TabPane = Tabs.TabPane;

export type BizDetailField = {
  key?: React.Key;
  label: React.ReactNode;
  value?: React.ReactNode;
  /** 占用 Descriptions 列数 */
  span?: number;
  /** 兼容动态详情字段，不渲染 hidden 项 */
  hidden?: boolean;
  /** 当前字段为空时的兜底，默认 `--` */
  emptyText?: React.ReactNode;
};

export type BizDetailSection = {
  key?: React.Key;
  title?: React.ReactNode;
  fields: BizDetailField[];
  column?: DescriptionsProps['column'];
  className?: string;
};

export type BizDetailTab = {
  key: string;
  title: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  destroyOnHide?: boolean;
};

export type BizDetailOperationRecordsProps<T extends Record<string, unknown>> = {
  /** Tab 标题，默认 common.operationRecords */
  title?: React.ReactNode;
  /** Tab 内容区标题；默认不重复展示 Tab 标题 */
  contentTitle?: React.ReactNode;
  data?: T[];
  loading?: boolean;
  columns: TableColumnProps<T>[];
  rowKey?: TableProps<T>['rowKey'];
  pagination?: TableProps<T>['pagination'];
  tableProps?: Omit<
    TableProps<T>,
    'columns' | 'data' | 'loading' | 'pagination' | 'rowKey'
  >;
};

export type BizDetailDrawerProps<T extends Record<string, unknown>> = Omit<
  DrawerProps,
  'children'
> & {
  /**
   * 纯详情：传 fields / sections 即可。
   * 多 Tab：传 tabs，或同时传 operationRecords 自动追加「操作记录」Tab。
   */
  fields?: BizDetailField[];
  sections?: BizDetailSection[];
  detailTitle?: React.ReactNode;
  detailColumn?: DescriptionsProps['column'];
  tabs?: BizDetailTab[];
  activeTab?: string;
  defaultActiveTab?: string;
  onTabChange?: (key: string) => void;
  loading?: boolean;
  /** Tabs / 详情内容上方的对象摘要，如头像、名称和状态。 */
  summary?: React.ReactNode;
  operationRecords?: BizDetailOperationRecordsProps<T>;
  /** 详情底部扩展内容，如审计说明、外链等 */
  extra?: React.ReactNode;
};

function isEmptyValue(value: React.ReactNode) {
  return value == null || value === '';
}

function toDescriptionData(fields: BizDetailField[] = []) {
  return fields
    .filter((item) => !item.hidden)
    .map((item, index) => ({
      key: item.key ?? index,
      label: item.label,
      value: isEmptyValue(item.value)
        ? item.emptyText ?? '--'
        : item.value,
      span: item.span
    }));
}

function BizDetailDescriptions({
  sections,
  fields,
  detailTitle,
  detailColumn
}: {
  sections?: BizDetailSection[];
  fields?: BizDetailField[];
  detailTitle?: React.ReactNode;
  detailColumn?: DescriptionsProps['column'];
}) {
  const t = useLocale();
  const normalizedSections = useMemo<BizDetailSection[]>(() => {
    if (sections?.length) return sections;
    if (fields?.length) {
      return [
        {
          key: 'detail',
          title: detailTitle ?? t['common.basicInfo'],
          fields,
          column: detailColumn
        }
      ];
    }
    return [];
  }, [detailColumn, detailTitle, fields, sections, t]);

  if (!normalizedSections.length) return null;

  return (
    <div className="use-biz-detail-sections">
      {normalizedSections.map((section, index) => {
        const data = toDescriptionData(section.fields);
        if (!data.length) return null;
        return (
          <Descriptions
            key={section.key ?? index}
            className={cs('use-biz-detail-descriptions', section.className)}
            title={section.title}
            data={data}
            column={section.column ?? detailColumn ?? 2}
            layout="horizontal"
            tableLayout="fixed"
            border
          />
        );
      })}
    </div>
  );
}

function BizDetailOperationTable<T extends Record<string, unknown>>({
  contentTitle,
  data,
  loading,
  columns,
  rowKey,
  pagination,
  tableProps
}: BizDetailOperationRecordsProps<T>) {
  return (
    <div className="use-biz-detail-operation-records">
      {contentTitle ? (
        <div className="use-biz-detail-operation-title">{contentTitle}</div>
      ) : null}
      <Table
        {...tableProps}
        border={false}
        stripe={tableProps?.stripe ?? true}
        className={cs('use-biz-detail-table', tableProps?.className)}
        columns={columns}
        data={data || []}
        loading={loading}
        pagination={pagination ?? false}
        rowKey={rowKey}
      />
    </div>
  );
}

/** 通用详情 Drawer：支持纯详情、详情 + 操作记录、多 Tab 详情。 */
export default function BizDetailDrawer<T extends Record<string, unknown>>({
  fields,
  sections,
  detailTitle,
  detailColumn,
  tabs,
  activeTab,
  defaultActiveTab,
  onTabChange,
  loading = false,
  summary,
  operationRecords,
  extra,
  className,
  wrapClassName,
  width = '50%',
  footer = null,
  ...drawerProps
}: BizDetailDrawerProps<T>) {
  const t = useLocale();
  const hasDetail = Boolean(fields?.length || sections?.length);

  const detailContent = useMemo(() => {
    if (hasDetail) {
      return (
        <>
          <BizDetailDescriptions
            fields={fields}
            sections={sections}
            detailTitle={detailTitle}
            detailColumn={detailColumn}
          />
          {extra ? <div className="use-biz-detail-extra">{extra}</div> : null}
        </>
      );
    }
    if (extra) {
      return <div className="use-biz-detail-extra">{extra}</div>;
    }
    return null;
  }, [detailColumn, detailTitle, extra, fields, hasDetail, sections]);

  const mergedTabs = useMemo<BizDetailTab[]>(() => {
    const next: BizDetailTab[] = [];
    if (detailContent) {
      next.push({
        key: 'detail',
        title: detailTitle ?? t['common.basicInfo'],
        children: detailContent
      });
    }
    if (tabs?.length) next.push(...tabs);
    if (operationRecords) {
      next.push({
        key: 'operationRecords',
        title: operationRecords.title ?? t['common.operationRecords'],
        children: <BizDetailOperationTable {...operationRecords} />
      });
    }
    return next;
  }, [detailContent, detailTitle, operationRecords, tabs, t]);

  const shouldRenderTabs = mergedTabs.length > 1;

  return (
    <Drawer
      {...drawerProps}
      width={width}
      footer={footer}
      className={cs('use-biz-detail-drawer', className)}
      wrapClassName={cs('use-biz-detail-drawer-wrap', wrapClassName)}
    >
      <Spin loading={loading} className="use-biz-detail-drawer-spin">
        <div className="use-biz-detail-drawer-body">
          {summary ? (
            <div className="use-biz-detail-summary">{summary}</div>
          ) : null}
          {shouldRenderTabs ? (
            <Tabs
              className="use-biz-detail-tabs"
              type="line"
              size="default"
              activeTab={activeTab}
              defaultActiveTab={defaultActiveTab ?? mergedTabs[0]?.key}
              animation={false}
              destroyOnHide={false}
              onChange={onTabChange}
            >
              {mergedTabs.map((tab) => (
                <TabPane
                  key={tab.key}
                  title={tab.title}
                  disabled={tab.disabled}
                  destroyOnHide={tab.destroyOnHide}
                >
                  {tab.children}
                </TabPane>
              ))}
            </Tabs>
          ) : (
            mergedTabs[0]?.children ?? detailContent
          )}
        </div>
      </Spin>
    </Drawer>
  );
}

export { BizDetailOperationTable };
