// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 查询系统操作日志 需要 `admin.system_operation_logs.read` 权限。支持按操作账号、操作类型、来源 IP、操作路径、内容关键词和操作时间筛选，结果按操作时间倒序分页返回。当前只提供初始化数据查询，自动操作埋点尚未接入。 POST /v1/admin/system-operation-logs/list */
export async function postV1AdminSystemOperationLogsList(
  body: AdminAPI.AdminListSystemOperationLogRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListSystemOperationLogEnvelope>(
    "/v1/admin/system-operation-logs/list",
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
