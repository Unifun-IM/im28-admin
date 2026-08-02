// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 创建客户端版本 POST /v1/admin/client-versions/create */
export async function postV1AdminClientVersionsCreate(
  body: AdminAPI.CreateClientVersionRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/client-versions/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 客户端版本详情 POST /v1/admin/client-versions/detail */
export async function postV1AdminClientVersionsDetail(
  body: AdminAPI.DetailClientVersionRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ClientVersionEnvelope>(
    "/v1/admin/client-versions/detail",
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

/** 客户端版本列表 POST /v1/admin/client-versions/list */
export async function postV1AdminClientVersionsList(
  body: AdminAPI.ListClientVersionRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ListClientVersionEnvelope>(
    "/v1/admin/client-versions/list",
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

/** 更新客户端版本 POST /v1/admin/client-versions/update */
export async function postV1AdminClientVersionsUpdate(
  body: AdminAPI.UpdateClientVersionRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/client-versions/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取系统参数 需要 `admin.system_settings.read` 权限。首次读取时自动创建默认配置：系统名称为“后台管理系统”、默认语言为 zh-CN、时间格式为 12h、IP 白名单开启。 POST /v1/admin/system-settings/get */
export async function postV1AdminSystemSettingsGet(options?: {
  [key: string]: any;
}) {
  return request<AdminAPI.SystemSettingEnvelope>(
    "/v1/admin/system-settings/get",
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

/** 更新系统参数 需要 `admin.system_settings.write` 权限。system_name 必填，其他字段可选；可选字段不传时保留原值。成功只返回 code 和 message。IP 白名单策略在网关内最多缓存 3 秒，更新当前实例后立即生效，读取策略失败时默认继续校验白名单。 POST /v1/admin/system-settings/update */
export async function postV1AdminSystemSettingsUpdate(
  body: AdminAPI.UpdateSystemSettingRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/system-settings/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 创建平台条款 POST /v1/admin/terms/create */
export async function postV1AdminTermsCreate(
  body: AdminAPI.CreatePlatformTermRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/terms/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 平台条款详情 POST /v1/admin/terms/detail */
export async function postV1AdminTermsDetail(
  body: AdminAPI.DetailPlatformTermRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.PlatformTermEnvelope>("/v1/admin/terms/detail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 平台条款列表 POST /v1/admin/terms/list */
export async function postV1AdminTermsList(
  body: AdminAPI.ListPlatformTermRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ListPlatformTermEnvelope>("/v1/admin/terms/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新平台条款 POST /v1/admin/terms/update */
export async function postV1AdminTermsUpdate(
  body: AdminAPI.UpdatePlatformTermRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/terms/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
