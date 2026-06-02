import { AppProviders } from './providers';
import { AppRouterProvider } from './router';

export function App() {
  return (
    <AppProviders>
      <AppRouterProvider />
    </AppProviders>
  );
}
