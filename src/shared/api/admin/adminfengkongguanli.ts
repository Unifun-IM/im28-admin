// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 添加 C 端 IP 黑名单 一次添加 1 至 100 个 IPv4 或 IPv6 地址；存在无效 IP 或已封控 IP 时整批失败。成功后 C 端 HTTP 请求会被拦截，后台接口不受影响。需要 `risk.ip-blacklist.add` 权限和谷歌验证码。 POST /v1/admin/risk/ip-blacklist/add */
export async function postV1AdminRiskIpBlacklistAdd(
  body: AdminAPI.AdminAddIPBlacklistRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/risk/ip-blacklist/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 批量恢复 IP 一次恢复 1 至 100 个当前有效的 IP 黑名单记录；任一 IP 不存在时整批失败。需要 `risk.ip-blacklist.batch-remove` 权限和谷歌验证码。 POST /v1/admin/risk/ip-blacklist/batch-remove */
export async function postV1AdminRiskIpBlacklistBatchRemove(
  body: AdminAPI.AdminBatchRemoveIPBlacklistRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>(
    "/v1/admin/risk/ip-blacklist/batch-remove",
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

/** 查询 C 端 IP 黑名单 查询当前有效的 IP 封控记录，支持按 IP、原因和操作时间筛选。需要 `risk.ip-blacklist.list` 权限。 POST /v1/admin/risk/ip-blacklist/list */
export async function postV1AdminRiskIpBlacklistList(
  body: AdminAPI.AdminListIPBlacklistRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListIPBlacklistEnvelope>(
    "/v1/admin/risk/ip-blacklist/list",
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

/** 恢复单个 IP 将一个当前有效的 IP 黑名单记录恢复为可访问状态。需要 `risk.ip-blacklist.remove` 权限和谷歌验证码。 POST /v1/admin/risk/ip-blacklist/remove */
export async function postV1AdminRiskIpBlacklistRemove(
  body: AdminAPI.AdminRemoveIPBlacklistRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/risk/ip-blacklist/remove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
