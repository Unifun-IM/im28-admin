// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

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
