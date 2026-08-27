import React, { useContext, useEffect } from 'react';
import { Dropdown, Menu, Message, Tabs, Tooltip } from '@arco-design/web-react';
import {
  IconClose,
  IconExpand,
  IconPushpin,
  IconShrink
} from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import cs from 'classnames';
import './page-tabs.less';

import { MAX_PINNED_TABS, pageTabsStore } from '@entities/page-tabs';
import { getRouteNameByPath } from '@shared/config/routes';
import { GlobalContext } from '@shared/lib/global-context';
import useLocale from '@shared/lib/useLocale';

const TabPane = Tabs.TabPane;
const MenuItem = Menu.Item;

export type PageTabsProps = {
  /** 当前路由标题（已本地化） */
  title: string;
  /** 是否允许关闭当前标签，默认 true */
  closable?: boolean;
  /** 最多可固定标签数，默认 3 */
  maxPinned?: number;
  className?: string;
};

type ContextAction =
  | 'closeOthers'
  | 'closeLeft'
  | 'closeRight'
  | 'closeAll'
  | 'pin'
  | 'unpin';

function resolveTabTitle(
  path: string,
  locale: Record<string, string>,
  fallback?: string
) {
  const key = getRouteNameByPath(path);
  if (key && locale[key]) return locale[key];
  return fallback || path;
}

/**
 * 页面打开记录快捷导航 — Figma 741:29115
 * 支持固定标签（默认最多 3）、右键菜单与壳层全屏（隐藏侧栏/Navbar，保留本栏）
 */
export function PageTabs({
  title,
  closable = true,
  maxPinned = MAX_PINNED_TABS,
  className
}: PageTabsProps) {
  const t = useLocale();
  const { lang } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const fullscreen = pageTabsStore.chromeFullscreen;

  useEffect(() => {
    pageTabsStore.setMaxPinned(maxPinned);
  }, [maxPinned]);

  useEffect(() => {
    if (!pathname || pathname === '/login') return;
    pageTabsStore.open({
      path: pathname,
      title: title || resolveTabTitle(pathname, t) || pathname,
      closable
    });
  }, [pathname, title, closable, t]);

  // 切换语言后同步所有已打开标签标题
  useEffect(() => {
    pageTabsStore.relocalizeTitles((path, prev) =>
      resolveTabTitle(path, t, prev)
    );
  }, [lang, t]);

  const tabs = pageTabsStore.tabs;

  function ensureActive(nextPath: string | null | undefined) {
    if (nextPath && nextPath !== pathname) navigate(nextPath);
  }

  function onSelect(path: string) {
    if (path !== pathname) navigate(path);
  }

  function onDeleteTab(path: string) {
    const tab = tabs.find((item) => item.path === path);
    if (!tab || tab.pinned || tab.closable === false) return;
    const next = pageTabsStore.close(path);
    if (path === pathname && next) navigate(next);
  }

  function runContextAction(action: ContextAction, path: string) {
    switch (action) {
      case 'pin': {
        const ok = pageTabsStore.pin(path);
        if (!ok) {
          Message.warning(
            t['pageTabs.pinMax'].replace(
              '{n}',
              String(pageTabsStore.maxPinned)
            )
          );
        }
        break;
      }
      case 'unpin':
        pageTabsStore.unpin(path);
        break;
      case 'closeOthers':
        pageTabsStore.closeOthers(path);
        if (pathname !== path) navigate(path);
        break;
      case 'closeLeft':
        pageTabsStore.closeLeft(path);
        break;
      case 'closeRight':
        pageTabsStore.closeRight(path);
        break;
      case 'closeAll': {
        const next = pageTabsStore.closeAll();
        if (next) ensureActive(next);
        break;
      }
      default:
        break;
    }
  }

  function renderContextMenu(path: string) {
    const tab = tabs.find((item) => item.path === path);
    const index = tabs.findIndex((item) => item.path === path);

    return (
      <Menu
        className="use-page-tabs-context-menu"
        onClickMenuItem={(key) => runContextAction(key as ContextAction, path)}
      >
        {tab?.pinned ? (
          <MenuItem key="unpin">{t['pageTabs.unpin']}</MenuItem>
        ) : (
          <MenuItem key="pin">{t['pageTabs.pin']}</MenuItem>
        )}
        <MenuItem key="closeOthers">{t['pageTabs.closeOthers']}</MenuItem>
        <MenuItem key="closeLeft" disabled={index <= 0}>
          {t['pageTabs.closeLeft']}
        </MenuItem>
        <MenuItem key="closeRight" disabled={index >= tabs.length - 1}>
          {t['pageTabs.closeRight']}
        </MenuItem>
        <MenuItem key="closeAll">{t['pageTabs.closeAll']}</MenuItem>
      </Menu>
    );
  }

  if (!tabs.length) return null;

  const extra = (
    <div className="use-page-tabs-actions">
      <Tooltip
        content={
          fullscreen
            ? t['pageTabs.exitFullscreen']
            : t['pageTabs.fullscreen']
        }
      >
        <button
          type="button"
          className="use-page-tabs-action-btn"
          aria-pressed={fullscreen}
          onClick={() => pageTabsStore.toggleChromeFullscreen()}
        >
          {fullscreen ? <IconShrink /> : <IconExpand />}
        </button>
      </Tooltip>
    </div>
  );

  return (
    <Tabs
      className={cs('use-page-tabs', className)}
      type="card-gutter"
      size="default"
      overflow="scroll"
      editable
      showAddButton={false}
      animation={false}
      scrollPosition="auto"
      activeTab={pathname}
      onChange={onSelect}
      onDeleteTab={onDeleteTab}
      extra={extra}
      icons={{ delete: <IconClose /> }}
    >
      {tabs.map((tab) => {
        const showCloseSlot = tabs.length > 1;
        const label = resolveTabTitle(tab.path, t, tab.title);
        const titleNode = (
          <Dropdown
            trigger="contextMenu"
            position="bl"
            droplist={renderContextMenu(tab.path)}
            triggerProps={{ updateOnScroll: false }}
          >
            <span
              className={cs('use-page-tab-title', {
                'is-pinned': tab.pinned
              })}
            >
              {tab.pinned ? (
                <IconPushpin className="use-page-tab-pin" />
              ) : null}
              <span className="use-page-tab-title-text">{label}</span>
            </span>
          </Dropdown>
        );

        return (
          <TabPane
            key={tab.path}
            title={titleNode}
            /* 固定签也占关闭位，由 CSS 隐藏 ×，避免切换宽度跳动 */
            closable={showCloseSlot}
          />
        );
      })}
    </Tabs>
  );
}

const ObservedPageTabs = observer(PageTabs);

export default ObservedPageTabs;
