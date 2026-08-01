export type { AppSettings, GlobalState, UserInfo } from './global-store';
export { GlobalStore, globalStore } from './global-store';
export {
  useGlobalSelector,
  useGlobalDispatch,
  type GlobalAction
} from './global-store-hooks';
