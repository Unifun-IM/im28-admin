import { makeAutoObservable } from 'mobx';

export type PageTabItem = {
  /** 路由唯一键，通常为 pathname */
  path: string;
  /** 展示标题（已本地化或 locale key） */
  title: string;
  /** 是否可关闭，默认 true */
  closable?: boolean;
};

const STORAGE_KEY = 'im-admin-page-tabs';

function loadTabs(): PageTabItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PageTabItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTabs(tabs: PageTabItem[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch {
    // ignore quota
  }
}

export class PageTabsStore {
  tabs: PageTabItem[] = loadTabs();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  open(tab: PageTabItem) {
    const exists = this.tabs.find((t) => t.path === tab.path);
    if (exists) {
      if (exists.title !== tab.title) {
        exists.title = tab.title;
        saveTabs(this.tabs);
      }
      return;
    }
    this.tabs.push({
      ...tab,
      closable: tab.closable !== false
    });
    saveTabs(this.tabs);
  }

  close(path: string): string | null {
    const index = this.tabs.findIndex((t) => t.path === path);
    if (index < 0) return null;
    const target = this.tabs[index];
    if (target.closable === false) return null;
    if (this.tabs.length <= 1) return null;

    this.tabs.splice(index, 1);
    saveTabs(this.tabs);

    // 返回建议跳转的 path（关闭后由调用方判断是否跳转）
    const next = this.tabs[Math.max(0, index - 1)] || this.tabs[0];
    return next?.path ?? null;
  }

  closeOthers(path: string) {
    this.tabs = this.tabs.filter(
      (t) => t.path === path || t.closable === false
    );
    saveTabs(this.tabs);
  }

  closeAll() {
    const pinned = this.tabs.filter((t) => t.closable === false);
    this.tabs = pinned.length ? pinned : this.tabs.slice(0, 1);
    saveTabs(this.tabs);
    return this.tabs[0]?.path ?? null;
  }

  reorder(from: number, to: number) {
    if (from === to || from < 0 || to < 0) return;
    if (from >= this.tabs.length || to >= this.tabs.length) return;
    const [item] = this.tabs.splice(from, 1);
    this.tabs.splice(to, 0, item);
    saveTabs(this.tabs);
  }
}

export const pageTabsStore = new PageTabsStore();
