// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 拉黑用户 需要 `admin.users.write` 权限；拉黑成功后立即撤销该用户全部登录态。支持限时和永久拉黑。 POST /v1/admin/users/ban */
export async function postV1AdminUsersBan(
  body: AdminAPI.AdminBanUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminUserBanEnvelope>("/v1/admin/users/ban", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询用户详情 需要 `admin.users.read` 权限；不返回邀请码或邀请人信息。 POST /v1/admin/users/detail */
export async function postV1AdminUsersDetail(
  body: AdminAPI.AdminDetailUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminDetailUserEnvelope>("/v1/admin/users/detail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询用户 需要 `admin.users.read` 权限；`super_admin` 角色不受单项权限限制。 POST /v1/admin/users/list */
export async function postV1AdminUsersList(
  body: AdminAPI.AdminListUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListUserEnvelope>("/v1/admin/users/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询用户操作日志 需要 `admin.users.read` 权限；当前仅固定返回空列表，操作日志采集与查询逻辑尚未接入。 POST /v1/admin/users/operation-logs/list */
export async function postV1AdminUsersOperationLogsList(
  body: AdminAPI.AdminListUserOperationLogRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListUserOperationLogEnvelope>(
    "/v1/admin/users/operation-logs/list",
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

/** 解禁用户 需要 `admin.users.write` 权限；仅拉黑状态的用户可以人工解禁。 POST /v1/admin/users/unban */
export async function postV1AdminUsersUnban(
  body: AdminAPI.AdminUnbanUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminUserBanEnvelope>("/v1/admin/users/unban", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
