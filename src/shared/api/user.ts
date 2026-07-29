// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 用户登录 POST /api/user/login */
export async function postApiUserLogin(
  body: API.LoginRequest,
  options?: { [key: string]: any }
) {
  return request<API.LoginResult>("/api/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取当前用户信息 GET /api/user/userInfo */
export async function getApiUserUserInfo(options?: { [key: string]: any }) {
  return request<API.UserInfo>("/api/user/userInfo", {
    method: "GET",
    ...(options || {}),
  });
}
