import { useContext } from 'react';

import { CurrentUserContext } from './current-user.context-value';

export function useCurrentUserStore() {
  const store = useContext(CurrentUserContext);

  if (store === null) {
    throw new Error('CurrentUserProvider is required before using current user state.');
  }

  return store;
}
