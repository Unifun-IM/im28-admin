import { Navigate, type RouteObject } from 'react-router-dom';

import LoginPage from '@pages/login';

import { AdminLayout } from './admin-layout';

export function appRoutes(): RouteObject[] {
  return [
    {
      path: '/login',
      element: <LoginPage />,
      handle: { title: 'Login', public: true }
    },
    {
      path: '/*',
      element: <AdminLayout />,
      handle: { title: 'Admin' }
    },
    {
      path: '/',
      element: <Navigate replace to="/user/query" />
    }
  ];
}
