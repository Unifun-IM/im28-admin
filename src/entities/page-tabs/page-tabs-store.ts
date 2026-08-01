import { makeAutoObservable } from 'mobx';

export type PageTabItem = {
  /** 路由唯一键，通常为 pathname */
  path: string;
  /** 展示标题（已本地化或 locale key） */
  title: string;
  /** 是否可关闭，默认 true；固定标签视为不可关闭 */
  closable?: boolean;
  /** 是否固定（靠左，默认最多 MAX_PINNED_TABS 个） */
  pinned?: boolean;
};

/** 默认可固定标签数量上限 */
export const MAX_PINNED_TABS = 3;

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

function isCloseable(tab: PageTabItem) {
  return tab.pinned !== true && tab.closable !== false;
}

export class PageTabsStore {
  tabs: PageTabItem[] = loadTabs();
  /**
   * 壳层全屏（PageTabs 按钮）：隐藏侧栏与 Navbar，保留 PageTabs
   */
  chromeFullscreen = false;
  /**
   * 表格全屏（列表工具栏按钮）：隐藏侧栏、Navbar、PageTabs，列表仅保留表格
   */
  tableFullscreen = false;
  /** 固定标签上限，默认 3 */
  maxPinned = MAX_PINNED_TABS;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  get pinnedCount() {
    return this.tabs.filter((t) => t.pinned).length;
  }

  /** 任一全屏都会收起侧栏 / Navbar */
  get hideChrome() {
    return this.chromeFullscreen || this.tableFullscreen;
  }

  setChromeFullscreen(value: boolean) {
    this.chromeFullscreen = value;
  }

  toggleChromeFullscreen() {
    this.chromeFullscreen = !this.chromeFullscreen;
  }

  setTableFullscreen(value: boolean) {
    this.tableFullscreen = value;
  }

  toggleTableFullscreen() {
    this.tableFullscreen = !this.tableFullscreen;
  }

  /** Esc：优先退出表格全屏，再退出壳层全屏 */
  exitFullscreen() {
    if (this.tableFullscreen) {
      this.tableFullscreen = false;
      return;
    }
    if (this.chromeFullscreen) {
      this.chromeFullscreen = false;
    }
  }

  setMaxPinned(n: number) {
    if (n < 0) return;
    this.maxPinned = n;
  }

  open(tab: PageTabItem) {
    const exists = this.tabs.find((t) => t.path === tab.path);
    if (exists) {
      // 切换瞬间 title 可能短暂落到 pathname，避免覆盖已有展示标题导致宽度跳动
      const nextTitle = tab.title;
      const isFallback = !nextTitle || nextTitle === tab.path;
      if (!isFallback && exists.title !== nextTitle) {
        exists.title = nextTitle;
        saveTabs(this.tabs);
      }
      return;
    }
    this.tabs.push({
      ...tab,
      closable: tab.closable !== false,
      pinned: tab.pinned === true
    });
    saveTabs(this.tabs);
  }

  /** 固定标签；已达上限时返回 false */
  pin(path: string): boolean {
    const index = this.tabs.findIndex((t) => t.path === path);
    if (index < 0) return false;
    const tab = this.tabs[index];
    if (tab.pinned) return true;
    if (this.pinnedCount >= this.maxPinned) return false;

    tab.pinned = true;
    this.tabs.splice(index, 1);
    const insertAt = this.tabs.filter((t) => t.pinned).length;
    this.tabs.splice(insertAt, 0, tab);
    saveTabs(this.tabs);
    return true;
  }

  unpin(path: string) {
    const index = this.tabs.findIndex((t) => t.path === path);
    if (index < 0) return;
    const tab = this.tabs[index];
    if (!tab.pinned) return;

    tab.pinned = false;
    this.tabs.splice(index, 1);
    const insertAt = this.tabs.filter((t) => t.pinned).length;
    this.tabs.splice(insertAt, 0, tab);
    saveTabs(this.tabs);
  }

  close(path: string): string | null {
    const index = this.tabs.findIndex((t) => t.path === path);
    if (index < 0) return null;
    const target = this.tabs[index];
    if (!isCloseable(target)) return null;
    if (this.tabs.length <= 1) return null;

    this.tabs.splice(index, 1);
    saveTabs(this.tabs);

    const next = this.tabs[Math.max(0, index - 1)] || this.tabs[0];
    return next?.path ?? null;
  }

  closeOthers(path: string) {
    this.tabs = this.tabs.filter(
      (t) => t.path === path || t.pinned === true || t.closable === false
    );
    saveTabs(this.tabs);
  }

  closeLeft(path: string) {
    const index = this.tabs.findIndex((t) => t.path === path);
    if (index <= 0) return;
    this.tabs = this.tabs.filter(
      (t, i) => i >= index || !isCloseable(t)
    );
    saveTabs(this.tabs);
  }

  closeRight(path: string) {
    const index = this.tabs.findIndex((t) => t.path === path);
    if (index < 0 || index >= this.tabs.length - 1) return;
    this.tabs = this.tabs.filter(
      (t, i) => i <= index || !isCloseable(t)
    );
    saveTabs(this.tabs);
  }

  closeAll() {
    const pinned = this.tabs.filter((t) => t.pinned || t.closable === false);
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
