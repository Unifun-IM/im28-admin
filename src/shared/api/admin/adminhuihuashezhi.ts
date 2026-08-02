// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 获取会话全局配置 获取消息类型开关、消息规格限制和相册单次选择上限。当前配置仅保存和展示，尚未参与 C 端消息发送或文件上传校验。需要 `admin.conversations.read` 权限。 POST /v1/admin/conversations/settings/get */
export async function postV1AdminConversationsSettingsGet(options?: {
  [key: string]: any;
}) {
  return request<AdminAPI.AdminGetConversationGlobalSettingEnvelope>(
    "/v1/admin/conversations/settings/get",
    {
      method: "POST",
      ...(options || {}),
    }
  );
}

/** 更新会话全局配置 完整保存消息类型开关、消息规格限制和相册单次选择上限。所有字段必填；当前配置仅保存和展示，尚未参与 C 端消息发送或文件上传校验。需要 `admin.conversations.write` 权限。 POST /v1/admin/conversations/settings/update */
export async function postV1AdminConversationsSettingsUpdate(
  body: AdminAPI.AdminUpdateConversationGlobalSettingRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>(
    "/v1/admin/conversations/settings/update",
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
