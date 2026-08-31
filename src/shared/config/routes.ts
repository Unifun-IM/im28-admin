import { useMemo } from 'react';

import auth, { type AuthParams } from '@shared/lib/authentication';

export type IRoute = AuthParams & {
  name: string;
  key: string;
  breadcrumb?: boolean;
  children?: IRoute[];
  ignore?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: any;
  path?: string;
};

/**
 * 脚手架默认菜单：首页看板 → 业务菜单扩展位 → 系统。
 * 未提供产品导航结构时，派生项目的业务一级菜单插在 system 之前，
 * 使系统管理保持左侧导航最后一组。
 */
export const routes: IRoute[] = [
  {
    name: 'menu.dashboard',
    key: 'dashboard'
  },
  // 默认末位分组；产品导航或 PRD 明确顺序时按其要求调整。
  {
    name: 'menu.system',
    key: 'system',
    children: [
      { name: 'menu.system.accounts', key: 'system/accounts' },
      { name: 'menu.system.roles', key: 'system/roles' },
      {
        name: 'menu.system.paramsSettings',
        key: 'system-params/settings'
      },
      { name: 'menu.system.opLogs', key: 'system/op-logs' }
    ]
  }
];

export const DEFAULT_ROUTE = 'dashboard';

export const getName = (path: string, routeList: IRoute[] = routes): string | undefined => {
  for (const item of routeList) {
    const itemPath = `/${item.key}`;
    if (path === itemPath) {
      return item.name;
    }
    if (item.children) {
      const childName = getName(path, item.children);
      if (childName) return childName;
    }
  }
  return undefined;
};

/**
 * 按 pathname 取最长匹配路由的 locale key（支持带 path 参数的叶子路由）
 */
export const getRouteNameByPath = (
  path: string,
  routeList: IRoute[] = routes
): string | undefined => {
  const exact = getName(path, routeList);
  if (exact) return exact;

  let best: { name: string; len: number } | undefined;
  const walk = (list: IRoute[]) => {
    for (const item of list) {
      const itemPath = `/${item.key}`;
      if (path === itemPath || path.startsWith(`${itemPath}/`)) {
        if (!best || item.key.length > best.len) {
          best = { name: item.name, len: item.key.length };
        }
      }
      if (item.children?.length) walk(item.children);
    }
  };
  walk(routeList);
  return best?.name;
};

export const generatePermission = (role: string) => {
  const actions = role === 'admin' ? ['*'] : ['read'];
  const result: Record<string, string[]> = {};
  const walk = (list: IRoute[]) => {
    list.forEach((item) => {
      if (item.children?.length) {
        walk(item.children);
      } else if (!item.ignore) {
        result[item.name] = actions;
      }
    });
  };
  walk(routes);
  return result;
};

function filterRoutes(
  routeList: IRoute[],
  userPermission: Record<string, string[]>,
  result: IRoute[] = []
): IRoute[] {
  for (const route of routeList) {
    const { requiredPermissions, oneOfPerm } = route;
    const visible = requiredPermissions
      ? auth({ requiredPermissions, oneOfPerm }, userPermission)
      : true;
    if (!visible) continue;

    if (route.children?.length) {
      const children = filterRoutes(route.children, userPermission);
      if (children.length) result.push({ ...route, children });
    } else {
      result.push({ ...route });
    }
  }
  return result;
}

const useRoute = (userPermission: Record<string, string[]>): [IRoute[], string] => {
  const permissionRoute = useMemo(
    () => filterRoutes(routes, userPermission),
    [userPermission]
  );

  const defaultRoute = useMemo(() => {
    const hasKey = (list: IRoute[], key: string): boolean =>
      list.some(
        (r) =>
          r.key === key || (r.children ? hasKey(r.children, key) : false)
      );
    if (hasKey(permissionRoute, DEFAULT_ROUTE)) return DEFAULT_ROUTE;
    const firstLeaf = (list: IRoute[]): string | undefined => {
      for (const r of list) {
        if (r.children?.length) {
          const leaf = firstLeaf(r.children);
          if (leaf) return leaf;
        } else if (!r.ignore) {
          return r.key;
        }
      }
      return undefined;
    };
    return firstLeaf(permissionRoute) || DEFAULT_ROUTE;
  }, [permissionRoute]);

  return [permissionRoute, defaultRoute];
};

export default useRoute;
