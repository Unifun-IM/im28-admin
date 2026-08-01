import { comparer, reaction } from 'mobx';
import { useEffect, useState } from 'react';

import {
  globalStore,
  type GlobalState,
  type UserInfo
} from './global-store';

type UpdateSettingsAction = {
  type: 'update-settings';
  payload: { settings: GlobalState['settings'] };
};

type UpdateUserInfoAction = {
  type: 'update-userInfo';
  payload: { userInfo?: UserInfo; userLoading?: boolean };
};

export type GlobalAction = UpdateSettingsAction | UpdateUserInfoAction;

/** MobX globalStore 的 React 订阅 / 派发钩子 */
export function useGlobalSelector<T>(selector: (state: GlobalState) => T): T {
  const select = () => selector(globalStore.snapshot);
  const [selected, setSelected] = useState(select);

  useEffect(() => {
    return reaction(select, setSelected, {
      equals: comparer.structural,
      fireImmediately: true
    });
  }, []);

  return selected;
}

export function useGlobalDispatch() {
  return (action: GlobalAction) => {
    switch (action.type) {
      case 'update-settings':
        globalStore.updateSettings(action.payload.settings);
        break;
      case 'update-userInfo':
        globalStore.updateUserInfo(action.payload);
        break;
      default:
        break;
    }
  };
}
