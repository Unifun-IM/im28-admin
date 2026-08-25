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
  width?: number | string;
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
 * 默认宽 50%（与详情 Drawer 一致）；表格走 use-biz-detail-table
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
  width = '50%',
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
        border={false}
        stripe
        loading={loading}
        rowKey={rowKey}
        data={data}
        columns={columns}
        // 同列表：默认不强制 scroll.x，避免拆表 + 底部滚动条槽
        scroll={scrollX != null ? { x: scrollX } : undefined}
        pagination={pagination}
      />
    </Drawer>
  );
}
