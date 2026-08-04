// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 查询群会话 按多个群 ID、单个群名称关键词、群主用户 ID 和群状态分页查询群会话。多个非空条件按 AND 组合；所有查询条件为空时固定返回空列表，不扫描全部群。需要 `admin.conversations.read` 权限。 POST /v1/admin/conversations/groups/list */
export async function postV1AdminConversationsGroupsList(
  body: AdminAPI.AdminListGroupConversationRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListGroupConversationEnvelope>(
    "/v1/admin/conversations/groups/list",
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

/** 查询指定用户的会话列表 按 user_id 分页查询用户当前及历史会话，只返回后台列表展示所需字段，需要 `admin.conversations.read` 权限。 POST /v1/admin/conversations/list */
export async function postV1AdminConversationsList(
  body: AdminAPI.AdminListUserConversationRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListUserConversationEnvelope>(
    "/v1/admin/conversations/list",
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

/** 查询指定用户的会话消息 以 user_id 指定的 C 端用户视角查看 conversation_id 中的聊天记录，user_id 不是发送者筛选条件。该用户必须当前或曾经属于该会话，否则返回资源不存在。
首次将 before_seq 传 0 或省略，消息按 msg_seq 倒序返回；继续翻页时将上一页 data.next_seq 原样传入 before_seq，has_more=false 时结束。
message.type 和 message.body 与 C 端消息协议一致：101=text、102=image、103=audio、104=video、105=file、106=mention、107=merge、108=card、109=location、110=custom、113=typing、114=quote、115=emoji、118=markdown；1200-1202、1400、已定义的 1501-1521、1601-1608、1701、2102 使用 system。OpenAPI 的 MessageBody 会展开每种正文结构。
查询遵守该用户的历史清空、仅自己删除、消息过期/删除和群聊离群边界。data.users 是本页发送者资料去重列表，按 message.sender_id=data.users[].user_id 关联。需要 `admin.conversations.read` 权限。 POST /v1/admin/conversations/messages/list */
export async function postV1AdminConversationMessagesList(
  body: AdminAPI.AdminListConversationMessageRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListConversationMessageEnvelope>(
    "/v1/admin/conversations/messages/list",
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

/** 查询用户会话入口列表 按用户 ID、昵称、手机号、邮箱或账号查询用户摘要，也支持批量提交最多 100 个 user_ids，需要 `admin.conversations.read` 权限。页面首次进入且 keyword、user_ids 都为空时固定返回空列表，不会扫描全部用户。此接口不返回聊天内容；前端点击“查聊天”时使用返回的 user_id 进入后续查询。 POST /v1/admin/conversations/users/list */
export async function postV1AdminConversationsUsersList(
  body: AdminAPI.AdminListUserConversationQueryRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListUserConversationQueryEnvelope>(
    "/v1/admin/conversations/users/list",
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
