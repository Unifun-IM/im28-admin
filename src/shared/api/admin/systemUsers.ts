// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 创建用户 需要 `system-users.create` 权限。前端不传密码；服务端随机生成临时密码并仅在本次成功响应中返回。新用户首次登录时必须先修改该密码，再绑定或验证二步认证。 POST /v1/admin/system-users/create */
export async function postV1AdminSystemUsersCreate(
  body: AdminAPI.CreateSysUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.CreateSysUserEnvelope>(
    "/v1/admin/system-users/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 删除用户 POST /v1/admin/system-users/delete */
export async function postV1AdminSystemUsersDelete(
  body: AdminAPI.DeleteSysUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/system-users/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 用户详情 POST /v1/admin/system-users/detail */
export async function postV1AdminSystemUsersDetail(
  body: AdminAPI.DetailSysUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.SysUserEnvelope>("/v1/admin/system-users/detail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 用户列表 POST /v1/admin/system-users/list */
export async function postV1AdminSystemUsersList(
  body: AdminAPI.ListSysUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ListSysUserEnvelope>("/v1/admin/system-users/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 重置密码 需要 `system-users.reset-password` 权限。服务端校验并消费当前管理员的 GA 动态码，随机生成临时密码并记录备注；重置后立即撤销目标账号所有登录态，目标账号下次登录必须先修改临时密码。临时密码只在成功响应中展示一次。 POST /v1/admin/system-users/reset-password */
export async function postV1AdminSystemUsersResetPassword(
  body: AdminAPI.ResetSysUserPasswordRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResetSysUserPasswordEnvelope>(
    "/v1/admin/system-users/reset-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 重置 Google 验证码 需要 `system-users.reset-two-factor` 权限。服务端校验并消费当前管理员的 GA 动态码，清除目标账号当前 Google 验证码绑定并记录备注；目标账号所有登录态立即失效，下次登录必须重新绑定。 POST /v1/admin/system-users/reset-two-factor */
export async function postV1AdminSystemUsersResetTwoFactor(
  body: AdminAPI.ResetSysUserTwoFactorRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>(
    "/v1/admin/system-users/reset-two-factor",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 更新用户 POST /v1/admin/system-users/update */
export async function postV1AdminSystemUsersUpdate(
  body: AdminAPI.UpdateSysUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/system-users/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 调整后台 IPv4 白名单 需要 `system-users.update-ip-whitelist` 权限，并验证当前管理员的 GA 动态码。更新成功后验证码立即失效，目标账号所有登录态立即失效；空数组表示不限制来源 IP。限制会应用于登录、预认证、二步验证、刷新 token 和每次后台接口鉴权。 POST /v1/admin/system-users/update-ip-whitelist */
export async function postV1AdminSystemUsersUpdateIpWhitelist(
  body: AdminAPI.UpdateSysUserIPWhitelistRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>(
    "/v1/admin/system-users/update-ip-whitelist",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}
