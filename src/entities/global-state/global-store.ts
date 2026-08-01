import { makeAutoObservable, runInAction } from 'mobx';

import defaultSettings from '@shared/config/settings.json';
import applyThemeColor from '@shared/lib/applyThemeColor';

export type AppSettings = typeof defaultSettings;

/** 登录后全局用户信息，直接对应 AdminAPI.SysUserEnvelope.data */
export type UserInfo = {
  sys_user?: AdminAPI.SysUser;
  rbac?: AdminAPI.SysUserRBAC;
  /**
   * 侧栏路由过滤仍用旧结构；路由未配置 requiredPermissions 时传空对象即可全显。
   */
  permissions: Record<string, string[]>;
};

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
    applyThemeColor(settings.themeColor, {
      dark:
        typeof document !== 'undefined' &&
        document.body.getAttribute('arco-theme') === 'dark'
    });
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
