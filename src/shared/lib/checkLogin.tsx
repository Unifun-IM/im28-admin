import { getAccessToken } from '@shared/api/request';

/** 已登录：存在 token，或兼容 Arco Pro mock 的 userStatus */
export default function checkLogin() {
  if (getAccessToken()) {
    return true;
  }
  return localStorage.getItem('userStatus') === 'login';
}
