import { Navigate, type RouteObject } from 'react-router-dom';

import { DashboardPage } from '@pages/dashboard';
import { LoginPage } from '@pages/login';
import { AdminShell, type AdminMenuItem } from '@widgets/admin-shell';

export function appRoutes(menuItems: AdminMenuItem[] = []): RouteObject[] {
  return [
    {
      path: '/',
      element: <Navigate replace to="/dashboard" />
    },
    {
      path: '/login',
      element: <LoginPage />,
      handle: { title: 'Login', public: true }
    },
    {
      path: '/dashboard',
      element: (
        <AdminShell menuItems={menuItems} selectedMenuKey="dashboard" title="im-admin">
          <DashboardPage />
        </AdminShell>
      ),
      handle: { menuKey: 'dashboard', title: 'Dashboard' }
    }
  ];
}
