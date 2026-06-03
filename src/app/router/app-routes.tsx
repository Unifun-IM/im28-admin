import { Navigate, type RouteObject } from 'react-router-dom';

import { LoginPage } from '@pages/login';
import type { AdminMenuItem } from '@widgets/admin-shell';

import { DashboardRoute } from './DashboardRoute';

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
      element: <DashboardRoute menuItems={menuItems} />,
      handle: { menuKey: 'dashboard', title: 'Dashboard' }
    }
  ];
}
