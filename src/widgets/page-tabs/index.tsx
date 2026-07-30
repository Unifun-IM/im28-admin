import React, { useEffect } from 'react';
import { Space, Tabs, Tooltip } from '@arco-design/web-react';
import {
  IconClose,
  IconExpand,
  IconShrink
} from '@arco-design/web-react/icon';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import cs from 'classnames';

import { pageTabsStore } from '@entities/page-tabs';
import useLocale from '@shared/lib/useLocale';

const TabPane = Tabs.TabPane;

export type PageTabsProps = {
  /** 当前路由标题（已本地化） */
  title: string;
  /** 是否允许关闭当前标签，默认 true */
  closable?: boolean;
  className?: string;
};

/**
 * 页面打开记录快捷导航 — Figma 741:29115
 * 基于 Arco Tabs（overflow=scroll 自带左右箭头）；视觉由 .use-page-tabs 覆盖
 * 「全屏」= 隐藏侧栏 + 顶部 Navbar（状态在 pageTabsStore.contentFullscreen）
 */
function PageTabs({ title, closable = true, className }: PageTabsProps) {
  const t = useLocale();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const fullscreen = pageTabsStore.contentFullscreen;

  useEffect(() => {
    if (!pathname || pathname === '/login') return;
    pageTabsStore.open({
      path: pathname,
      title: title || pathname,
      closable
    });
  }, [pathname, title, closable]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') pageTabsStore.setContentFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullscreen]);

  const tabs = pageTabsStore.tabs;

  function onSelect(path: string) {
    if (path !== pathname) navigate(path);
  }

  function onDeleteTab(path: string) {
    const tab = tabs.find((item) => item.path === path);
    if (!tab || tab.closable === false) return;
    const next = pageTabsStore.close(path);
    if (path === pathname && next) navigate(next);
  }

  if (!tabs.length) return null;

  const extra = (
    <Space className="use-page-tabs-actions" size={12}>
      <Tooltip
        content={
          fullscreen
            ? t['pageTabs.exitFullscreen'] || '退出全屏'
            : t['pageTabs.fullscreen'] || '全屏'
        }
      >
        <button
          type="button"
          className="use-page-tabs-action-btn"
          aria-pressed={fullscreen}
          onClick={() => pageTabsStore.toggleContentFullscreen()}
        >
          {fullscreen ? <IconShrink /> : <IconExpand />}
        </button>
      </Tooltip>
    </Space>
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
      {tabs.map((tab) => (
        <TabPane
          key={tab.path}
          title={<span className="use-page-tab-title">{tab.title}</span>}
          closable={tab.closable !== false && tabs.length > 1}
        />
      ))}
    </Tabs>
  );
}

export default observer(PageTabs);
