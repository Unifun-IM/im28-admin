// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 校验权限 POST /v1/admin/permissions/check */
export async function postV1AdminPermissionsCheck(
  body: AdminAPI.CheckSysPermissionRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.CheckSysPermissionEnvelope>(
    "/v1/admin/permissions/check",
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

/** 创建权限 POST /v1/admin/permissions/create */
export async function postV1AdminPermissionsCreate(
  body: AdminAPI.CreateSysPermissionRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/permissions/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除权限 POST /v1/admin/permissions/delete */
export async function postV1AdminPermissionsDelete(
  body: AdminAPI.DeleteSysPermissionRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/permissions/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 权限详情 POST /v1/admin/permissions/detail */
export async function postV1AdminPermissionsDetail(
  body: AdminAPI.DetailSysPermissionRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.SysPermissionEnvelope>(
    "/v1/admin/permissions/detail",
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

/** 权限列表 POST /v1/admin/permissions/list */
export async function postV1AdminPermissionsList(
  body: AdminAPI.ListSysPermissionRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ListSysPermissionEnvelope>(
    "/v1/admin/permissions/list",
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

/** 更新权限 POST /v1/admin/permissions/update */
export async function postV1AdminPermissionsUpdate(
  body: AdminAPI.UpdateSysPermissionRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/permissions/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 创建角色 POST /v1/admin/roles/create */
export async function postV1AdminRolesCreate(
  body: AdminAPI.CreateSysRoleRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/roles/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除角色 需要 `roles.delete` 权限。超级管理员角色 `super_admin` 为系统内置角色，不允许删除。 POST /v1/admin/roles/delete */
export async function postV1AdminRolesDelete(
  body: AdminAPI.DeleteSysRoleRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/roles/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 角色详情 POST /v1/admin/roles/detail */
export async function postV1AdminRolesDetail(
  body: AdminAPI.DetailSysRoleRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.SysRoleEnvelope>("/v1/admin/roles/detail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 角色列表 POST /v1/admin/roles/list */
export async function postV1AdminRolesList(
  body: AdminAPI.ListSysRoleRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ListSysRoleEnvelope>("/v1/admin/roles/list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新角色 POST /v1/admin/roles/update */
export async function postV1AdminRolesUpdate(
  body: AdminAPI.UpdateSysRoleRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/roles/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
