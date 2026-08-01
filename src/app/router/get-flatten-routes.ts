import type { IRoute } from '@shared/config/routes';
import { isArray } from '@shared/lib/is';
import lazyload from '@shared/lib/lazyload';

/** 页面模块发现（仅允许在 app 层引用 @pages） */
const pageModules = import.meta.glob([
  '../../pages/dashboard/index.tsx',
  '../../pages/user/**/index.tsx',
  '../../pages/group/**/index.tsx',
  '../../pages/system/**/index.tsx',
  '../../pages/system-params/**/index.tsx',
  '../../pages/trade/**/index.tsx',
  '../../pages/session/**/index.tsx',
  '../../pages/risk/**/index.tsx',
  '../../pages/exception/**/index.tsx'
]);

export const Exception403 = lazyload(() => import('@pages/exception/403'));

/** 将路由树扁平化为带懒加载组件的叶子路由 */
export function getFlattenRoutes(routeList: IRoute[]) {
  const res: IRoute[] = [];

  function travel(_routes: IRoute[]) {
    _routes.forEach((route) => {
      if (route.key && !route.children) {
        const loader = pageModules[`../../pages/${route.key}/index.tsx`];
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
