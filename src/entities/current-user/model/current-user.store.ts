import { makeAutoObservable, runInAction } from 'mobx';

import type {
  CurrentUser,
  CurrentUserLoader,
  CurrentUserStatus
} from './current-user.types';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to load current user';
}

export class CurrentUserStore {
  errorMessage: string | null = null;
  status: CurrentUserStatus = 'idle';
  user: CurrentUser | null = null;

  constructor(private readonly loadUser: CurrentUserLoader) {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get isAuthenticated() {
    return this.status === 'ready' && this.user !== null;
  }

  async loadCurrentUser() {
    this.status = 'loading';
    this.errorMessage = null;

    try {
      const user = await this.loadUser();

      runInAction(() => {
        this.user = user;
        this.status = 'ready';
      });
    } catch (error) {
      runInAction(() => {
        this.errorMessage = getErrorMessage(error);
        this.status = 'error';
        this.user = null;
      });
    }
  }
}
