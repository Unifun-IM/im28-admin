import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import type { AdminMenuItem } from '@widgets/admin-shell';

import { appRoutes } from './app-routes';

interface AppRouterProviderProps {
  menuItems: AdminMenuItem[];
}

export function AppRouterProvider({ menuItems }: AppRouterProviderProps) {
  const appRouter = createBrowserRouter(appRoutes(menuItems));

  return <RouterProvider router={appRouter} />;
}
