// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 创建用户 创建的系统用户首次登录时必须先修改初始密码，再绑定或验证二步认证。 POST /v1/admin/system-users/create */
export async function postV1AdminSystemUsersCreate(
  body: AdminAPI.CreateSysUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.SysUserEnvelope>("/v1/admin/system-users/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
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

/** 重置密码 重置后立即撤销该系统用户的现有登录态；用户下次登录必须先修改临时密码，再绑定或验证二步认证。 POST /v1/admin/system-users/reset-password */
export async function postV1AdminSystemUsersResetPassword(
  body: AdminAPI.ResetSysUserPasswordRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>(
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

/** 更新用户 POST /v1/admin/system-users/update */
export async function postV1AdminSystemUsersUpdate(
  body: AdminAPI.UpdateSysUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.SysUserEnvelope>("/v1/admin/system-users/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
