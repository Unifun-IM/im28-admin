import { observer } from 'mobx-react-lite';

import {
  CurrentUserCard,
  type CurrentUserStore
} from '@entities/current-user';
import { RefreshCurrentUserButton } from '@features/refresh-current-user';
import { Card, Space, Typography } from '@shared/ui';

interface DashboardPanelProps {
  currentUserStore: CurrentUserStore;
}

export const DashboardPanel = observer(function DashboardPanel({
  currentUserStore
}: DashboardPanelProps) {
  return (
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
      <div className="dashboard-kpi-grid">
        <Card title="Active stores">
          <Typography.Title heading={3} style={{ margin: 0 }}>
            -
          </Typography.Title>
          <Typography.Text type="secondary">Waiting for API contract</Typography.Text>
        </Card>
        <Card title="Pending reviews">
          <Typography.Title heading={3} style={{ margin: 0 }}>
            -
          </Typography.Title>
          <Typography.Text type="secondary">Waiting for API contract</Typography.Text>
        </Card>
      </div>
      <CurrentUserCard
        errorMessage={currentUserStore.errorMessage}
        status={currentUserStore.status}
        user={currentUserStore.user}
      />
    </section>
  );
});
