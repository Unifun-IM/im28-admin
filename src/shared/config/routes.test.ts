import { routes } from './routes';

describe('default sidebar routes', () => {
  it('keeps the system group last by default', () => {
    expect(routes.at(-1)?.key).toBe('system');
  });
});
