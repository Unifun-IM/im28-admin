import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from '@arco-design/web-react';
import {
  IconDoubleRight,
  IconMenuFold
} from '@arco-design/web-react/icon';
import cs from 'classnames';
import { observer } from 'mobx-react-lite';
import NProgress from 'nprogress';
import qs from 'query-string';

import {
  useGlobalSelector,
  type GlobalState
} from '@entities/global-state';
import { pageTabsStore } from '@entities/page-tabs';
import IconDashboard from '@shared/assets/icon-dashboard.svg?react';
import IconSession from '@shared/assets/icon-session.svg?react';
import IconSystem from '@shared/assets/icon-system.svg?react';
import IconTrade from '@shared/assets/icon-trade.svg?react';
import IconUser from '@shared/assets/icon-user.svg?react';
import Logo from '@shared/assets/logo.svg?react';
import useRoute, { type IRoute } from '@shared/config/routes';
import getUrlParams from '@shared/lib/getUrlParams';
import useLocale from '@shared/lib/useLocale';
import Footer from '@widgets/footer';
import Navbar, { type NavbarBreadcrumbItem } from '@widgets/navbar';
import PageTabs from '@widgets/page-tabs';

import styles from './style/layout.module.less';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const Sider = Layout.Sider;
const Content = Layout.Content;

/** Figma 862:20168：常规 240 / 最小 56；贴边全高，无外边距 */
const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 56;

export type PageLayoutProps = {
  /** 由 app 注入：页面模块发现与懒加载 */
  getFlattenRoutes: (routeList: IRoute[]) => IRoute[];
  /** 由 app 注入：403 页面（避免 widgets → pages） */
  Exception403: React.ComponentType;
  /** 打开用户中心（由 app 挂载 Modal） */
  onOpenUserCenter?: () => void;
};

function getIconFromKey(key: string) {
  switch (key) {
    case 'dashboard':
    case 'dashboard/workplace':
      return <IconDashboard className={styles.icon} />;
    case 'user':
      return <IconUser className={styles.icon} />;
    case 'system':
      return <IconSystem className={styles.icon} />;
    case 'trade':
      return <IconTrade className={styles.icon} />;
    case 'session':
      return <IconSession className={styles.icon} />;
    default:
      return <div className={styles['icon-empty']} />;
  }
}

