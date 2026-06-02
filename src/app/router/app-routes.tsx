import type { RouteObject } from 'react-router-dom';

import { DashboardPage } from '@pages/dashboard';

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <DashboardPage />,
    handle: { title: 'Dashboard' }
  }
];
