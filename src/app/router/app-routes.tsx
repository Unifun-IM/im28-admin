import { Navigate, type RouteObject } from 'react-router-dom';

import LoginPage from '@pages/login';
import { PageLayout } from '@widgets/admin-shell/PageLayout';

export function appRoutes(): RouteObject[] {
  return [
    {
      path: '/login',
      element: <LoginPage />,
      handle: { title: 'Login', public: true }
    },
    {
      path: '/*',
      element: <PageLayout />,
      handle: { title: 'Admin' }
    },
    {
      path: '/',
      element: <Navigate replace to="/user/query" />
    }
  ];
}
