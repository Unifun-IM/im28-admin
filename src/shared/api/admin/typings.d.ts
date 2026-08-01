declare namespace AdminAPI {
  type AcceptFriendApplicationEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { application?: FriendApplication; conversation?: Conversation };
    };

  type AccountStatus = "active" | "disabled";

  type AccountType = "account" | "email" | "phone";

  type AckConversationRequest = {
    conversation_id: string;
    delivered_seq: Uint64String;
    /** 当前设备 ID，用于多端投递游标。 */
    device_id?: string;
  };

  type AdminBanUserRequest = {
    user_id: string;
    /** 拉黑原因，不能仅包含空白字符。 */
    reason: string;
    /** temporary=限时，permanent=永久。 */
    ban_period: "temporary" | "permanent";
    /** 限时拉黑截止时间，使用 RFC3339；ban_period=temporary 时必填且必须晚于当前时间，permanent 时必须不传。 */
    banned_until?: string;
    /** 原因说明，不能仅包含空白字符。 */
    reason_description: string;
  };

  type AdminBatchBanUserRequest = {
    /** 需要拉黑的用户 ID，单次最多 100 个。 */
    user_ids: string[];
    /** 拉黑原因，应用于本批全部用户，不能仅包含空白字符。 */
    reason: string;
    /** temporary=限时，permanent=永久。 */
    ban_period: "temporary" | "permanent";
    /** 限时拉黑截止时间，使用 RFC3339；ban_period=temporary 时必填且必须晚于当前时间，permanent 时必须不传。 */
    banned_until?: string;
    /** 原因说明，应用于本批全部用户，不能仅包含空白字符。 */
    reason_description: string;
  };

  type AdminBatchUnbanUserRequest = {
    /** 需要解禁的用户 ID，单次最多 100 个。 */
    user_ids: string[];
    /** 解禁原因，应用于本批全部用户，不能仅包含空白字符。 */
    reason: string;
    /** 原因说明，应用于本批全部用户，不能仅包含空白字符。 */
    reason_description: string;
  };

  type AdminDetailUserEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: {
        user?: User;
        online_status?: OnlineStatus;
        friend_count?: number;
        group_count?: number;
      };
    };

  type AdminDetailUserRequest = {
    user_id: string;
  };

  type AdminListGroupEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: { group?: Group }[]; total?: number };
    };

  type AdminListGroupRequest = {
    /** 按群 ID、会话 ID、群名或群主 ID 模糊查询。 */
    keyword?: string;
    status?: GroupStatus;
    page?: number;
    page_size?: number;
  };

  type AdminListUserEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: AdminUserWrap[]; total?: number };
    };

  type AdminListUserOperationLogEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: AdminUserOperationLog[] };
    };

  type AdminListUserOperationLogRequest = {
    /** 需要查询操作日志的 C 端用户 ID。 */
    user_id: string;
  };

  type AdminListUserRequest = {
    /** 查询内容。keyword_type 为空时同时匹配用户 ID、账号、手机号、邮箱和昵称。 */
    keyword?: string;
    /** 字段化查询类型；只能在同时传入 keyword 时使用。除 nickname 为包含匹配外，其余类型均为精确匹配。 */
    keyword_type?: "user_id" | "account" | "phone" | "email" | "nickname";
    /** 批量搜索用户 ID；与其他查询条件同时传入时按 AND 组合。 */
    user_ids?: string[];
    status?: AccountStatus;
    online_status?: OnlineStatus;
    /** 注册时间范围起点；与 registered_end_at 同时传入时不得晚于结束时间。 */
    registered_start_at?: RFC3339Time;
    registered_end_at?: RFC3339Time;
    /** 最后操作时间范围起点；与 last_operated_end_at 同时传入时不得晚于结束时间。 */
    last_operated_start_at?: RFC3339Time;
    last_operated_end_at?: RFC3339Time;
    sort_by?: "registered_at" | "last_operated_at";
    /** 只能在同时传入 sort_by 时使用。 */
    sort_order?: "asc" | "desc";
    page?: number;
    page_size?: number;
  };

  type AdminMessage = {
    msg_id?: string;
    conversation_id?: string;
    msg_seq?: string;
    sender_id?: string;
    client_msg_id?: string;
    type?: number;
    status?: number;
    /** 数据库消息正文的结构化快照，不绑定 C 端 MessageBody 类型。 */
    body?: Record<string, any>;
    version?: string;
    edited_at?: string;
    mention_user_ids?: string[];
    mentions?: MentionTarget[];
    sent_at?: string;
    updated_at?: string;
    expire_at?: string;
  };

  type AdminTraceMessageEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: { message?: AdminMessage }[] };
    };

  type AdminTraceMessageRequest = {
    trace_id?: string;
    request_id?: string;
    conversation_id?: string;
    msg_id?: string;
    client_msg_id?: string;
    sender_id?: string;
    limit?: number;
  };

  type AdminUnbanUserRequest = {
    user_id: string;
    /** 解禁原因，不能仅包含空白字符。 */
    reason: string;
    /** 原因说明，不能仅包含空白字符。 */
    reason_description: string;
  };

  type AdminUpdateGroupStatusRequest = {
    group_id: string;
    status: AdminWritableGroupStatus;
  };

  type AdminUpgradeGroupRequest = {
    group_id: string;
    /** 后台升级备注，可不传。 */
    remark?: string;
  };

  type AdminUserOperationLog = {
    /** 操作时间，使用 RFC3339。 */
    operated_at?: string;
    /** 操作类型。 */
    operation_type?: string;
    /** 操作描述。 */
    description?: string;
  };

  type AdminUserWrap = {
    user?: User;
    online_status?: OnlineStatus;
  };

  type AdminWritableGroupStatus = 0 | 1;

  type ApiCode =
    | 0
    | 100001
    | 100002
    | 100003
    | 100004
    | 100005
    | 100006
    | 100007
    | 100008
    | 100009
    | 100010
    | 100011
    | 100012;

  type ApplyFriendRequest = {
    target_id: string;
    message?: string;
    /** 添加来源标记。可传 phone、email、user_id、group、card、qrcode。 */
    source_type?: string;
  };

  type AudioMessage = {
    media_id?: string;
    url?: string;
    duration_seconds?: number;
    size_bytes?: Uint64String;
  };

  type AudioMessageBody = {
    audio: AudioMessage;
  };

  type AuthEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: {
        token?: Token;
        user?: User;
        sys_user?: SysUser;
        is_new_user?: boolean;
      };
    };

  type BatchDetailUserEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: User[] };
    };

  type BatchDetailUserRequest = {
    user_ids: string[];
  };

  type BatchPullMessagesEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: BatchPullMessagesResult[] };
    };

  type BatchPullMessagesItem = {
    conversation_id: string;
    from_seq: Uint64String;
    limit?: number;
    desc?: boolean;
  };

  type BatchPullMessagesRequest = {
    items: BatchPullMessagesItem[];
  };

  type BatchPullMessagesResult = {
    conversation_id?: string;
    response?: PullMessagesData;
    error_code?: string;
    error_message?: string;
  };

  type BlacklistItem = {
    user_id?: string;
    blocked_user_id?: string;
    created_at?: RFC3339Time;
  };

  type BlacklistListItem = {
    black?: BlacklistItem;
    user?: User;
  };

  type BlacklistRequest = {
    blocked_user_id: string;
  };

  type CardGroup = {
    group_id: string;
    title?: string;
    avatar_url?: string;
    member_count?: number;
  };

  type CardMessage = {
    /** 名片类型。user=用户名片，group=群名片。 */
    type: "user" | "group";
    user?: CardUser;
    group?: CardGroup;
  };

  type CardMessageBody = {
    card: CardMessage;
  };

  type CardUser = {
    user_id: string;
    nickname?: string;
    avatar_url?: string;
  };

  type ChangeSysUserPasswordEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: {
        next_step: "bind_two_factor" | "verify_two_factor";
        pre_auth_token: string;
        expires_in: number;
      };
    };

  type ChangeSysUserPasswordRequest = {
    /** 登录返回且 `next_step=change_password` 的一次性预认证 token。 */
    pre_auth_token: string;
    /** 本次登录使用的当前密码。 */
    current_password: string;
    /** 网关校验必须同时包含大写字母、小写字母、数字和特殊字符，且不能包含连续或倒序的 3 位字母或数字；服务端还会校验不能与当前密码相同、不能包含用户名。 */
    new_password: string;
  };

  type CheckSysPermissionEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { allowed?: boolean };
    };

  type CheckSysPermissionRequest = {
    permission_key: string;
  };

  type CheckTokenEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: {
        valid?: boolean;
        subject_type?: SubjectType;
        subject_id?: string;
        roles?: string[];
        permissions?: string[];
      };
    };

  type CheckTokenRequest = {
    access_token: string;
  };

  type ClearConversationRequest = {
    /** 要清空记录的会话 ID。 */
    conversation_id: string;
    /** 清空范围。self 仅自己；both 单聊双方；all_members 群主或有清空群聊消息权限的管理员清空所有群成员。 */
    scope?: "self" | "both" | "all_members";
  };

  type ClientVersion = {
    id?: Uint64String;
    /** 客户端平台，如 ios/android/windows/macos/web。 */
    platform?: string;
    version?: string;
    build_number?: Uint64String;
    force_update?: boolean;
    download_url?: string;
    title?: string;
    description?: string;
    is_enable?: boolean;
    created_at?: RFC3339Time;
    updated_at?: RFC3339Time;
  };

  type ClientVersionEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { client_version?: ClientVersion };
    };

  type ConfirmTwoFactorRequest = {
    /** 登录返回且 `next_step=bind_two_factor` 的一次性预认证 token。 */
    pre_auth_token: string;
    /** 认证器应用中当前的 6 位动态验证码。 */
    code: string;
  };

  type Conversation = {
    type?: ConversationType;
    direct_conversation?: DirectConversation;
    group_conversation?: GroupConversation;
  };

  type ConversationExitInfo = {
    /** 当前用户退出态。 */
    state?: "left" | "removed";
    /** 触发退出态的操作人用户 ID；主动退出时为当前用户。 */
    operator_user_id?: string;
    operator_role?: RoleLevel;
    /** 退出原因。 */
    reason?: "left" | "removed" | "dismissed";
    occurred_at?: RFC3339Time;
    operator_user?: User;
  };

  type ConversationStateEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { state?: ConversationUserSyncState };
    };

  type ConversationType = 1 | 3 | 4;

  type ConversationUserReadState = {
    conversation_id?: string;
    user_id?: string;
    last_read_seq?: Uint64String;
    read_at?: RFC3339Time;
  };

  type ConversationUserSyncState = {
    conversation_id?: string;
    last_msg_seq?: Uint64String;
    /** 当前会话最新消息编辑或删除更新序号。 */
    last_update_seq?: Uint64String;
    last_read_seq?: Uint64String;
    last_delivered_seq?: Uint64String;
    version?: Uint64String;
    unread_count?: number;
    clear_before_seq?: Uint64String;
    /** 当前用户置顶此会话的时间；空字符串表示未置顶。 */
    pinned_at?: RFC3339Time;
    /** 当前用户置顶区排序权重；值越大越靠前，未置顶为 0。 */
    pinned_sort?: number;
    /** 当前用户是否对该会话开启免打扰。 */
    notification_muted?: boolean;
    /** 当前用户是否手动标记该会话未读。 */
    manual_unread?: boolean;
  };

  type CreateClientVersionRequest = {
    /** 客户端平台标识，不能仅包含空白字符，例如 ios、android、windows、macos、web。 */
    platform: string;
    /** 面向用户展示的版本号，不能仅包含空白字符。 */
    version: string;
    /** 平台构建号，必须大于 0。 */
    build_number: PositiveUint64String;
    force_update?: boolean;
    /** 可选下载地址；传入时必须是合法的 HTTP 或 HTTPS URL。 */
    download_url?: string;
    title?: string;
    description?: string;
    /** 不传默认启用；传 false 表示创建为禁用状态。 */
    is_enable?: boolean;
  };

  type CreateGroupRequest = {
    title: string;
    avatar_url?: string;
    /** 群简介。 */
    description?: string;
    /** 群公告。 */
    announcement?: string;
    /** 初始成员用户 ID 列表；调用方会自动加入。 */
    member_user_ids?: string[];
  };

  type CreatePlatformTermRequest = {
    /** 条款业务键，不能仅包含空白字符。 */
    key: string;
    /** 条款标题，不能仅包含空白字符。 */
    title: string;
    /** 条款正文，不能仅包含空白字符。 */
    content: string;
    /** 条款版本号，不能仅包含空白字符。 */
    version: string;
    /** 不传默认启用。 */
    is_enable?: boolean;
  };

  type CreateSysPermissionRequest = {
    /** 权限唯一键，不能仅包含空白字符。 */
    key: string;
    /** 权限名称，不能仅包含空白字符。 */
    name: string;
    description?: string;
    /** 权限分类；不传表示不设置，传入时不能仅包含空白字符。 */
    type?: string;
    is_enable?: boolean;
  };

  type CreateSysRoleRequest = {
    /** 角色唯一编码，不能仅包含空白字符。 */
    code: string;
    /** 角色名称，不能仅包含空白字符。 */
    name: string;
    description?: string;
    is_enable?: boolean;
    permission_ids?: number[];
  };

  type CreateSysUserRequest = {
    /** 后台用户名，不能仅包含空白字符。 */
    username: string;
    display_name?: string;
    /** 初始密码；账号首次登录后必须修改。 */
    password: string;
    description?: string;
    status?: AccountStatus;
    role_ids?: number[];
  };

  type CustomMessage = {
    key: string;
    /** 自定义 JSON 字符串，由业务方约定。 */
    data?: string;
  };

  type CustomMessageBody = {
    custom: CustomMessage;
  };

  type DeleteFriendRequest = {
    friend_user_id: string;
    /** self 仅清空自己的聊天记录；both 清空双方聊天记录。 */
    clear_scope: "self" | "both";
    /** 前端生成的本次删除操作唯一 ID，用于关系通知和清空操作幂等。 */
    operation_id: string;
  };

  type DeleteMessageOperation = {
    /** self 仅当前用户隐藏；all 对会话所有成员删除且仅消息发送者可用。 */
    scope: "self" | "all";
    reason?: string;
  };

  type DeleteSysPermissionRequest = {
    id: number;
  };

  type DeleteSysRoleRequest = {
    id: number;
  };

  type DeleteSysUserRequest = {
    id: number;
  };

  type DetailClientVersionRequest = {
    id: PositiveUint64String;
  };

  type DetailConversationEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { conversation?: Conversation };
    };

  type DetailConversationRequest = {
    conversation_id: string;
  };

  type DetailConversationUserReadStateEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: { state?: ConversationUserReadState }[] };
    };

  type DetailConversationUserReadStateRequest = {
    conversation_id: string;
    user_ids: string[];
  };

  type DetailFriendEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { friend?: Friend };
    };

  type DetailFriendRequest = {
    friend_user_id: string;
  };

  type DetailPlatformTermRequest = {
    id: PositiveUint64String;
  };

  type DetailSysPermissionRequest = {
    id: number;
  };

  type DetailSysRoleRequest = {
    id: number;
  };

  type DetailSysUserRequest = {
    id: number;
  };

  type DirectConversation = {
    conversation_id?: string;
    /** 单聊对端用户 ID。 */
    peer_user_id?: string;
    user?: User;
    last_msg_seq?: Uint64String;
    /** 当前会话最新消息编辑或删除更新序号。 */
    last_update_seq?: Uint64String;
    version?: Uint64String;
    my_user_state?: "active" | "left" | "removed" | "muted";
    join_seq?: Uint64String;
    leave_seq?: Uint64String;
    last_read_seq?: Uint64String;
    last_delivered_seq?: Uint64String;
    clear_before_seq?: Uint64String;
    last_message?: Message;
    unread_count?: number;
    created_at?: RFC3339Time;
    updated_at?: RFC3339Time;
    /** 当前用户置顶此会话的时间；空字符串表示未置顶。 */
    pinned_at?: RFC3339Time;
    /** 当前用户置顶区排序权重；值越大越靠前，未置顶为 0。 */
    pinned_sort?: number;
    /** 自动删除消息秒数，0 表示关闭；只影响设置后新发送的消息。 */
    auto_delete_seconds?: number;
    /** 自动删除设置最后修改用户 ID。 */
    auto_delete_updated_by?: string;
    /** 自动删除设置最后修改时间；空字符串表示未设置过。 */
    auto_delete_updated_at?: RFC3339Time;
    /** 当前用户是否对该会话开启免打扰；不影响消息投递和未读数，只影响提醒展示。 */
    notification_muted?: boolean;
    /** 当前用户是否手动标记该会话未读；不影响真实已读游标和真实未读数。 */
    manual_unread?: boolean;
  };

  type DismissGroupRequest = {
    group_id: string;
  };

  type EditMessageOperation = {
    body: MessageBody;
    /** 编辑后的完整消息级 @ 目标；省略或传空数组表示清除原 @ 信息。 */
    mentions?: MentionTarget[];
  };

  type EmojiMessage = {
    emoji_id?: string;
    url?: string;
  };

  type EmojiMessageBody = {
    emoji: EmojiMessage;
  };

  type ErrorResponse =
    // #/components/schemas/ResponseBase
    ResponseBase;

  type FileMessage = {
    media_id?: string;
    url?: string;
    name?: string;
    mime_type?: string;
    size_bytes?: Uint64String;
  };

  type FileMessageBody = {
    file: FileMessage;
  };

  type ForwardOrigin = {
    type?: "user";
    /** 最初来源消息的发送者用户 ID。 */
    user_id?: string;
    /** 来源用户展示昵称。 */
    name?: string;
  };

  type Friend = {
    user_id?: string;
    friend_user_id?: string;
    /** 当前用户给好友设置的别名，用于会话和好友列表展示覆盖。 */
    alias?: string;
    /** 当前用户给好友设置的手机号备注。 */
    phone?: string;
    created_at?: RFC3339Time;
  };

  type FriendApplication = {
    application_id?: string;
    requester_id?: string;
    target_id?: string;
    message?: string;
    /** 添加来源标记，只用于记录来源，最终目标用户仍通过 target_id 确定。 */
    source_type?: "phone" | "email" | "user_id" | "group" | "card" | "qrcode";
    status?: FriendApplicationStatus;
    /** 当前用户作为申请接收方时是否已读；当前用户是发起方时固定为 true。 */
    is_read?: boolean;
    handled_at?: RFC3339Time;
    created_at?: RFC3339Time;
    updated_at?: RFC3339Time;
  };

  type FriendApplicationEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { application?: FriendApplication };
    };

  type FriendApplicationListItem = {
    application?: FriendApplication;
    /** 对方用户信息；sent 时为目标用户，received 时为申请人。 */
    user?: User;
    type?: FriendApplicationListType;
  };

  type FriendApplicationListType = "sent" | "received";

  type FriendApplicationStatus =
    | "pending"
    | "accepted"
    | "rejected"
    | "canceled"
    | "expired";

  type FriendApplicationUnreadCountEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { unread_count?: number };
    };

  type FriendApplicationUnreadCountRequest = {};

  type FriendListItem = {
    friend?: Friend;
    user?: User;
  };

  type GetGroupRequest = {
    group_id: string;
  };

  type GetUserRequest = {
    /** 统一搜索关键字，精确匹配用户 ID、手机号、邮箱或账号。 */
    keyword: string;
  };

  type Group = {
    group_id?: string;
    conversation_id?: string;
    title?: string;
    avatar_url?: string;
    /** 群简介。 */
    description?: string;
    /** 群公告。 */
    announcement?: string;
    /** 群公告版本；公告内容变化时递增。 */
    announcement_version?: Uint64String;
    owner_user_id?: string;
    mode?: GroupType;
    status?: GroupStatus;
    member_count?: number;
    /** 全体禁言开关；普通成员不能发言，群主仍可发言，管理员由 admin_send_message 控制。 */
    mute_all?: boolean;
    /** 普通成员禁言开关；开启后仅普通成员不能发言。 */
    mute_member?: boolean;
    /** 群发言频率开关；开启后普通成员按 send_frequency_seconds 限制发言间隔。 */
    send_frequency_enabled?: boolean;
    /** 群发言频率间隔秒数。 */
    send_frequency_seconds?: 30 | 60 | 180 | 300 | 600 | 1800 | 3600;
    /** 入群是否需要审核。 */
    join_approval_required?: boolean;
    /** 是否允许群成员互相加好友。 */
    allow_member_add_friend?: boolean;
    /** 是否允许普通成员邀请用户入群。 */
    allow_member_invite?: boolean;
    /** 是否允许群成员设置群昵称。 */
    allow_member_nickname?: boolean;
    /** 全体禁言时管理员是否可以发消息；未开启全体禁言时不限制管理员日常发言。 */
    admin_send_message?: boolean;
    /** 管理员是否可以手动禁言成员。 */
    admin_mute_member?: boolean;
    /** 管理员是否可以移除成员。 */
    admin_remove_member?: boolean;
    /** 管理员是否可以邀请好友加群。 */
    admin_invite_member?: boolean;
    /** 管理员是否可以审核入群申请或邀请。 */
    admin_audit_application?: boolean;
    /** 管理员是否可以清空群聊消息。 */
    admin_clear_message?: boolean;
    /** 管理员是否可以修改群资料。 */
    admin_update_profile?: boolean;
    created_at?: RFC3339Time;
    updated_at?: RFC3339Time;
  };

  type GroupApplication = {
    application_id?: string;
    group_id?: string;
    /** 申请人；邀请入群时表示被邀请人。 */
    requester_user_id?: string;
    /** 邀请人；主动申请时为空。 */
    inviter_user_id?: string;
    type?: "apply" | "invite";
    source_type?: string;
    message?: string;
    status?: "pending" | "accepted" | "rejected";
    handled_by?: string;
    handled_at?: RFC3339Time;
    created_at?: RFC3339Time;
    updated_at?: RFC3339Time;
  };

  type GroupConversation = {
    conversation_id?: string;
    group_id?: string;
    group_type?: GroupType;
    title?: string;
    avatar_url?: string;
    member_count?: number;
    last_msg_seq?: Uint64String;
    /** 当前会话最新消息编辑或删除更新序号。 */
    last_update_seq?: Uint64String;
    version?: Uint64String;
    my_user_state?: "active" | "left" | "removed" | "muted";
    my_role?: RoleLevel;
    join_seq?: Uint64String;
    leave_seq?: Uint64String;
    last_read_seq?: Uint64String;
    last_delivered_seq?: Uint64String;
    clear_before_seq?: Uint64String;
    last_message?: Message;
    unread_count?: number;
    created_at?: RFC3339Time;
    updated_at?: RFC3339Time;
    /** 当前用户置顶此会话的时间；空字符串表示未置顶。 */
    pinned_at?: RFC3339Time;
    /** 当前用户置顶区排序权重；值越大越靠前，未置顶为 0。 */
    pinned_sort?: number;
    /** 自动删除消息秒数，0 表示关闭；只影响设置后新发送的消息。 */
    auto_delete_seconds?: number;
    /** 自动删除设置最后修改用户 ID。 */
    auto_delete_updated_by?: string;
    /** 自动删除设置最后修改时间；空字符串表示未设置过。 */
    auto_delete_updated_at?: RFC3339Time;
    /** 当前用户是否对该会话开启免打扰；不影响消息投递和未读数，只影响提醒展示。 */
    notification_muted?: boolean;
    /** 当前用户是否手动标记该会话未读；不影响真实已读游标和真实未读数。 */
    manual_unread?: boolean;
    exit_info?: ConversationExitInfo;
  };

  type GroupEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { group?: Group; user_permission?: GroupUserPermission };
    };

  type GroupMember = {
    group_id?: string;
    user_id?: string;
    role?: RoleLevel;
    state?: "active" | "left" | "removed" | "banned";
    joined_at?: RFC3339Time;
    updated_at?: RFC3339Time;
    /** 成员单独禁言到期时间；空表示未单独禁言。 */
    mute_until?: RFC3339Time;
    /** 是否被单独禁言；用于管理筛选。 */
    is_muted?: boolean;
  };

  type GroupMemberFilter = 0 | 1 | 2 | 3 | 4 | 5;

  type GroupStatus = 0 | 1 | 2 | 3;

  type GroupType = 1 | 2;

  type GroupUserPermission = {
    role?: RoleLevel;
    state?: "active" | "left" | "removed" | "banned";
    /** 是否被群封禁；当前等同于成员状态 banned。 */
    is_banned?: boolean;
    /** 是否已被移出群。 */
    is_removed?: boolean;
    /** 是否已主动退群。 */
    is_left?: boolean;
    /** 是否正在被禁言，包含群全体禁言、普通成员禁言、单成员禁言。 */
    is_muted?: boolean;
    /** 是否因为群全体禁言或普通成员禁言而不能发言。 */
    group_muted?: boolean;
    /** 是否因为单成员禁言而不能发言。 */
    member_muted?: boolean;
    mute_until?: RFC3339Time;
    can_send_message?: boolean;
    can_invite_member?: boolean;
    can_audit_application?: boolean;
    can_mute_member?: boolean;
    can_remove_member?: boolean;
    can_clear_message?: boolean;
    can_update_profile?: boolean;
    /** 当前用户已读的群公告版本。 */
    announcement_read_version?: Uint64String;
    /** 当前群公告是否未读。 */
    announcement_unread?: boolean;
  };

  type HandleFriendApplicationRequest = {
    application_id: string;
  };

  type HealthResponse =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { status?: string };
    };

  type ImageItem = {
    media_id?: string;
    url?: string;
    thumbnail_url?: string;
    width?: number;
    height?: number;
    size_bytes?: Uint64String;
  };

  type ImageMessage = {
    list: ImageItem[];
  };

  type ImageMessageBody = {
    image: ImageMessage;
  };

  type InviteGroupMemberRequest = {
    group_id: string;
    member_user_ids: string[];
  };

  type LeaveGroupRequest = {
    group_id: string;
  };

  type ListBlacklistEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: BlacklistListItem[]; total?: number };
    };

  type ListBlacklistRequest = {
    page?: number;
    page_size?: number;
  };

  type ListClientVersionEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: { client_version?: ClientVersion }[]; total?: number };
    };

  type ListClientVersionRequest = {
    /** 可选平台筛选；传入时不能仅包含空白字符。 */
    platform?: string;
    page?: number;
    page_size?: number;
  };

  type ListConversationEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: {
        list?: { conversation?: Conversation }[];
        next_page_token?: string;
      };
    };

  type ListConversationRequest = {
    /** 分页大小。 */
    limit?: number;
    /** 上一页返回的分页游标。 */
    page_token?: string;
  };

  type ListFriendApplicationEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: FriendApplicationListItem[]; total?: number };
    };

  type ListFriendApplicationRequest = {
    status?: FriendApplicationStatus;
    page?: number;
    page_size?: number;
  };

  type ListFriendEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: FriendListItem[]; total?: number };
    };

  type ListFriendRequest = {
    page?: number;
    page_size?: number;
  };

  type ListGroupMemberEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: {
        list?: { member?: GroupMember; user?: User }[];
        next_page_token?: string;
      };
    };

  type ListGroupMemberRequest = {
    group_id: string;
    limit?: number;
    page_token?: string;
    filter?: GroupMemberFilter;
    /** 是否仅查看被单独禁言的成员。 */
    muted_only?: boolean;
  };

  type ListPlatformTermEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: PlatformTerm[]; total?: number };
    };

  type ListPlatformTermRequest = {
    /** 可选业务键筛选；传入时不能仅包含空白字符。 */
    key?: string;
    is_enable?: boolean;
    page?: number;
    page_size?: number;
  };

  type ListSysPermissionEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: SysPermission[]; total?: number };
    };

  type ListSysPermissionRequest = {
    page?: number;
    page_size?: number;
    keyword?: string;
    type?: string;
    is_enable?: boolean;
  };

  type ListSysRoleEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: SysRoleWrap[]; total?: number };
    };

  type ListSysRoleRequest = {
    page?: number;
    page_size?: number;
    keyword?: string;
    is_enable?: boolean;
  };

  type ListSysUserEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: SysUserWrap[]; total?: number };
    };

  type ListSysUserRequest = {
    page?: number;
    page_size?: number;
    keyword?: string;
    role_id?: number;
    status?: AccountStatus;
  };

  type LocationMessage = {
    latitude?: number;
    longitude?: number;
    name?: string;
    address?: string;
  };

  type LocationMessageBody = {
    location: LocationMessage;
  };

  type LogoutRequest = {
    access_token?: string;
  };

  type MarkdownMessage = {
    text: string;
  };

  type MarkdownMessageBody = {
    markdown: MarkdownMessage;
  };

  type MarkFriendApplicationsReadRequest = {
    /** 可选。不传或传空数组时，标记当前用户收到的全部待验证申请为已读。 */
    application_ids?: string[];
  };

  type MarkReadRequest = {
    /** 要标记已读的会话 ID。 */
    conversation_id: string;
    /** 前端确认已读到的消息序号；不传或传 0 表示标记到服务端当前最新消息序号，兼容旧逻辑。 */
    read_seq?: Uint64String;
  };

  type MentionMessage = {
    text: string;
    targets?: MentionTarget[];
  };

  type MentionMessageBody = {
    mention: MentionMessage;
  };

  type MentionTarget = {
    /** @目标类型：user=用户，all=所有人 */
    type?: "user" | "all";
    /** 被@用户ID；type=all时为空 */
    user_id?: string;
    /** 展示昵称；type=all时为所有人 */
    nickname?: string;
  };

  type MergeMessage = {
    title: string;
    abstracts?: string[];
    url?: string;
  };

  type MergeMessageBody = {
    merge: MergeMessage;
  };

  type Message = {
    msg_id?: string;
    conversation_id?: string;
    msg_seq?: Uint64String;
    sender_id?: string;
    client_msg_id?: string;
    type?: MessageType;
    /** 消息状态。1=发送中，2=发送成功，3=发送失败，5=已删除。 */
    status?: 1 | 2 | 3 | 5;
    body?: MessageBody;
    /** 消息内容版本，首次发送为 1，每次编辑递增。 */
    version?: Uint64String;
    /** 最后编辑时间；未编辑时为空。 */
    edited_at?: RFC3339Time;
    /** 消息级@目标列表。 */
    mentions?: MentionTarget[];
    sent_at?: RFC3339Time;
    updated_at?: RFC3339Time;
    /** 消息自动删除时间；空字符串表示不会自动删除。 */
    expire_at?: RFC3339Time;
    forward_origin?: ForwardOrigin;
  };

  type MessageBody = Record<string, any>;

  type MessageType =
    | 101
    | 102
    | 103
    | 104
    | 105
    | 106
    | 107
    | 108
    | 109
    | 110
    | 113
    | 114
    | 115
    | 118
    | 1200
    | 1201
    | 1202
    | 1400
    | 1501
    | 1502
    | 1503
    | 1504
    | 1507
    | 1508
    | 1509
    | 1510
    | 1511
    | 1512
    | 1513
    | 1514
    | 1515
    | 1519
    | 1520
    | 1601
    | 1602
    | 1603
    | 1604
    | 1605
    | 1606
    | 1607
    | 1608
    | 1701
    | 2102;

  type MessageUpdate = {
    update_id?: string;
    conversation_id?: string;
    update_seq?: Uint64String;
    type?: "edited" | "deleted";
    target_msg_id?: string;
    operator_user_id?: string;
    delete_scope?: "self" | "all";
    message?: Message;
    occurred_at?: RFC3339Time;
  };

  type OnlineStatus = "unknown" | "online" | "offline";

  type OpenConversationDirectRelationEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { conversation?: Conversation };
    };

  type OpenConversationDirectRelationRequest = {
    /** 对方用户 ID。 */
    peer_user_id: string;
  };

  type PlatformTerm = {
    id?: Uint64String;
    /** 条款业务键，例如 user_agreement、privacy_policy。 */
    key?: string;
    title?: string;
    /** 条款正文。 */
    content?: string;
    /** 条款版本号。 */
    version?: string;
    is_enable?: boolean;
    created_at?: RFC3339Time;
    updated_at?: RFC3339Time;
  };

  type PlatformTermEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { term?: PlatformTerm };
    };

  type PositiveUint64String = string;

  type postV1AdminAuthCheckTokenParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthLoginParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthLogoutParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthMeParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthPasswordChangeParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthRefreshTokenParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthTwoFactorConfirmParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthTwoFactorSetupParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthTwoFactorVerifyParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminClientVersionsCreateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminClientVersionsDetailParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminClientVersionsListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminClientVersionsUpdateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminGroupsListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminGroupsUpdateStatusParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminGroupsUpgradeParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminMessagesTraceParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminPermissionsCheckParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminPermissionsCreateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminPermissionsDeleteParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminPermissionsDetailParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminPermissionsListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminPermissionsUpdateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminRolesCreateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminRolesDeleteParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminRolesDetailParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminRolesListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminRolesUpdateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminSystemUsersCreateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminSystemUsersDeleteParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminSystemUsersDetailParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminSystemUsersListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminSystemUsersResetPasswordParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminSystemUsersUpdateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminTermsCreateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminTermsDetailParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminTermsListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminTermsUpdateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersBanParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersBatchBanParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersBatchUnbanParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersDetailParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersOperationLogsListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersUnbanParams = {
    ""?: any;
    ""?: any;
  };

  type PullMessagesData = {
    list?: { message?: Message }[];
    /** 本次消息列表中出现过的发送者用户资料，前端可按 message.sender_id 映射。 */
    users?: User[];
    next_seq?: Uint64String;
    has_more?: boolean;
    latest_seq?: Uint64String;
  };

  type PullMessagesEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: PullMessagesData;
    };

  type PullMessagesRequest = {
    conversation_id: string;
    from_seq: Uint64String;
    limit?: number;
    /** 是否倒序拉取。 */
    desc?: boolean;
  };

  type PullMessageUpdatesEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: {
        list?: MessageUpdate[];
        next_update_seq?: Uint64String;
        has_more?: boolean;
      };
    };

  type PullMessageUpdatesRequest = {
    conversation_id: string;
    after_update_seq?: Uint64String;
    limit?: number;
  };

  type QuoteMessage = {
    msg_id: string;
    text?: string;
    reply_text?: string;
    /** 被引用消息发送人用户 ID，由服务端根据 msg_id 填充。 */
    sender_id?: string;
  };

  type QuoteMessageBody = {
    quote: QuoteMessage;
  };

  type ReadyResponse =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { status?: string; im_core_grpc_addr?: string };
    };

  type RefreshTokenRequest = {
    refresh_token: string;
    /** 刷新后新会话使用的设备标识，不能仅包含空白字符。 */
    device_id: string;
  };

  type RegisterUserRequest = {
    type: AccountType;
    /** 账号输入框的值。type=account 时传账号名，type=email 时传邮箱，type=phone 时传手机号。 */
    account: string;
    /** type=phone 时前端传入手机号区号，仅用于记录和展示，例如 +86。 */
    phone_area_code?: string;
    /** type=account 时必填；type=email 或 type=phone 时不需要。 */
    password?: string;
    /** type=email 或 type=phone 时必填；当前开发阶段固定传 666666，后续接短信或邮件发送。 */
    verification_code?: string;
    device_id: string;
  };

  type RemoveGroupMemberRequest = {
    group_id: string;
    member_user_id: string;
  };

  type ResetPasswordRequest = {
    /** 当前旧密码。 */
    old_password: string;
    /** 新密码。 */
    password: string;
  };

  type ResetSysUserPasswordRequest = {
    id: number;
    /** 重置后的临时密码；现有登录态立即失效，账号下次登录后必须修改。 */
    password: string;
  };

  type ResponseBase = {
    code: ApiCode;
    message: string;
  };

  type RFC3339Time = string;

  type RoleLevel = 20 | 60 | 100;

  type SendMessageEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { message?: Message };
    };

  type SendMessageRequest = {
    conversation_id: string;
    /** 客户端生成的幂等 ID，重试必须保持不变。 */
    client_msg_id: string;
    body: MessageBody;
    /** 消息级@目标列表；文本、图片、视频、文件、引用、Markdown 等消息都可以携带。 */
    mentions?: MentionTarget[];
  };

  type SetupTwoFactorEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { secret?: string; otpauth_uri?: string };
    };

  type SetupTwoFactorRequest = {
    /** 登录返回且 `next_step=bind_two_factor` 的一次性预认证 token。 */
    pre_auth_token: string;
  };

  type SubjectType = "user" | "sys_user";

  type SyncConversationsEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: {
        list?: { state?: ConversationUserSyncState }[];
        next_page_token?: string;
        latest_version?: Uint64String;
      };
    };

  type SyncConversationsRequest = {
    limit?: number;
    page_token?: string;
    after_version?: Uint64String;
  };

  type SysPermission = {
    id?: number;
    key?: string;
    name?: string;
    description?: string;
    type?: string;
    is_enable?: boolean;
    created_at?: RFC3339Time;
    updated_at?: RFC3339Time;
  };

  type SysPermissionEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { permission?: SysPermission };
    };

  type SysRole = {
    id?: number;
    code?: string;
    name?: string;
    description?: string;
    is_enable?: boolean;
    created_at?: RFC3339Time;
    updated_at?: RFC3339Time;
  };

  type SysRoleEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { role?: SysRole; permissions?: SysRolePermissionWrap };
    };

  type SysRolePermissionWrap = {
    permission_ids?: number[];
    permissions?: SysPermission[];
  };

  type SysRoleWrap = {
    role?: SysRole;
    permissions?: SysRolePermissionWrap;
  };

  type SystemMessage = {
    event_type?: string;
    text?: string;
    extra?: Record<string, any>;
  };

  type SystemMessageBody = {
    system: SystemMessage;
  };

  type SysUser = {
    id?: number;
    username?: string;
    display_name?: string;
    status?: AccountStatus;
    description?: string;
    last_login_at?: RFC3339Time;
    last_login_ip?: string;
    created_at?: RFC3339Time;
    updated_at?: RFC3339Time;
  };

  type SysUserEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { sys_user?: SysUser; rbac?: SysUserRBAC };
    };

  type SysUserLoginEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: {
        next_step: "change_password" | "bind_two_factor" | "verify_two_factor";
        pre_auth_token: string;
        expires_in: number;
      };
    };

  type SysUserLoginRequest = {
    /** 后台用户名，不能仅包含空白字符。 */
    username: string;
    /** 当前登录密码，不能仅包含空白字符。 */
    password: string;
  };

  type SysUserRBAC = {
    role_ids?: number[];
    roles?: string[];
    permissions?: string[];
  };

  type SysUserTokenEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { token?: Token };
    };

  type SysUserWrap = {
    sys_user?: SysUser;
    rbac?: SysUserRBAC;
  };

  type TextMessage = {
    text: string;
  };

  type TextMessageBody = {
    text: TextMessage;
  };

  type Token = {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
    subject_type?: SubjectType;
    subject_id?: string;
  };

  type TypingMessage = {
    action: string;
  };

  type TypingMessageBody = {
    typing: TypingMessage;
  };

  type Uint64String = string;

  type UpdateClientVersionRequest = {
    id: PositiveUint64String;
    platform?: string;
    version?: string;
    /** 传入时必须大于 0。 */
    build_number?: PositiveUint64String;
    force_update?: boolean;
    /** 传空字符串表示清空下载地址；非空时必须是合法的 HTTP 或 HTTPS URL。 */
    download_url?: string;
    title?: string;
    description?: string;
    is_enable?: boolean;
  };

  type UpdateFriendProfileRequest = {
    friend_user_id: string;
    /** 好友别名；未传不更新，传空字符串表示清空别名。 */
    alias?: string;
    /** 好友手机号备注；未传不更新，传空字符串表示清空手机号备注。 */
    phone?: string;
    /** 好友备注；未传不更新，传空字符串表示清空备注。 */
    remark?: string;
    /** 好友标签；未传不更新，传空数组表示清空标签。 */
    tags?: string[];
  };

  type UpdateGroupAdminPermissionRequest = {
    group_id: string;
    /** 全体禁言时管理员是否可以发消息；未开启全体禁言时不限制管理员日常发言。 */
    admin_send_message?: boolean;
    /** 管理员是否可以手动禁言成员。 */
    admin_mute_member?: boolean;
    /** 管理员是否可以移除成员。 */
    admin_remove_member?: boolean;
    /** 管理员是否可以邀请好友加群。 */
    admin_invite_member?: boolean;
    /** 管理员是否可以审核入群申请或邀请。 */
    admin_audit_application?: boolean;
    /** 管理员是否可以清空群聊消息。 */
    admin_clear_message?: boolean;
    /** 管理员是否可以修改群资料。 */
    admin_update_profile?: boolean;
  };

  type UpdateGroupMemberMuteEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { member?: GroupMember };
    };

  type UpdateGroupMemberMuteRequest = {
    group_id: string;
    member_user_id: string;
    /** 单成员禁言到期时间；不传或空字符串表示取消单独禁言。 */
    mute_until?: RFC3339Time;
  };

  type UpdateGroupMuteRequest = {
    group_id: string;
    /** 全体禁言开关；普通成员不能发言，群主仍可发言，管理员由 admin_send_message 控制。 */
    mute_all?: boolean;
    /** 普通成员禁言开关；开启后仅普通成员不能发言。 */
    mute_member?: boolean;
    /** 群发言频率开关；开启后普通成员按 send_frequency_seconds 限制发言间隔。 */
    send_frequency_enabled?: boolean;
    /** 群发言频率间隔秒数。 */
    send_frequency_seconds?: 30 | 60 | 180 | 300 | 600 | 1800 | 3600;
  };

  type UpdateGroupRequest = {
    group_id: string;
    title?: string;
    avatar_url?: string;
    /** 群简介；不传或空字符串表示保持不变。 */
    description?: string;
    /** 群公告；不传或空字符串表示保持不变。 */
    announcement?: string;
  };

  type UpdateGroupSettingRequest = {
    group_id: string;
    /** 全体禁言开关；未传保持原值。 */
    mute_all?: boolean;
    /** 普通成员禁言开关；未传保持原值。 */
    mute_member?: boolean;
    /** 群发言频率开关；未传保持原值。 */
    send_frequency_enabled?: boolean;
    /** 群发言频率间隔秒数；未传保持原值。 */
    send_frequency_seconds?: 30 | 60 | 180 | 300 | 600 | 1800 | 3600;
    /** 入群是否需要审核；未传保持原值。 */
    join_approval_required?: boolean;
    /** 是否允许群成员互相加好友；未传保持原值。 */
    allow_member_add_friend?: boolean;
    /** 是否允许普通成员邀请用户入群；未传保持原值。 */
    allow_member_invite?: boolean;
    /** 是否允许群成员设置群昵称；未传保持原值。 */
    allow_member_nickname?: boolean;
  };

  type UpdateMessageEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { target_message?: Message; update?: MessageUpdate };
    };

  type UpdateMessageRequest = {
    conversation_id: string;
    target_msg_id: string;
    /** 操作消息的客户端幂等 ID。 */
    client_msg_id: string;
    edit?: EditMessageOperation;
    delete?: DeleteMessageOperation;
  };

  type UpdatePlatformTermRequest = {
    id: PositiveUint64String;
    /** 传入时不能仅包含空白字符。 */
    title?: string;
    /** 传入时不能仅包含空白字符。 */
    content?: string;
    /** 传入时不能仅包含空白字符。 */
    version?: string;
    is_enable?: boolean;
  };

  type UpdateSysPermissionRequest =
    // #/components/schemas/CreateSysPermissionRequest
    CreateSysPermissionRequest & {
      id: number;
    };

  type UpdateSysRoleRequest =
    // #/components/schemas/CreateSysRoleRequest
    CreateSysRoleRequest & {
      id: number;
    };

  type UpdateSysUserRequest = {
    id: number;
    username?: string;
    display_name?: string;
    description?: string;
    status?: AccountStatus;
    role_ids?: number[];
  };

  type UpdateUserProfileRequest = {
    nickname?: string;
    avatar_url?: string;
    /** 性别。0=未设置或保密，1=男，2=女；不传时保持原值。 */
    gender?: 0 | 1 | 2;
    /** 个人简介；不传时保持原值，传空字符串时清空。 */
    bio?: string;
  };

  type User = {
    user_id?: string;
    account?: string;
    phone?: string;
    /** 手机号区号，仅用于记录和展示，例如 +86。 */
    phone_area_code?: string;
    email?: string;
    nickname?: string;
    avatar_url?: string;
    /** 性别。0=未设置或保密，1=男，2=女。 */
    gender?: 0 | 1 | 2;
    /** 个人简介。 */
    bio?: string;
    /** 注册 IP。 */
    register_ip?: string;
    /** 最后登录 IP。 */
    last_login_ip?: string;
    last_login_at?: RFC3339Time;
    status?: AccountStatus;
    created_at?: RFC3339Time;
    updated_at?: RFC3339Time;
  };

  type UserAuthEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { token?: Token; user?: User; is_new_user?: boolean };
    };

  type UserEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { user?: User };
    };

  type UserLoginRequest = {
    type: AccountType;
    /** 账号输入框的值。type=account 时传账号名，type=email 时传邮箱，type=phone 时传手机号。 */
    account: string;
    /** type=phone 时前端传入手机号区号，仅用于记录和展示，例如 +86。 */
    phone_area_code?: string;
    /** type=account 时必填；type=email 或 type=phone 时不需要。 */
    password?: string;
    /** type=email 或 type=phone 时必填；当前开发阶段固定传 666666，后续接短信或邮件发送。 */
    verification_code?: string;
    device_id: string;
  };

  type VerifyTwoFactorRequest = {
    /** 登录返回且 `next_step=verify_two_factor` 的一次性预认证 token。 */
    pre_auth_token: string;
    /** 认证器应用中当前的 6 位动态验证码。 */
    code: string;
  };

  type VideoMessage = {
    media_id?: string;
    url?: string;
    thumbnail_url?: string;
    duration_seconds?: number;
    width?: number;
    height?: number;
    size_bytes?: Uint64String;
  };

  type VideoMessageBody = {
    video: VideoMessage;
  };
}
