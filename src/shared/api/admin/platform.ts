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
