import { useNavigate } from 'react-router-dom';

import { useCurrentUserStore } from '@entities/current-user';
import { DashboardPage } from '@pages/dashboard';
import { AdminShell, type AdminMenuItem } from '@widgets/admin-shell';

interface DashboardRouteProps {
  menuItems: AdminMenuItem[];
}

export function DashboardRoute({ menuItems }: DashboardRouteProps) {
  const currentUserStore = useCurrentUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    window.localStorage.removeItem('im-admin.access-token');
    navigate('/login');
  };

  return (
    <AdminShell
      currentUserName={currentUserStore.user?.name ?? '未登录'}
      menuItems={menuItems}
      onLogout={handleLogout}
      selectedMenuKey="dashboard"
      title="im-admin"
    >
      <DashboardPage />
    </AdminShell>
  );
}
