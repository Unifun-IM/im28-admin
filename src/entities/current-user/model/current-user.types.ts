export type CurrentUserRole = 'admin' | 'operator';

export interface CurrentUser {
  id: string;
  name: string;
  role: CurrentUserRole;
}

export type CurrentUserStatus = 'idle' | 'loading' | 'ready' | 'error';

export type CurrentUserLoader = () => Promise<CurrentUser>;
