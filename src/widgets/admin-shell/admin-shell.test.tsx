import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AdminShell } from './index';

describe('AdminShell', () => {
  it('renders an Arco Pro style admin frame around page content', () => {
    render(
      <MemoryRouter>
        <AdminShell
          menuItems={[{ key: 'dashboard', label: 'Dashboard', path: '/dashboard' }]}
          selectedMenuKey="dashboard"
          title="im-admin"
        >
          <div>Dashboard content</div>
        </AdminShell>
      </MemoryRouter>
    );

    expect(screen.getByRole('banner')).toHaveTextContent('im-admin');
    expect(screen.getByRole('navigation', { name: 'Admin navigation' })).toHaveTextContent(
      'Dashboard'
    );
    expect(screen.getByRole('main')).toHaveTextContent('Dashboard content');
  });
});
