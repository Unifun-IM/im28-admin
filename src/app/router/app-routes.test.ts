import { appRoutes } from './app-routes';

describe('appRoutes', () => {
  it('registers login as a standalone public page', () => {
    const loginRoute = appRoutes().find((route) => route.path === '/login');

    expect(loginRoute).toBeDefined();
    expect(loginRoute?.handle).toEqual({ title: 'Login', public: true });
  });

  it('registers ip-denied as a standalone public page', () => {
    const route = appRoutes().find((route) => route.path === '/ip-denied');

    expect(route).toBeDefined();
    expect(route?.handle).toEqual({
      title: 'IP Access Denied',
      public: true
    });
  });

  it('registers the pro layout catch-all route', () => {
    const layoutRoute = appRoutes().find((route) => route.path === '/*');

    expect(layoutRoute).toBeDefined();
    expect(layoutRoute?.handle).toEqual({ title: 'Admin' });
  });
});
