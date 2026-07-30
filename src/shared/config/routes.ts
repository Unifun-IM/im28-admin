import { useEffect, useMemo, useState } from 'react';

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
 * 侧栏顺序对齐稿面：首页看板 → 用户 → 会话 → 交易 → 系统
 * 系统下：后台账号 / 角色 / 系统参数设置 / 系统操作日志
 */
export const routes: IRoute[] = [
  {
    name: 'menu.dashboard',
    key: 'dashboard/workplace'
  },
  {
    name: 'menu.user',
    key: 'user',
    children: [
      {
        name: 'menu.user.manage',
        key: 'user/manage',
        breadcrumb: false,
        children: [
          { name: 'menu.user.query', key: 'user/query' },
          { name: 'menu.user.blacklist', key: 'user/blacklist' },
          { name: 'menu.user.whitelist', key: 'user/whitelist' }
        ]
      },
      { name: 'menu.user.inviteCode', key: 'user/invite-code' },
      { name: 'menu.user.logs', key: 'user/logs' }
    ]
  },
  {
    name: 'menu.session',
    key: 'session',
    children: [
      {
        name: 'menu.session.query',
        key: 'session/query',
        breadcrumb: false,
        children: [
          { name: 'menu.session.group', key: 'session/group' },
          { name: 'menu.session.user', key: 'session/user' }
        ]
      },
      {
        name: 'menu.session.settings',
        key: 'session/settings',
        breadcrumb: false,
        children: [
          {
            name: 'menu.session.settings.group',
            key: 'session/settings/group'
          },
          {
            name: 'menu.session.settings.user',
            key: 'session/settings/user'
          }
        ]
      },
      {
        name: 'menu.session.chat',
        key: 'session/chat',
        ignore: true,
        path: '/session/chat/:type/:id'
      }
    ]
  },
  {
    name: 'menu.trade',
    key: 'trade',
    children: [
      { name: 'menu.trade.redpacketRecords', key: 'trade/redpacket-records' },
      { name: 'menu.trade.redpacketConfig', key: 'trade/redpacket-config' },
      {
        name: 'menu.trade.redpacketDetail',
        key: 'trade/redpacket-detail',
        ignore: true,
        path: '/trade/redpacket-detail/:id'
      }
    ]
  },
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

export const DEFAULT_ROUTE = 'user/query';

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

const useRoute = (userPermission: Record<string, string[]>): [IRoute[], string] => {
  const filterRoute = (routeList: IRoute[], arr: IRoute[] = []): IRoute[] => {
    if (!routeList.length) {
      return [];
    }
    for (const route of routeList) {
      const { requiredPermissions, oneOfPerm } = route;
      let visible = true;
      if (requiredPermissions) {
        visible = auth({ requiredPermissions, oneOfPerm }, userPermission);
      }

      if (!visible) {
        continue;
      }
      if (route.children && route.children.length) {
        const newRoute = { ...route, children: [] as IRoute[] };
        filterRoute(route.children, newRoute.children);
        if (newRoute.children.length) {
          arr.push(newRoute);
        }
      } else {
        arr.push({ ...route });
      }
    }

    return arr;
  };

  const [permissionRoute, setPermissionRoute] = useState(routes);

  useEffect(() => {
    const newRoutes = filterRoute(routes);
    setPermissionRoute(newRoutes);
  }, [JSON.stringify(userPermission)]);

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
