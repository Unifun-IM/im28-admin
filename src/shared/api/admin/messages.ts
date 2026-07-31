// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 消息追踪 支持按 trace_id、request_id、conversation_id、msg_id、client_msg_id、sender_id 组合查询。 POST /v1/admin/messages/trace */
export async function postV1AdminMessagesTrace(
  body: AdminAPI.AdminTraceMessageRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminTraceMessageEnvelope>(
    "/v1/admin/messages/trace",
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
