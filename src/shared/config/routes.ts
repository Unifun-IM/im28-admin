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

export const routes: IRoute[] = [
  {
    name: 'menu.dashboard',
    key: 'dashboard',
    children: [
      {
        name: 'menu.dashboard.workplace',
        key: 'dashboard/workplace'
      }
    ]
  },
  {
    name: 'Example',
    key: 'example'
  }
];

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
  routes.forEach((item) => {
    if (item.children) {
      item.children.forEach((child) => {
        result[child.name] = actions;
      });
    } else {
      result[item.name] = actions;
    }
  });
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
    const first = permissionRoute[0];
    if (first) {
      return first?.children?.[0]?.key || first.key;
    }
    return ''
  }, [permissionRoute]);

  return [permissionRoute, defaultRoute];
};

export default useRoute;
