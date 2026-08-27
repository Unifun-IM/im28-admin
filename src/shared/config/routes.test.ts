import { routes } from './routes';

describe('IM admin sidebar routes', () => {
  it('keeps the product-defined top-level order', () => {
    expect(routes.map((route) => route.key)).toEqual([
      'dashboard',
      'user',
      'group',
      'session',
      'trade',
      'system',
      'risk'
    ]);
  });

  it('splits session query into direct and group conversations', () => {
    const session = routes.find((route) => route.key === 'session');
    const query = session?.children?.find(
      (route) => route.key === 'session/query'
    );

    expect(query?.children?.map((route) => route.key)).toEqual([
      'session/user',
      'session/group'
    ]);
  });
});
