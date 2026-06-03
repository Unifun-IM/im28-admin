import { IconDashboard } from '@arco-design/web-react/icon';

import type { AdminMenuItem } from '@widgets/admin-shell';

export const adminMenuItems: AdminMenuItem[] = [
  {
    icon: <IconDashboard />,
    key: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard'
  }
];
