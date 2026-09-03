import { routes } from './routes';

describe('IM admin sidebar routes', () => {
  it('keeps the product-defined top-level order', () => {
    expect(routes.map((route) => route.key)).toEqual([
      'dashboard',
      'user',
      'group',
      'session',
      'asset',
      'risk',
      'platform',
      'trade',
      'system'
    ]);
  });

  it('separates asset operations from platform configuration', () => {
    const asset = routes.find((route) => route.key === 'asset');
    const platform = routes.find((route) => route.key === 'platform');

    expect(asset?.children?.map((route) => route.key)).toEqual([
      'asset/deposit-addresses',
      'asset/withdrawals'
    ]);
    expect(platform?.children?.map((route) => route.key)).toEqual([
      'platform/banners',
      'platform/client-versions',
      'platform/terms'
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
