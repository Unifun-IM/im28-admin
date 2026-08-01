// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 查询群详情 返回群基础资料、全部群设置、创建人、当前群主、群主及管理员，以及群会话最后活跃时间。需要 `admin.groups.read` 权限。 POST /v1/admin/groups/detail */
export async function postV1AdminGroupsDetail(
  body: AdminAPI.AdminDetailGroupRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminDetailGroupEnvelope>("/v1/admin/groups/detail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询群 POST /v1/admin/groups/list */
export async function postV1AdminGroupsList(
  body: AdminAPI.AdminListGroupRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListGroupEnvelope>("/v1/admin/groups/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询群操作日志 按群分页查询操作时间线，可按动作和时间范围筛选。操作日志在群业务提交成功后尽力写入，不作为群业务事务的一部分。需要 `admin.groups.read` 权限。 POST /v1/admin/groups/operation-logs/list */
export async function postV1AdminGroupsOperationLogsList(
  body: AdminAPI.AdminListGroupOperationLogRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListGroupOperationLogEnvelope>(
    "/v1/admin/groups/operation-logs/list",
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

/** 更新群状态 POST /v1/admin/groups/update-status */
export async function postV1AdminGroupsUpdateStatus(
  body: AdminAPI.AdminUpdateGroupStatusRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/groups/update-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 升级大群 客户端不能申请升级大群；普通群达到人数上限后，只能联系管理员，由系统用户后台升级。 POST /v1/admin/groups/upgrade */
export async function postV1AdminGroupsUpgrade(
  body: AdminAPI.AdminUpgradeGroupRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/groups/upgrade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
