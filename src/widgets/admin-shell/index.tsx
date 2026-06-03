import type { PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { IconMenuFold, IconMenuUnfold } from '@arco-design/web-react/icon';
import { Breadcrumb, Button, Layout, Menu, Space, Typography } from '@shared/ui';

export interface AdminMenuItem {
  icon?: ReactNode;
  key: string;
  label: string;
  path: string;
}

interface AdminShellProps extends PropsWithChildren {
  menuItems: AdminMenuItem[];
  selectedMenuKey: string;
  title: string;
}

export function AdminShell({
  children,
  menuItems,
  selectedMenuKey,
  title
}: AdminShellProps) {
  return (
    <Layout className="admin-pro-shell">
      <Layout.Sider className="admin-pro-sider" collapsible trigger={null} width={220}>
        <div className="admin-pro-logo">
          <div className="admin-pro-logo-mark">IM</div>
          <Typography.Text bold>{title}</Typography.Text>
        </div>
        <nav aria-label="Admin navigation">
          <Menu selectedKeys={[selectedMenuKey]}>
            {menuItems.map((item) => (
              <Menu.Item key={item.key}>
                <Link className="admin-pro-menu-link" to={item.path}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </Menu.Item>
            ))}
          </Menu>
        </nav>
      </Layout.Sider>
      <Layout>
        <Layout.Header className="admin-pro-header">
          <Space align="center" size={16}>
            <Button
              aria-label="Collapse menu"
              className="admin-pro-icon-button"
              icon={<IconMenuFold />}
              shape="circle"
              type="text"
            />
            <Typography.Text bold>{title}</Typography.Text>
            <Breadcrumb>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            </Breadcrumb>
          </Space>
          <Button icon={<IconMenuUnfold />} shape="circle" type="text" />
        </Layout.Header>
        <Layout.Content className="admin-pro-content" role="main">
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
