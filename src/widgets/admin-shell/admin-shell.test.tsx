import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AdminShell } from './index';

describe('AdminShell', () => {
  it('renders an Arco Pro style admin frame around page content', () => {
    render(
      <MemoryRouter>
        <AdminShell
          currentUserName="Admin User"
          menuItems={[{ key: 'dashboard', label: 'Dashboard', path: '/dashboard' }]}
          onLogout={() => undefined}
          selectedMenuKey="dashboard"
          title="im-admin"
        >
          <div>Dashboard content</div>
        </AdminShell>
      </MemoryRouter>
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveTextContent('im-admin');
    expect(header).toHaveTextContent('Admin User');
    expect(header).toHaveTextContent('退出登录');
    expect(screen.getByRole('navigation', { name: 'Admin navigation' })).toHaveTextContent(
      'Dashboard'
    );
    expect(screen.getByRole('navigation', { name: 'Admin navigation' })).toHaveTextContent(
      '收起菜单'
    );
    const main = screen.getByRole('main');
    expect(main).toHaveTextContent('Home');
    expect(main).toHaveTextContent('Dashboard');
    expect(main).toHaveTextContent('Dashboard content');
  });
});
