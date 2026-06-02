import { observer } from 'mobx-react-lite';

import {
  CurrentUserCard,
  type CurrentUserStore
} from '@entities/current-user';
import { RefreshCurrentUserButton } from '@features/refresh-current-user';
import { Layout, Menu, Space, Typography } from '@shared/ui';

interface DashboardPanelProps {
  currentUserStore: CurrentUserStore;
}

export const DashboardPanel = observer(function DashboardPanel({
  currentUserStore
}: DashboardPanelProps) {
  return (
    <Layout className="app-shell">
      <Layout.Sider className="app-sider" width={220}>
        <Menu selectedKeys={['dashboard']}>
          <Menu.Item key="dashboard">Dashboard</Menu.Item>
        </Menu>
      </Layout.Sider>
      <Layout>
        <Layout.Header className="app-header">
          <Typography.Title heading={5} style={{ margin: 0 }}>
            im-admin
          </Typography.Title>
        </Layout.Header>
        <Layout.Content className="app-content">
          <section className="dashboard-panel" aria-label="Dashboard">
            <div className="dashboard-card-header">
              <Space direction="vertical" size={2}>
                <Typography.Title heading={4} style={{ margin: 0 }}>
                  Dashboard
                </Typography.Title>
                <Typography.Text type="secondary">
                  Operational entry point for the admin workspace.
                </Typography.Text>
              </Space>
              <RefreshCurrentUserButton
                status={currentUserStore.status}
                onRefresh={currentUserStore.loadCurrentUser}
              />
            </div>
            <CurrentUserCard
              errorMessage={currentUserStore.errorMessage}
              status={currentUserStore.status}
              user={currentUserStore.user}
            />
          </section>
        </Layout.Content>
      </Layout>
    </Layout>
  );
});
