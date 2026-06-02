import { createContext } from 'react';

import type { CurrentUserStore } from './current-user.store';

export const CurrentUserContext = createContext<CurrentUserStore | null>(null);
