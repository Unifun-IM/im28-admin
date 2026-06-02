import { CurrentUserStore } from './current-user.store';

describe('CurrentUserStore', () => {
  it('loads the current user through an injected loader', async () => {
    const store = new CurrentUserStore(async () => ({
      id: 'user-1',
      name: 'Admin User',
      role: 'admin'
    }));

    expect(store.status).toBe('idle');

    await store.loadCurrentUser();

    expect(store.status).toBe('ready');
    expect(store.user).toEqual({
      id: 'user-1',
      name: 'Admin User',
      role: 'admin'
    });
    expect(store.isAuthenticated).toBe(true);
  });

  it('records load failures without fabricating a logged-in user', async () => {
    const store = new CurrentUserStore(async () => {
      throw new Error('network unavailable');
    });

    await store.loadCurrentUser();

    expect(store.status).toBe('error');
    expect(store.errorMessage).toBe('network unavailable');
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
  });
});