export const PageLayout = observer(function PageLayout({
  getFlattenRoutes,
  Exception403,
  onOpenUserCenter
}: PageLayoutProps) {
  const urlParams = getUrlParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentComponent = qs.parseUrl(pathname).url.slice(1);
  const locale = useLocale();
  const { settings, userInfo } = useGlobalSelector(
    (state: GlobalState) => state
  );
  const contentFullscreen = pageTabsStore.contentFullscreen;

  const [routes, defaultRoute] = useRoute(userInfo?.permissions || {});
  const defaultSelectedKeys = [currentComponent || defaultRoute];
  const paths = (currentComponent || defaultRoute).split('/');
  const defaultOpenKeys = paths.slice(0, paths.length - 1);

  const [breadcrumb, setBreadCrumb] = useState<NavbarBreadcrumbItem[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(defaultSelectedKeys);
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const routeMap = useRef<Map<string, NavbarBreadcrumbItem[]>>(new Map());
  const menuMap = useRef<Map<string, { menuItem?: boolean; subMenu?: boolean }>>(
    new Map()
  );

  const navbarHeight = 44;
  const pageTabsHeight = 32;
  const headerGap = 10;
  const showNavbar = settings.navbar && urlParams.navbar !== false;
  const showMenu = settings.menu && urlParams.menu !== false;
  const showFooter = settings.footer && urlParams.footer !== false;
  const expandedWidth = settings.menuWidth || EXPANDED_WIDTH;
  const menuWidth = collapsed ? COLLAPSED_WIDTH : expandedWidth;
  /** 侧栏占位：内容全屏时为 0，带动画收起 */
  const siderOccupied = showMenu && !contentFullscreen ? menuWidth : 0;
  const headerHeight = showNavbar
    ? contentFullscreen
      ? pageTabsHeight
      : navbarHeight + headerGap + pageTabsHeight
    : 0;
  const flattenRoutes = useMemo(() => getFlattenRoutes(routes) || [], [routes]);

  /** 按 pathname 同步取标题，避免 breadcrumb 滞后导致 tab 标题闪一下 */
  const pageTabTitle = useMemo(() => {
    const matchRoute = (path: string) =>
      flattenRoutes.find(
        (r) => path === `/${r.key}` || path.startsWith(`/${r.key}/`)
      );

    let route = matchRoute(pathname);
    if (!route) {
      if (pathname.startsWith('/trade/redpacket-detail')) {
        route = matchRoute('/trade/redpacket-detail');
      } else if (pathname.startsWith('/session/chat')) {
        route = matchRoute('/session/chat');
      }
    }
    if (route) return locale[route.name] || route.name;

    if (breadcrumb.length) {
      const last = breadcrumb[breadcrumb.length - 1];
      const name = typeof last === 'string' ? last : last.name;
      return locale[name] || name;
    }
    return pathname;
  }, [breadcrumb, flattenRoutes, locale, pathname]);

  function onClickMenuItem(key: string) {
    const currentRoute = flattenRoutes.find((r) => r.key === key);
    if (!currentRoute?.component) {
      navigate(`/${key}`);
      return;
    }
    const preload = currentRoute.component.preload();
    NProgress.start();
    Promise.resolve(preload).then(() => {
      navigate(currentRoute.path ? currentRoute.path : `/${key}`);
      NProgress.done();
    });
  }

  function toggleCollapse() {
    setCollapsed((value) => !value);
  }

  const paddingLeft = showMenu ? { paddingLeft: siderOccupied } : {};
  const paddingTop = headerHeight ? { paddingTop: headerHeight } : {};
  const paddingStyle = { ...paddingLeft, ...paddingTop };
  const navbarStyle = {
    left: siderOccupied,
    width: siderOccupied ? `calc(100% - ${siderOccupied}px)` : '100%'
  };

  function renderRoutes(localeMap: Record<string, string>) {
    routeMap.current.clear();
    return function travel(
      _routes: IRoute[],
      _level: number,
      parentNode: NavbarBreadcrumbItem[] = []
    ) {
      return _routes.map((route) => {
        const { breadcrumb: showBreadcrumb = true, ignore } = route;
        const iconDom = _level <= 1 ? getIconFromKey(route.key) : null;
        const titleDom = (
          <>
            {iconDom}
            <span>{localeMap[route.name] || route.name}</span>
          </>
        );
        const crumb: NavbarBreadcrumbItem = {
          name: route.name,
          icon: iconDom || undefined
        };

        routeMap.current.set(
          `/${route.key}`,
          showBreadcrumb ? [...parentNode, crumb] : []
        );

        const visibleChildren = (route.children || []).filter((child) => {
          const { ignore: childIgnore, breadcrumb: childBreadcrumb = true } = child;
          if (childIgnore || route.ignore) {
            routeMap.current.set(
              `/${child.key}`,
              childBreadcrumb ? [...parentNode, crumb, { name: child.name }] : []
            );
          }
          return !childIgnore;
        });

        if (ignore) {
          return null;
        }
        if (visibleChildren.length) {
          menuMap.current.set(route.key, { subMenu: true });
          const nextParent =
            showBreadcrumb === false ? parentNode : [...parentNode, crumb];
          return (
            <SubMenu key={route.key} title={titleDom}>
              {travel(visibleChildren, _level + 1, nextParent)}
            </SubMenu>
          );
        }
        menuMap.current.set(route.key, { menuItem: true });
        const label = localeMap[route.name] || route.name;
        return (
          <MenuItem key={route.key} renderItemInTooltip={() => label}>
            {titleDom}
          </MenuItem>
        );
      });
    };
  }

  function updateMenuStatus() {
    const pathKeys = pathname.split('/');
    const newSelectedKeys: string[] = [];
    const newOpenKeys: string[] = [...openKeys];
    while (pathKeys.length > 0) {
      const currentRouteKey = pathKeys.join('/');
      const menuKey = currentRouteKey.replace(/^\//, '');
      const menuType = menuMap.current.get(menuKey);
      if (menuType?.menuItem) {
        newSelectedKeys.push(menuKey);
      }
      if (menuType?.subMenu && !newOpenKeys.includes(menuKey)) {
        newOpenKeys.push(menuKey);
      }
      pathKeys.pop();
    }
    // detail pages: highlight parent list
    if (!newSelectedKeys.length) {
      if (pathname.startsWith('/trade/redpacket-detail')) {
        newSelectedKeys.push('trade/redpacket-records');
      }
      if (pathname.startsWith('/session/chat')) {
        newSelectedKeys.push('session/user');
      }
    }

    // 打开选中项的祖先 SubMenu（如 user/manage）
    const collectAncestors = (
      list: IRoute[],
      target: string,
      trail: string[] = []
    ): string[] | null => {
      for (const route of list) {
        if (route.key === target) return trail;
        if (route.children?.length) {
          const found = collectAncestors(route.children, target, [
            ...trail,
            route.key
          ]);
          if (found) return found;
        }
      }
      return null;
    };
    const selected = newSelectedKeys[0];
    if (selected) {
      const ancestors = collectAncestors(routes, selected);
      ancestors?.forEach((key) => {
        if (!newOpenKeys.includes(key)) newOpenKeys.push(key);
      });
    }

    setSelectedKeys(newSelectedKeys);
    setOpenKeys(newOpenKeys);
  }

  useEffect(() => {
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    let routeConfig = routeMap.current.get(pathname);
    if (!routeConfig) {
      // 动态详情页：/trade/redpacket-detail/:id 等
      const prefixes = [
        '/trade/redpacket-detail',
        '/session/chat'
      ];
      for (const prefix of prefixes) {
        if (pathname.startsWith(prefix)) {
          routeConfig = routeMap.current.get(prefix);
          break;
        }
      }
    }
    setBreadCrumb(routeConfig || []);
    updateMenuStatus();
  }, [pathname]);

  return (
    <Layout className={styles.layout}>
      <div
        className={cs(styles['layout-navbar'], {
          [styles['layout-navbar-hidden']]: !showNavbar,
          [styles['layout-navbar-content-fullscreen']]:
            showNavbar && contentFullscreen,
          [styles['layout-navbar-scrolled']]: headerScrolled
        })}
        style={navbarStyle}
      >
        <div className={styles['layout-navbar-main']}>
          <Navbar
            show={showNavbar}
            breadcrumb={breadcrumb}
            onOpenUserCenter={onOpenUserCenter}
          />
        </div>
        {showNavbar ? <PageTabs title={pageTabTitle} /> : null}
      </div>
      <Layout>
          {showMenu && (
            <Sider
              breakpoint="xl"
              className={cs(styles['layout-sider'], {
                [styles['layout-sider-content-fullscreen']]: contentFullscreen
              })}
              collapsed={collapsed}
              collapsedWidth={contentFullscreen ? 0 : COLLAPSED_WIDTH}
              collapsible
              onCollapse={setCollapsed}
              trigger={null}
              width={contentFullscreen ? 0 : menuWidth}
            >
              <div
                className={cs(styles['sider-logo'], {
                  [styles['sider-logo-collapsed']]: collapsed
                })}
              >
                <Logo />
                {!collapsed && <span>后台管理系统</span>}
              </div>
              <div className={styles['menu-wrapper']}>
                <Menu
                  className={styles.sideMenu}
                  collapse={collapsed}
                  onClickMenuItem={onClickMenuItem}
                  onClickSubMenu={(_, keys) => setOpenKeys(keys)}
                  openKeys={openKeys}
                  selectedKeys={selectedKeys}
                >
                  {renderRoutes(locale)(routes, 1)}
                </Menu>
              </div>
              <div className={styles['collapse-btn']} onClick={toggleCollapse}>
                {collapsed ? <IconDoubleRight /> : <IconMenuFold />}
              </div>
            </Sider>
          )}
          <Layout
            className={styles['layout-content']}
            style={paddingStyle}
            data-layout-content
          >
            <div className={styles['layout-content-wrapper']}>
              <Content>
                <Routes>
                  {flattenRoutes.map((route) => (
                    <Route
                      element={<route.component />}
                      key={route.key}
                      path={route.path || `/${route.key}`}
                    />
                  ))}
                  <Route
                    element={<Navigate replace to={`/${defaultRoute}`} />}
                    path="/"
                  />
                  <Route element={<Exception403 />} path="*" />
                </Routes>
              </Content>
            </div>
            {showFooter && <Footer />}
          </Layout>
        </Layout>
    </Layout>
  );
});
