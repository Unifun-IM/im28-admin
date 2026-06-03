import { useState, type PropsWithChildren, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { IconMenuFold, IconMenuUnfold, IconUser } from '@arco-design/web-react/icon';
import { Breadcrumb, Button, Layout, Menu, Space, Typography } from '@shared/ui';

export interface AdminMenuItem {
  icon?: ReactNode;
  key: string;
  label: string;
  path: string;
}

interface AdminShellProps extends PropsWithChildren {
  currentUserName?: string;
  menuItems: AdminMenuItem[];
  onLogout?: () => void;
  selectedMenuKey: string;
  title: string;
}

export function AdminShell({
  children,
  currentUserName = '未登录',
  menuItems,
  onLogout,
  selectedMenuKey,
  title
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed((current) => !current);
  };

  return (
    <Layout className="admin-pro-shell">
      <Layout.Header className="admin-pro-header">
        <div className="admin-pro-brand">
          <div className="admin-pro-logo-mark">IM</div>
          <Typography.Text bold>{title}</Typography.Text>
        </div>
        <Space align="center" size={16}>
          <Space align="center" size={6}>
            <IconUser />
            <Typography.Text>{currentUserName}</Typography.Text>
          </Space>
          <Button onClick={onLogout} type="text">
            退出登录
          </Button>
        </Space>
      </Layout.Header>
      <Layout className="admin-pro-body">
        <Layout.Sider
          className="admin-pro-sider"
          collapsed={collapsed}
          collapsible
          trigger={null}
          width={220}
        >
          <nav aria-label="Admin navigation" className="admin-pro-nav">
            <Menu collapse={collapsed} selectedKeys={[selectedMenuKey]}>
              {menuItems.map((item) => (
                <Menu.Item key={item.key}>
                  <Link className="admin-pro-menu-link" to={item.path}>
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </Menu.Item>
              ))}
            </Menu>
            <Button
              aria-label={collapsed ? '展开菜单' : '收起菜单'}
              className="admin-pro-collapse-button"
              icon={collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
              onClick={toggleCollapsed}
              type="text"
            >
              {!collapsed && '收起菜单'}
            </Button>
          </nav>
        </Layout.Sider>
        <Layout.Content className="admin-pro-content" role="main">
          <div className="admin-pro-breadcrumb">
            <Breadcrumb>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          {children}
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
