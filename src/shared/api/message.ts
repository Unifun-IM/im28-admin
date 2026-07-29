// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 消息列表 GET /api/message/list */
export async function getApiMessageList(options?: { [key: string]: any }) {
  return request<API.MessageItem[]>("/api/message/list", {
    method: "GET",
    ...(options || {}),
  });
}

/** 标记已读 POST /api/message/read */
export async function postApiMessageRead(
  body: API.MessageReadRequest,
  options?: { [key: string]: any }
) {
  return request<Record<string, any>>("/api/message/read", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
