import type { PropsWithChildren } from 'react';

import { CurrentUserContext } from './current-user.context-value';
import type { CurrentUserStore } from './current-user.store';

interface CurrentUserProviderProps extends PropsWithChildren {
  store: CurrentUserStore;
}

export function CurrentUserProvider({
  children,
  store
}: CurrentUserProviderProps) {
  return (
    <CurrentUserContext.Provider value={store}>
      {children}
    </CurrentUserContext.Provider>
  );
}
