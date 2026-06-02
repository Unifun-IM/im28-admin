import { useCurrentUserStore } from '@entities/current-user';
import { DashboardPanel } from '@widgets/dashboard-panel';

export function DashboardPage() {
  const currentUserStore = useCurrentUserStore();

  return <DashboardPanel currentUserStore={currentUserStore} />;
}
