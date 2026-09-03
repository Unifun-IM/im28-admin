// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 拉黑用户 需要 `users.ban` 权限并验证当前管理员的 GA 动态码；拉黑成功后立即撤销该用户全部登录态。支持限时和永久拉黑。 POST /v1/admin/users/ban */
export async function postV1AdminUsersBan(
  body: AdminAPI.AdminBanUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/users/ban", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量拉黑用户 需要 `users.batch-ban` 权限并验证当前管理员的 GA 动态码；单次最多操作 100 个用户。全部用户在同一事务中处理，任一用户不存在或处理失败时整批回滚；成功后撤销全部目标用户的登录态。响应仅包含 `code` 和 `message`。 POST /v1/admin/users/batch-ban */
export async function postV1AdminUsersBatchBan(
  body: AdminAPI.AdminBatchBanUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/users/batch-ban", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量解禁用户 需要 `users.batch-unban` 权限并验证当前管理员的 GA 动态码；单次最多操作 100 个用户，且全部用户都必须处于拉黑状态。全部用户在同一事务中处理，任一用户不存在、状态不满足或处理失败时整批回滚。响应仅包含 `code` 和 `message`。 POST /v1/admin/users/batch-unban */
export async function postV1AdminUsersBatchUnban(
  body: AdminAPI.AdminBatchUnbanUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/users/batch-unban", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询平台封禁用户 需要 `users.blacklist.list` 权限；返回当前仍有效的封禁用户及其最近一次封禁记录和后台操作人，不是 C 端好友黑名单。 POST /v1/admin/users/blacklist/list */
export async function postV1AdminUsersBlacklistList(
  body: AdminAPI.AdminListBannedUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListBannedUserEnvelope>(
    "/v1/admin/users/blacklist/list",
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

/** 查询用户通讯录 按用户 ID 分页查询当前有效好友关系。返回该用户维护的别名、备注、标签等关系字段，以及好友完整用户资料。需要 `users.contacts.list` 权限。 POST /v1/admin/users/contacts/list */
export async function postV1AdminUsersContactsList(
  body: AdminAPI.AdminListUserRelationRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListUserContactEnvelope>(
    "/v1/admin/users/contacts/list",
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

/** 查询用户详情 需要 `users.detail` 权限；不返回邀请码或邀请人信息。 POST /v1/admin/users/detail */
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

/** 查询用户群列表 按用户 ID 分页查询当前有效群成员关系，固定按入群时间倒序返回。列表包含群资料、该用户在群中的角色、群昵称、入群时间及禁言状态。需要 `users.groups.list` 权限。 POST /v1/admin/users/groups/list */
export async function postV1AdminUsersGroupsList(
  body: AdminAPI.AdminListUserRelationRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListUserGroupEnvelope>(
    "/v1/admin/users/groups/list",
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

/** 查询用户 需要 `users.list` 权限；`super_admin` 角色不受单项权限限制。 POST /v1/admin/users/list */
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

/** 批量查询用户在线状态 需要 `users.online-status.list` 权限。单次查询 1 至 30 个用户；状态来自 Push Gateway Presence 读模型，不验证用户是否存在。不存在或没有在线记录的用户返回 `online=false`。 POST /v1/admin/users/online-status/list */
export async function postV1AdminUsersOnlineStatusList(
  body: AdminAPI.AdminListUserOnlineStatusRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListUserOnlineStatusEnvelope>(
    "/v1/admin/users/online-status/list",
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

/** 查询用户操作日志 需要 `users.operation-logs.list` 权限；查询 `ac_user_operation_log`，支持按用户、行为类型、客户端类型和操作时间筛选，并按操作时间排序及分页。日志由 API Gateway 对 C 端关键写操作尽力异步采集，写入失败不影响原业务请求，因此不能替代业务事实或审计日志。 POST /v1/admin/users/operation-logs/list */
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

/** 搜索用户 需要 `users.search` 权限。根据指定字段对 C 端用户执行不区分大小写的模糊搜索，固定最多返回 20 条；可直接用于添加白名单时选择已注册用户。 POST /v1/admin/users/search */
export async function postV1AdminUsersSearch(
  body: AdminAPI.AdminSearchUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminSearchUserEnvelope>("/v1/admin/users/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 解禁用户 需要 `users.unban` 权限并验证当前管理员的 GA 动态码；仅拉黑状态的用户可以人工解禁。 POST /v1/admin/users/unban */
export async function postV1AdminUsersUnban(
  body: AdminAPI.AdminUnbanUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/users/unban", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 添加平台白名单用户 需要 `users.whitelist.add` 权限并验证当前管理员的 GA 动态码；只支持已注册用户。重复添加按成功处理并保留原加入记录；加入白名单不会解除账号封禁。 POST /v1/admin/users/whitelist/add */
export async function postV1AdminUsersWhitelistAdd(
  body: AdminAPI.AdminAddWhitelistUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/users/whitelist/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量移除平台白名单用户 需要 `users.whitelist.batch-remove` 权限并验证当前管理员的 GA 动态码；单次最多 100 个用户，不在白名单中的用户不会导致整批失败。 POST /v1/admin/users/whitelist/batch-remove */
export async function postV1AdminUsersWhitelistBatchRemove(
  body: AdminAPI.AdminBatchRemoveWhitelistUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>(
    "/v1/admin/users/whitelist/batch-remove",
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

/** 创建未注册用户并加入白名单 需要 `users.whitelist.create` 权限并验证当前管理员的 GA 动态码。服务端自动生成 C 端用户 ID、账号和临时密码，在同一事务中创建账号并加入白名单；临时密码只在本次成功响应中返回，新用户登录后必须立即修改。 POST /v1/admin/users/whitelist/create */
export async function postV1AdminUsersWhitelistCreate(
  body: AdminAPI.AdminCreateWhitelistUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminCreateWhitelistUserEnvelope>(
    "/v1/admin/users/whitelist/create",
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

/** 查询平台白名单用户 需要 `users.whitelist.list` 权限；仅返回已注册用户。白名单与账号封禁状态相互独立。 POST /v1/admin/users/whitelist/list */
export async function postV1AdminUsersWhitelistList(
  body: AdminAPI.AdminListWhitelistedUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListWhitelistedUserEnvelope>(
    "/v1/admin/users/whitelist/list",
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

/** 移除平台白名单用户 需要 `users.whitelist.remove` 权限并验证当前管理员的 GA 动态码；用户不在白名单时仍按成功处理。 POST /v1/admin/users/whitelist/remove */
export async function postV1AdminUsersWhitelistRemove(
  body: AdminAPI.AdminRemoveWhitelistUserRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/users/whitelist/remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
