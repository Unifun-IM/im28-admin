import { RouterProvider, createBrowserRouter } from 'react-router-dom';

import { appRoutes } from './app-routes';

const appRouter = createBrowserRouter(appRoutes);

export function AppRouterProvider() {
  return <RouterProvider router={appRouter} />;
}
