import { appRoutes } from './app-routes';

describe('appRoutes', () => {
  it('registers dashboard as the default admin route', () => {
    const dashboardRoute = appRoutes().find((route) => route.path === '/dashboard');

    expect(dashboardRoute).toBeDefined();
    expect(dashboardRoute?.handle).toEqual({ menuKey: 'dashboard', title: 'Dashboard' });
  });

  it('registers login as a standalone public page', () => {
    const loginRoute = appRoutes().find((route) => route.path === '/login');

    expect(loginRoute).toBeDefined();
    expect(loginRoute?.handle).toEqual({ title: 'Login', public: true });
  });
});
