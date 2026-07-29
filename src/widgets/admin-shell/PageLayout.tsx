import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Breadcrumb, Layout, Menu, Spin } from '@arco-design/web-react';
import {
  IconDashboard,
  IconMenuFold,
  IconMenuUnfold,
  IconTag
} from '@arco-design/web-react/icon';
import cs from 'classnames';
import NProgress from 'nprogress';
import qs from 'query-string';

import { type GlobalState } from '@entities/global-state';
import useRoute, { type IRoute } from '@shared/config/routes';
import { isArray } from '@shared/lib/is';
import getUrlParams from '@shared/lib/getUrlParams';
import lazyload from '@shared/lib/lazyload';
import { useSelector } from '@shared/lib/redux-compat';
import useLocale from '@shared/lib/useLocale';
import Footer from '@widgets/footer';
import Navbar from '@widgets/navbar';

import styles from './style/layout.module.less';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;
const Sider = Layout.Sider;
const Content = Layout.Content;

const Exception403 = lazyload(() => import('@pages/exception/403'));

function getIconFromKey(key: string) {
  switch (key) {
    case 'dashboard':
      return <IconDashboard className={styles.icon} />;
    case 'example':
      return <IconTag className={styles.icon} />;
    default:
      return <div className={styles['icon-empty']} />;
  }
}

function getFlattenRoutes(routeList: IRoute[]) {
  const mod = import.meta.glob(['../../pages/dashboard/**/index.tsx','../../pages/example/**/index.tsx','../../pages/exception/**/index.tsx']);
  const res: IRoute[] = [];

  function travel(_routes: IRoute[]) {
    _routes.forEach((route) => {
      if (route.key && !route.children) {
        const loader = mod[`../../pages/${route.key}/index.tsx`];
        if (loader) {
          route.component = lazyload(loader);
          res.push(route);
        }
      } else if (isArray(route.children) && route.children?.length) {
        travel(route.children);
      }
    });
  }

  travel(routeList);
  return res;
}

export function PageLayout() {
  const urlParams = getUrlParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentComponent = qs.parseUrl(pathname).url.slice(1);
  const locale = useLocale();
  const { settings, userLoading, userInfo } = useSelector(
    (state: GlobalState) => state
  );

  const [routes, defaultRoute] = useRoute(userInfo?.permissions || {});
  const defaultSelectedKeys = [currentComponent || defaultRoute];
  const paths = (currentComponent || defaultRoute).split('/');
  const defaultOpenKeys = paths.slice(0, paths.length - 1);

  const [breadcrumb, setBreadCrumb] = useState<React.ReactNode[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(defaultSelectedKeys);
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);

  const routeMap = useRef<Map<string, React.ReactNode[]>>(new Map());
  const menuMap = useRef<Map<string, { menuItem?: boolean; subMenu?: boolean }>>(
    new Map()
  );

  const navbarHeight = 60;
  const menuWidth = collapsed ? 48 : settings.menuWidth;
  const showNavbar = settings.navbar && urlParams.navbar !== false;
  const showMenu = settings.menu && urlParams.menu !== false;
  const showFooter = settings.footer && urlParams.footer !== false;
  const flattenRoutes = useMemo(() => getFlattenRoutes(routes) || [], [routes]);

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

  const paddingLeft = showMenu ? { paddingLeft: menuWidth } : {};
  const paddingTop = showNavbar ? { paddingTop: navbarHeight } : {};
  const paddingStyle = { ...paddingLeft, ...paddingTop };

  function renderRoutes(localeMap: Record<string, string>) {
    routeMap.current.clear();
    return function travel(
      _routes: IRoute[],
      _level: number,
      parentNode: React.ReactNode[] = []
    ) {
      return _routes.map((route) => {
        const { breadcrumb: showBreadcrumb = true, ignore } = route;
        const iconDom = getIconFromKey(route.key);
        const titleDom = (
          <>
            {iconDom} {localeMap[route.name] || route.name}
          </>
        );

        routeMap.current.set(
          `/${route.key}`,
          showBreadcrumb ? [...parentNode, route.name] : []
        );

        const visibleChildren = (route.children || []).filter((child) => {
          const { ignore: childIgnore, breadcrumb: childBreadcrumb = true } = child;
          if (childIgnore || route.ignore) {
            routeMap.current.set(
              `/${child.key}`,
              childBreadcrumb ? [...parentNode, route.name, child.name] : []
            );
          }
          return !childIgnore;
        });

        if (ignore) {
          return null;
        }
        if (visibleChildren.length) {
          menuMap.current.set(route.key, { subMenu: true });
          return (
            <SubMenu key={route.key} title={titleDom}>
              {travel(visibleChildren, _level + 1, [...parentNode, route.name])}
            </SubMenu>
          );
        }
        menuMap.current.set(route.key, { menuItem: true });
        return <MenuItem key={route.key}>{titleDom}</MenuItem>;
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
      if (menuType?.subMenu && !openKeys.includes(menuKey)) {
        newOpenKeys.push(menuKey);
      }
      pathKeys.pop();
    }
    setSelectedKeys(newSelectedKeys);
    setOpenKeys(newOpenKeys);
  }

  useEffect(() => {
    const routeConfig = routeMap.current.get(pathname);
    setBreadCrumb(routeConfig || []);
    updateMenuStatus();
  }, [pathname]);

  return (
    <Layout className={styles.layout}>
      <div
        className={cs(styles['layout-navbar'], {
          [styles['layout-navbar-hidden']]: !showNavbar
        })}
      >
        <Navbar show={showNavbar} />
      </div>
      {userLoading ? (
        <Spin className={styles.spin} />
      ) : (
        <Layout>
          {showMenu && (
            <Sider
              breakpoint="xl"
              className={styles['layout-sider']}
              collapsed={collapsed}
              collapsible
              onCollapse={setCollapsed}
              style={paddingTop}
              trigger={null}
              width={menuWidth}
            >
              <div className={styles['menu-wrapper']}>
                <Menu
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
                {collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
              </div>
            </Sider>
          )}
          <Layout className={styles['layout-content']} style={paddingStyle}>
            <div className={styles['layout-content-wrapper']}>
              {!!breadcrumb.length && (
                <div className={styles['layout-breadcrumb']}>
                  <Breadcrumb>
                    {breadcrumb.map((node, index) => (
                      <Breadcrumb.Item key={index}>
                        {typeof node === 'string' ? locale[node] || node : node}
                      </Breadcrumb.Item>
                    ))}
                  </Breadcrumb>
                </div>
              )}
              <Content>
                <Routes>
                  {flattenRoutes.map((route) => (
                    <Route
                      element={<route.component />}
                      key={route.key}
                      path={`/${route.key}`}
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
      )}
    </Layout>
  );
}
