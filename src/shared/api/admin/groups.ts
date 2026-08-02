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

/** 获取群全局配置 获取创建群最少人数、普通群人数上限和群公告字数上限。当前三个配置仅保存和展示，尚未参与 C 端创建群、成员数量或公告长度校验。需要 `admin.groups.read` 权限。 POST /v1/admin/groups/settings/get */
export async function postV1AdminGroupsSettingsGet(options?: {
  [key: string]: any;
}) {
  return request<AdminAPI.AdminGetGroupGlobalSettingEnvelope>(
    "/v1/admin/groups/settings/get",
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

/** 更新群全局配置 完整保存创建群最少人数、普通群人数上限和群公告字数上限。当前三个配置仅保存和展示，尚未参与 C 端创建群、成员数量或公告长度校验。需要 `admin.groups.write` 权限。 POST /v1/admin/groups/settings/update */
export async function postV1AdminGroupsSettingsUpdate(
  body: AdminAPI.AdminUpdateGroupGlobalSettingRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/groups/settings/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
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
