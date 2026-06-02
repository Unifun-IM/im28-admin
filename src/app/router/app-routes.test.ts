import { appRoutes } from './app-routes';

describe('appRoutes', () => {
  it('registers dashboard as the default admin route', () => {
    const defaultRoute = appRoutes.find((route) => route.path === '/');

    expect(defaultRoute).toBeDefined();
    expect(defaultRoute?.handle).toEqual({ title: 'Dashboard' });
  });
});
