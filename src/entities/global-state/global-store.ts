import { makeAutoObservable, runInAction } from 'mobx';

import defaultSettings from '@shared/config/settings.json';
import applyThemeColor from '@shared/lib/applyThemeColor';

export type AppSettings = typeof defaultSettings;

export interface UserInfo {
  name?: string;
  avatar?: string;
  job?: string;
  organization?: string;
  location?: string;
  email?: string;
  permissions: Record<string, string[]>;
  [key: string]: unknown;
}

export interface GlobalState {
  settings: AppSettings;
  userInfo: UserInfo;
  userLoading: boolean;
}

export class GlobalStore {
  settings: AppSettings = { ...defaultSettings };
  userInfo: UserInfo = { permissions: {} };
  userLoading = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get snapshot(): GlobalState {
    return {
      settings: this.settings,
      userInfo: this.userInfo,
      userLoading: this.userLoading
    };
  }

  updateSettings(settings: AppSettings) {
    this.settings = settings;
    applyThemeColor(settings.themeColor);
  }

  updateUserInfo(payload: { userInfo?: UserInfo; userLoading?: boolean }) {
    if (payload.userLoading !== undefined) {
      this.userLoading = payload.userLoading;
    }
    if (payload.userInfo) {
      this.userInfo = payload.userInfo;
    }
  }

  async fetchUserInfo(loader: () => Promise<UserInfo>) {
    this.userLoading = true;
    try {
      const userInfo = await loader();
      runInAction(() => {
        this.userInfo = userInfo;
        this.userLoading = false;
      });
    } catch {
      runInAction(() => {
        this.userLoading = false;
      });
    }
  }
}

export const globalStore = new GlobalStore();
