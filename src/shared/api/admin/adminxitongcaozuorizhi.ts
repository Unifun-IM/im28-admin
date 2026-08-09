// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 查询系统操作日志 需要 `admin.system_operation_logs.read` 权限。支持按操作账号、操作类型、来源 IP、操作路径、内容关键词和操作时间筛选，结果按操作时间倒序分页返回。后台关键操作由 API Gateway 异步写入 `ac_system_operation_log`，请求参数中的密码、token、二步验证码等敏感字段会被脱敏；日志写入失败不影响原业务请求。 POST /v1/admin/system-operation-logs/list */
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
