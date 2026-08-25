import React from 'react';
import {
  Drawer,
  Table,
  type DrawerProps,
  type TableColumnProps,
  type TableProps
} from '@arco-design/web-react';
import cs from 'classnames';
import '@shared/ui/biz-detail-table.less';

export type BizRelationListDrawerProps<T extends Record<string, unknown>> = {
  visible: boolean;
  title: React.ReactNode;
  onClose: () => void;
  columns: TableColumnProps<T>[];
  data: T[];
  loading?: boolean;
  rowKey: TableProps<T>['rowKey'];
  width?: number;
  scrollX?: number;
  pagination?: TableProps<T>['pagination'];
  className?: string;
  drawerProps?: Omit<
    DrawerProps,
    'visible' | 'title' | 'onCancel' | 'footer' | 'children' | 'width'
  >;
};

/**
 * 详情关联列表 Drawer：好友 / 群聊 / 成员等
 * 表格样式走 use-biz-detail-table（上下圆角一致，分页在框外）
 */
export default function BizRelationListDrawer<
  T extends Record<string, unknown>
>({
  visible,
  title,
  onClose,
  columns,
  data,
  loading,
  rowKey,
  width = 880,
  scrollX,
  pagination,
  className,
  drawerProps
}: BizRelationListDrawerProps<T>) {
  return (
    <Drawer
      {...drawerProps}
      className={cs('use-biz-relation-list-drawer', className)}
      width={width}
      title={title}
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
    >
      <Table
        className="use-biz-detail-table"
        loading={loading}
        rowKey={rowKey}
        data={data}
        columns={columns}
        // 默认不设 scroll.x：Arco 会拆表头/表体并在底部留横向滚动条槽，与外框底边叠成双线
        scroll={scrollX != null ? { x: scrollX } : undefined}
        pagination={pagination}
      />
    </Drawer>
  );
}
