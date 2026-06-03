import { AppProviders } from './providers';
import { AppRouterProvider } from './router';
import { adminMenuItems } from './config/admin-menu';

export function App() {
  return (
    <AppProviders>
      <AppRouterProvider menuItems={adminMenuItems} />
    </AppProviders>
  );
}
