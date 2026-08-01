import { makeAutoObservable, runInAction } from 'mobx';
import { postV1AdminSystemSettingsGet } from '@shared/api/admin/platform';

/**
 * 后台系统参数（AdminAPI.SystemSetting）
 * 登录后拉取，侧栏品牌 / 时间格式 / 默认语言等全局消费
 */
class SystemSettingsStore {
  setting: AdminAPI.SystemSetting | null = null;
  loading = false;
  loaded = false;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get systemName() {
    return this.setting?.system_name?.trim() || '';
  }

  get logoUrl() {
    return this.setting?.logo_url?.trim() || '';
  }

  get defaultLanguage(): 'zh-CN' | 'en-US' {
    return this.setting?.default_language === 'en-US' ? 'en-US' : 'zh-CN';
  }

  get timeFormat(): '12h' | '24h' {
    return this.setting?.time_format === '12h' ? '12h' : '24h';
  }

  get ipWhitelistEnabled() {
    return Boolean(this.setting?.ip_whitelist_enabled);
  }

  apply(setting: AdminAPI.SystemSetting | null | undefined) {
    this.setting = setting ?? null;
    this.loaded = true;
    if (typeof document !== 'undefined' && this.systemName) {
      document.title = this.systemName;
    }
  }

  async fetch() {
    this.loading = true;
    try {
      const res = await postV1AdminSystemSettingsGet();
      runInAction(() => {
        this.apply(res.data?.setting);
        this.loading = false;
      });
      return this.setting;
    } catch {
      runInAction(() => {
        this.loading = false;
        this.loaded = true;
      });
      return null;
    }
  }

  clear() {
    this.setting = null;
    this.loaded = false;
    this.loading = false;
  }
}

export const systemSettingsStore = new SystemSettingsStore();
