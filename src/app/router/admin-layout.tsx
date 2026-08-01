import { useState } from 'react';

import { UserCenterModal } from '@features/user-center';
import { PageLayout } from '@widgets/admin-shell';

import { Exception403, getFlattenRoutes } from './get-flatten-routes';

/** app 组合层：注入页面路由发现，并挂载用户中心 Modal */
export function AdminLayout() {
  const [userCenterVisible, setUserCenterVisible] = useState(false);

  return (
    <>
      <PageLayout
        Exception403={Exception403}
        getFlattenRoutes={getFlattenRoutes}
        onOpenUserCenter={() => setUserCenterVisible(true)}
      />
      <UserCenterModal
        visible={userCenterVisible}
        onCancel={() => setUserCenterVisible(false)}
      />
    </>
  );
}
