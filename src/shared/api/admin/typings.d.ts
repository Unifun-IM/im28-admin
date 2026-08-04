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

  type AdminAddIPBlacklistRequest = {
    /** 一次加入黑名单的 IP 地址；支持 IPv4 和 IPv6，整批原子处理。 */
    ip_addresses: string[];
    /** 封控原因，不能仅包含空白字符。 */
    reason: string;
    /** 可选的原因说明，传入时不能仅包含空白字符。 */
    reason_description?: string;
    /** 当前管理员的 Google Authenticator 6 位动态验证码；校验后不可重复使用。 */
    two_factor_code: string;
  };

  type AdminAddWhitelistUserRequest = {
    /** 已注册的 C 端用户 ID。 */
    user_id: string;
    /** 可选的加入白名单原因；传入时不能仅包含空白字符。 */
    reason?: string;
    /** 当前管理员的 Google Authenticator 6 位动态验证码；操作成功后不可重复使用。 */
    two_factor_code: string;
  };

  type AdminBannedUserWrap = {
    user?: User;
    operator?: SysUser;
    /** 操作类型；当前黑名单列表固定为 ban。 */
    action?: "ban";
    /** 封禁周期。temporary=限时，permanent=永久。 */
    ban_period?: "temporary" | "permanent";
    /** 限时封禁截止时间，使用 RFC3339；永久封禁时为空字符串。 */
    banned_until?: string;
    /** 封禁原因。 */
    reason?: string;
    /** 封禁原因说明。 */
    reason_description?: string;
    operated_at?: RFC3339Time;
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
    /** 当前管理员的 Google Authenticator 6 位动态验证码；操作成功后不可重复使用。 */
    two_factor_code: string;
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
    /** 当前管理员的 Google Authenticator 6 位动态验证码；整批操作成功后不可重复使用。 */
    two_factor_code: string;
  };

  type AdminBatchRemoveIPBlacklistRequest = {
    /** 需要恢复访问的 IP 地址；整批原子处理。 */
    ip_addresses: string[];
    /** 可选的恢复说明，传入时不能仅包含空白字符。 */
    reason_description?: string;
    /** 当前管理员的 Google Authenticator 6 位动态验证码；校验后不可重复使用。 */
    two_factor_code: string;
  };

  type AdminBatchRemoveWhitelistUserRequest = {
    /** 需要移出白名单的用户 ID，单次最多 100 个。 */
    user_ids: string[];
    /** 当前管理员的 Google Authenticator 6 位动态验证码；整批操作成功后不可重复使用。 */
    two_factor_code: string;
  };

  type AdminBatchUnbanUserRequest = {
    /** 需要解禁的用户 ID，单次最多 100 个。 */
    user_ids: string[];
    /** 解禁原因，应用于本批全部用户，不能仅包含空白字符。 */
    reason: string;
    /** 原因说明，应用于本批全部用户，不能仅包含空白字符。 */
    reason_description: string;
    /** 当前管理员的 Google Authenticator 6 位动态验证码；整批操作成功后不可重复使用。 */
    two_factor_code: string;
  };

  type AdminConversationGlobalSetting =
    // #/components/schemas/AdminUpdateConversationGlobalSettingRequest
    AdminUpdateConversationGlobalSettingRequest & {
      updated_at?: RFC3339Time;
    };

  type AdminConversationMessage = {
    /** 消息唯一 ID。 */
    msg_id?: string;
    /** 会话内消息序号，以字符串返回，列表按该字段倒序排列。 */
    msg_seq?: string;
    /** 消息发送者用户 ID；使用该值关联 data.users[].user_id 获取昵称和头像。 */
    sender_id?: string;
    type?: MessageType;
    body?: MessageBody;
    /** 消息状态。1=发送中，2=发送成功，3=发送失败，5=已删除；已删除消息通常不会出现在列表中。 */
    status?: number;
    /** 消息发送时间，RFC3339 格式。 */
    sent_at?: string;
  };

  type AdminConversationUser = {
    /** 用户 ID，用于关联 message.sender_id。 */
    user_id?: string;
    /** 用户昵称。 */
    nickname?: string;
    /** 用户头像 URL。 */
    avatar_url?: string;
  };

  type AdminDetailGroupEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: {
        group?: Group;
        creator?: User;
        owner?: User;
        managers?: AdminDetailGroupManagerWrap[];
        last_active_at?: string;
      };
    };

  type AdminDetailGroupManagerWrap = {
    member?: GroupMember;
    user?: User;
  };

  type AdminDetailGroupRequest = {
    group_id: string;
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

  type AdminGetConversationGlobalSettingEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { setting?: AdminConversationGlobalSetting };
    };

  type AdminGetGroupGlobalSettingEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { setting?: AdminGroupGlobalSetting };
    };

  type AdminGroupGlobalSetting = {
    /** 创建群最少人数配置。 */
    create_group_min_member_count?: number;
    /** 普通群人数上限配置。 */
    normal_group_member_limit?: number;
    /** 群公告字数上限配置。 */
    announcement_max_length?: 500 | 1000 | 2000;
    updated_at?: RFC3339Time;
  };

  type AdminGroupOperationLog = {
    log_id?: string;
    group_id?: string;
    operator_type?: "user" | "sys_user";
    operator_id?: string;
    action?: string;
    description?: string;
    target_user_ids?: string[];
    operated_at?: RFC3339Time;
  };

  type AdminGroupOperationLogWrap = {
    log?: AdminGroupOperationLog;
    /** operator_type=user 时返回，否则为 null。 */
    operator_user?: User;
    /** operator_type=sys_user 时返回，否则为 null。 */
    operator_sys_user?: SysUser;
  };

  type AdminIPBlacklistEntry = {
    /** 被限制访问的 IPv4 或 IPv6 地址。 */
    ip_address?: string;
    operator?: SysUser;
    /** 封控原因。 */
    reason?: string;
    /** 封控原因说明。 */
    reason_description?: string;
    operated_at?: RFC3339Time;
    /** 最近一次被网关拦截的访问时间；从未命中时为空，命中时间最多每分钟更新一次。 */
    last_accessed_at?: RFC3339Time;
  };

  type AdminListBannedUserEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: AdminBannedUserWrap[]; total?: number };
    };

  type AdminListBannedUserRequest = {
    /** 查询内容，不能仅包含空白字符。keyword_type 为空时同时匹配用户 ID、账号、手机号、邮箱和昵称。 */
    keyword?: string;
    /** 字段化查询类型，只能在同时传入 keyword 时使用；除 nickname 为包含匹配外，其余类型均为精确匹配。 */
    keyword_type?: "user_id" | "account" | "phone" | "email" | "nickname";
    /** 封禁周期。temporary=限时，permanent=永久。 */
    ban_period?: "temporary" | "permanent";
    /** 执行最近一次封禁操作的后台用户 ID。 */
    operator_id?: string;
    /** 最近一次封禁操作时间范围起点；与 operated_end_at 同时传入时不得晚于结束时间。 */
    operated_start_at?: RFC3339Time;
    operated_end_at?: RFC3339Time;
    page?: number;
    page_size?: number;
  };

  type AdminListConversationMessageEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: {
        list?: { message?: AdminConversationMessage }[];
        users?: AdminConversationUser[];
        next_seq?: string;
        has_more?: boolean;
      };
    };

  type AdminListConversationMessageRequest = {
    /** 要查看其消息视角的 C 端用户 ID，用于成员关系和消息可见性校验，不是发送者筛选条件。 */
    user_id: string;
    /** 要查看的会话 ID，从 /v1/admin/conversations/list 返回结果中获取。 */
    conversation_id: string;
    /** 向更早消息翻页的游标。首次传 0 或省略；后续请求必须传上一页的 data.next_seq。结果按 msg_seq 倒序返回。 */
    before_seq?: string;
    /** 单页最多返回的消息数量。 */
    limit?: number;
  };

  type AdminListGroupEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: { group?: Group; owner?: User }[]; total?: number };
    };

  type AdminListGroupOperationLogEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: AdminGroupOperationLogWrap[]; total?: number };
    };

  type AdminListGroupOperationLogRequest = {
    group_id: string;
    /** 按操作类型精确筛选，例如 `group_created`、`title_updated`、`members_removed`。 */
    action?: string;
    /** 操作时间起点，必须早于或等于 `operated_end_at`。 */
    operated_start_at?: RFC3339Time;
    /** 操作时间终点。 */
    operated_end_at?: RFC3339Time;
    page?: number;
    page_size?: number;
  };

  type AdminListGroupRequest = {
    /** 群搜索关键词；`keyword_type=group_id` 时精确匹配群 ID，`keyword_type=title` 时模糊匹配群名称；不传类型时同时匹配两者。 */
    keyword?: string;
    /** 关键词类型；传此字段时必须同时传 `keyword`。 */
    keyword_type?: "group_id" | "title";
    owner_user_id?: string;
    status?: GroupStatus;
    /** 群创建时间起点，必须早于或等于 `created_end_at`。 */
    created_start_at?: RFC3339Time;
    /** 群创建时间终点。 */
    created_end_at?: RFC3339Time;
    /** 排序字段；不传时按创建时间排序。 */
    sort_by?: "member_count" | "created_at";
    /** 排序方向；传此字段时必须同时传 `sort_by`，不传时默认 `desc`。 */
    sort_order?: "asc" | "desc";
    page?: number;
    page_size?: number;
  };

  type AdminListIPBlacklistEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: AdminIPBlacklistEntry[]; total?: number };
    };

  type AdminListIPBlacklistRequest = {
    /** 按 IP 地址包含查询；支持 IPv4 和 IPv6。 */
    ip_address?: string;
    /** 按封控原因精确查询。 */
    reason?: string;
    /** 加入黑名单时间范围起点；不得晚于 operated_end_at。 */
    operated_start_at?: RFC3339Time;
    operated_end_at?: RFC3339Time;
    page?: number;
    page_size?: number;
  };

  type AdminListUserContactEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: AdminUserContactWrap[]; total?: number };
    };

  type AdminListUserConversationEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: {
        list?: { conversation?: AdminUserConversation }[];
        total?: number;
      };
    };

  type AdminListUserConversationQueryEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: AdminUserConversationQueryItem[]; total?: number };
    };

  type AdminListUserConversationQueryRequest = {
    /** 用户关键词类型；传 keyword 时必填。 */
    keyword_type?: "user_id" | "nickname" | "phone" | "email" | "account";
    /** 用户关键词。为空时固定返回空列表，不会默认查询全部用户。 */
    keyword?: string;
    /** 批量搜索的用户 ID，单次最多 100 个。keyword 和 user_ids 都为空时固定返回空列表。 */
    user_ids?: string[];
    /** 用户状态筛选。active=正常，disabled=黑名单；不传表示全部。当前系统没有独立的注销状态。 */
    status?: "active" | "disabled";
    page?: number;
    page_size?: number;
  };

  type AdminListUserConversationRequest = {
    /** 要查看会话的 C 端用户 ID。 */
    user_id: string;
    page?: number;
    page_size?: number;
  };

  type AdminListUserEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: AdminUserWrap[]; total?: number };
    };

  type AdminListUserGroupEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: AdminUserGroupWrap[]; total?: number };
    };

  type AdminListUserOperationLogEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: AdminUserOperationLogWrap[]; total?: number };
    };

  type AdminListUserOperationLogRequest = {
    /** 用户搜索内容，不能仅包含空白字符；传入时必须同时传 keyword_type。 */
    keyword?: string;
    /** 用户搜索字段；传入时必须同时传 keyword。 */
    keyword_type?: "user_id" | "phone" | "email" | "account" | "nickname";
    /** 行为类型机器标识，例如 register、login、login_failed、logout、update_avatar、update_profile、send_message；为空时查询全部类型。 */
    behavior_type?: string;
    /** 客户端类型；server 表示服务端任务或无用户设备的系统行为。 */
    client_type?: "ios" | "android" | "web" | "server";
    /** 操作时间范围起点；与 operated_end_at 同时传入时不得晚于结束时间。 */
    operated_start_at?: RFC3339Time;
    operated_end_at?: RFC3339Time;
    /** 按操作时间排序。 */
    sort_order?: "asc" | "desc";
    page?: number;
    page_size?: number;
  };

  type AdminListUserRelationRequest = {
    /** 需要查询的 C 端用户 ID。 */
    user_id: string;
    page?: number;
    page_size?: number;
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

  type AdminListWhitelistedUserEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: AdminWhitelistedUserWrap[]; total?: number };
    };

  type AdminListWhitelistedUserRequest = {
    /** 查询内容，不能仅包含空白字符。keyword_type 为空时同时匹配用户 ID、账号、手机号、邮箱和昵称。 */
    keyword?: string;
    /** 字段化查询类型，只能在同时传入 keyword 时使用；除 nickname 为包含匹配外，其余类型均为精确匹配。 */
    keyword_type?: "user_id" | "account" | "phone" | "email" | "nickname";
    /** 将用户加入白名单的后台用户 ID。 */
    operator_id?: string;
    /** 加入白名单时间范围起点；与 operated_end_at 同时传入时不得晚于结束时间。 */
    operated_start_at?: RFC3339Time;
    operated_end_at?: RFC3339Time;
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

  type AdminRemoveIPBlacklistRequest = {
    /** 需要恢复访问的 IPv4 或 IPv6 地址。 */
    ip_address: string;
    /** 可选的恢复说明，传入时不能仅包含空白字符。 */
    reason_description?: string;
    /** 当前管理员的 Google Authenticator 6 位动态验证码；校验后不可重复使用。 */
    two_factor_code: string;
  };

  type AdminRemoveWhitelistUserRequest = {
    user_id: string;
    /** 当前管理员的 Google Authenticator 6 位动态验证码；操作成功后不可重复使用。 */
    two_factor_code: string;
  };

  type AdminSearchUserEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { list?: User[] };
    };

  type AdminSearchUserRequest = {
    /** 搜索字段类型。用户 ID、手机号、邮箱和用户账号使用精确匹配，用户昵称使用不区分大小写的包含匹配。 */
    type: "user_id" | "phone" | "email" | "account" | "nickname";
    /** 搜索内容，不能仅包含空白字符。 */
    keyword: string;
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
    /** 当前管理员的 Google Authenticator 6 位动态验证码；操作成功后不可重复使用。 */
    two_factor_code: string;
  };

  type AdminUpdateConversationGlobalSettingRequest = {
    /** 是否启用文字消息。 */
    text_message_enabled: boolean;
    /** 是否启用图片消息。 */
    image_message_enabled: boolean;
    /** 是否启用视频消息。 */
    video_message_enabled: boolean;
    /** 是否启用音频消息。 */
    audio_message_enabled: boolean;
    /** 是否启用文件消息。 */
    file_message_enabled: boolean;
    /** 是否启用语音消息。 */
    voice_message_enabled: boolean;
    /** 是否启用名片消息。 */
    card_message_enabled: boolean;
    /** 文字消息字数上限。 */
    text_max_length: 500 | 1000 | 2000;
    /** 图片大小上限，单位为字节，对应 5M、10M、20M。 */
    image_max_size_bytes: 5242880 | 10485760 | 20971520;
    /** 视频大小上限，单位为字节，对应 50M、100M、200M。 */
    video_max_size_bytes: 52428800 | 104857600 | 209715200;
    /** 音频大小上限，单位为字节，对应 50M、100M、200M。 */
    audio_max_size_bytes: 52428800 | 104857600 | 209715200;
    /** 文件大小上限，单位为字节，对应 50M、100M、200M。 */
    file_max_size_bytes: 52428800 | 104857600 | 209715200;
    /** 语音最短时长，单位为秒。 */
    voice_min_duration_seconds: 1 | 2 | 3;
    /** 语音最长时长，单位为秒，对应 30 秒、1 分钟、2 分钟。 */
    voice_max_duration_seconds: 30 | 60 | 120;
    /** 相册单次选择数量上限。 */
    album_selection_limit: 9 | 12 | 20;
  };

  type AdminUpdateGroupGlobalSettingRequest = {
    /** 创建群最少人数配置。当前仅保存，不参与创建群校验。 */
    create_group_min_member_count: number;
    /** 普通群人数上限配置。当前仅保存，不参与邀请、申请或成员数量校验。 */
    normal_group_member_limit: number;
    /** 群公告字数上限配置。当前仅保存，不参与群公告长度校验。 */
    announcement_max_length: 500 | 1000 | 2000;
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

  type AdminUploadCredential = {
    /** OSS 表单字段 OSSAccessKeyId。 */
    access_key_id: string;
    /** Base64 编码的上传策略。 */
    policy: string;
    /** OSS 表单上传签名。 */
    signature: string;
    /** 后端生成的固定对象 Key，前端作为 key 字段提交；目录固定为 admin/images。 */
    object_key: string;
    /** OSS 表单上传地址。 */
    host: string;
    /** 上传成功后的访问 URL，保存系统 Logo 等后台图片时使用该值。 */
    url: string;
    /** 凭证过期 Unix 时间戳，单位秒。 */
    expire: number;
  };

  type AdminUploadCredentialEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: AdminUploadCredential;
    };

  type AdminUploadCredentialRequest = {
    /** 后台图片扩展名，可带或不带英文句点；不传默认 jpg。 */
    ext?: string;
  };

  type AdminUserContactWrap = {
    friend?: Friend;
    user?: User;
  };

  type AdminUserConversation = {
    conversation_id?: string;
    /** 1=单聊，3=群聊，4=通知。 */
    type?: number;
    /** 单聊对端用户 ID；非单聊为空字符串。 */
    peer_user_id?: string;
    /** 群 ID；非群聊为空字符串。 */
    group_id?: string;
    /** 单聊为对端昵称，群聊为群名称。 */
    title?: string;
    /** 单聊为对端头像，群聊为群头像。 */
    avatar_url?: string;
    last_message?: AdminConversationMessage;
    last_active_at?: string;
  };

  type AdminUserConversationQueryItem = {
    user_id?: string;
    nickname?: string;
    avatar_url?: string;
    phone?: string;
    phone_area_code?: string;
    email?: string;
    account?: string;
    status?: AccountStatus;
    /** 当前使用用户最后登录时间作为最后活跃时间；从未登录时为空字符串。 */
    last_active_at?: string;
    registered_at?: RFC3339Time;
  };

  type AdminUserGroupWrap = {
    group?: Group;
    member?: GroupMember;
  };

  type AdminUserOperationClient = {
    type?: "ios" | "android" | "web" | "server";
    /** 客户端版本号。 */
    version?: string;
    /** 操作系统及版本；服务端任务时为空。 */
    os_version?: string;
    /** 设备型号；服务端任务时为空。 */
    device_model?: string;
  };

  type AdminUserOperationLocation = {
    /** 操作来源 IP。 */
    ip?: string;
    /** 根据 IP 解析的地区。 */
    region?: string;
  };

  type AdminUserOperationLog = {
    /** 用户行为日志 ID。 */
    log_id?: string;
    /** 操作时间，使用 RFC3339。 */
    operated_at?: string;
    /** 行为类型机器标识，例如 register、update_avatar、send_message。 */
    behavior_type?: string;
    /** 行为分类机器标识，例如 account_security、profile、notification、friend、message。 */
    behavior_category?: string;
    /** 行为执行状态。 */
    status?: "success" | "failed";
    client?: AdminUserOperationClient;
    location?: AdminUserOperationLocation;
    /** 日志备注或失败原因补充。 */
    remark?: string;
  };

  type AdminUserOperationLogWrap = {
    log?: AdminUserOperationLog;
    user?: User;
  };

  type AdminUserWrap = {
    user?: User;
    online_status?: OnlineStatus;
  };

  type AdminWhitelistedUserWrap = {
    user?: User;
    operator?: SysUser;
    /** 加入白名单原因。 */
    reason?: string;
    /** 加入白名单时间。 */
    operated_at?: RFC3339Time;
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

  type CreateSysUserEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { username: string; temporary_password: string };
    };

  type CreateSysUserRequest = {
    /** 后台用户名，不能仅包含空白字符。 */
    username: string;
    display_name?: string;
    description?: string;
    status?: AccountStatus;
    role_ids?: number[];
  };

  type CustomMessage = {
    /** 自定义业务类型。通话历史消息使用 type=110、key=rtc.call.summary；1601-1608 通话过程通知改用 body.system。 */
    key: string;
    /** 自定义 JSON 字符串。rtc.call.summary 包含 call_id、conversation_id、call_type、room_name、caller_id、operator_id、status、status_text、reason_code、reason、e2ee_required、started_at、answered_at、ended_at、duration_seconds。 */
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
    /** self 仅当前用户隐藏，允许删除会话内任意消息；all 对会话相关用户全局删除。单聊双方均可删除任意一方消息；群聊中可删除自己的消息，群主可删除任意成员消息，管理员需具备清理消息权限才能删除其他成员消息。 */
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
    /** 来源用户头像 URL。 */
    avatar_url?: string;
  };

  type Friend = {
    user_id?: string;
    friend_user_id?: string;
    /** 当前用户给好友设置的别名，用于会话和好友列表展示覆盖。 */
    alias?: string;
    /** 当前用户给好友设置的手机号备注。 */
    phone?: string;
    /** 当前用户给好友设置的备注说明。 */
    remark?: string;
    /** 当前用户给好友设置的标签。 */
    tags?: string[];
    /** 是否为星标好友。 */
    is_starred?: boolean;
    /** 建立好友关系时记录的来源类型。 */
    source_type?: string;
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
    /** 最初创建群聊的用户 ID；群主转让后保持不变。 */
    creator_user_id?: string;
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
    /** 该成员在群内的昵称。 */
    nickname?: string;
    /** 成为当前管理员的时间；非管理员为空。 */
    admin_since?: RFC3339Time;
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

  type postV1AdminAuthPasswordUpdateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthProfileUpdateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthRefreshTokenParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthSecurityVerifyParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthTwoFactorConfirmParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminAuthTwoFactorResetParams = {
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

  type postV1AdminCommonUploadCredentialParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminConversationMessagesListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminConversationsListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminConversationsSettingsGetParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminConversationsSettingsUpdateParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminConversationsUsersListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminGroupsDetailParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminGroupsListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminGroupsOperationLogsListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminGroupsSettingsGetParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminGroupsSettingsUpdateParams = {
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

  type postV1AdminRiskIPBlacklistAddParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminRiskIPBlacklistBatchRemoveParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminRiskIPBlacklistListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminRiskIPBlacklistRemoveParams = {
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

  type postV1AdminSystemSettingsGetParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminSystemSettingsUpdateParams = {
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

  type postV1AdminSystemUsersResetTwoFactorParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminSystemUsersUpdateIPWhitelistParams = {
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

  type postV1AdminUsersBlacklistListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersContactsListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersDetailParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersGroupsListParams = {
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

  type postV1AdminUsersSearchParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersUnbanParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersWhitelistAddParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersWhitelistBatchRemoveParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersWhitelistListParams = {
    ""?: any;
    ""?: any;
  };

  type postV1AdminUsersWhitelistRemoveParams = {
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

  type ResetOwnTwoFactorRequest = {
    /** 通过安全验证接口并指定 operation=reset_two_factor 获得的一次性 token。 */
    security_token: string;
  };

  type ResetPasswordRequest = {
    /** 当前旧密码。 */
    old_password: string;
    /** 新密码。 */
    password: string;
  };

  type ResetSysUserPasswordEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { username: string; temporary_password: string };
    };

  type ResetSysUserPasswordRequest = {
    /** 需要重置密码的后台用户 ID。 */
    id: number;
    /** 可选的重置原因或操作备注；传入时不能仅包含空白字符。 */
    remark?: string;
    /** 当前登录管理员的 Google Authenticator 6 位动态验证码；验证码只能成功使用一次。 */
    two_factor_code: string;
  };

  type ResetSysUserTwoFactorRequest = {
    /** 需要重置 Google 验证码绑定的后台用户 ID。 */
    id: number;
    /** 可选的操作备注；传入时不能仅包含空白字符。 */
    remark?: string;
    /** 当前登录管理员的 Google Authenticator 6 位动态验证码；验证码只能成功使用一次。 */
    two_factor_code: string;
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
    /** 系统事件类型；通话实时通知使用 rtc.call.invite、rtc.call.accept、rtc.call.reject、rtc.call.cancel、rtc.call.hangup、rtc.call.ended。 */
    event_type?: string;
    /** 给人阅读的系统通知文本。 */
    text?: string;
    /** 系统事件业务字段；通话通知包含 call_id、conversation_id、call_type、room_name、caller_id、operator_id、status、status_text、reason_code、reason、e2ee_required。status 和 reason_code 是稳定协议码，status_text 和 reason 是中文展示文案。 */
    extra?: Record<string, any>;
  };

  type SystemMessageBody = {
    system: SystemMessage;
  };

  type SystemSetting = {
    /** 后台系统展示名称。 */
    system_name: string;
    /** 系统 Logo URL；空字符串表示未配置。Logo 文件通过后台上传接口上传，本接口只保存 URL。 */
    logo_url: string;
    /** 后台默认语言，使用语言标签，例如 zh-CN、en-US。 */
    default_language: string;
    /** 后台时间展示格式。 */
    time_format: "12h" | "24h";
    /** 是否全局启用后台 IPv4 白名单校验。 */
    ip_whitelist_enabled: boolean;
    updated_at: RFC3339Time;
  };

  type SystemSettingEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { setting?: SystemSetting };
    };

  type SysUser = {
    id?: number;
    username?: string;
    display_name?: string;
    status?: AccountStatus;
    description?: string;
    last_login_at?: RFC3339Time;
    /** 最后登录 IP。 */
    last_login_ip?: string;
    /** 允许访问后台的精确 IPv4 地址列表；空数组表示不限制来源 IP。 */
    ip_whitelist?: string[];
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

  type UpdateOwnPasswordRequest = {
    /** 通过安全验证接口并指定 operation=update_password 获得的一次性 token。 */
    security_token: string;
    /** 当前登录密码。 */
    current_password: string;
    /** 必须同时包含大写字母、小写字母、数字和特殊字符；不能与当前密码相同、不能包含用户名，且不能含连续或倒序的 3 位字母或数字。 */
    new_password: string;
    /** 必须与 new_password 完全一致，仅由网关校验，不传给内部服务。 */
    confirm_password: string;
  };

  type UpdateOwnProfileRequest = {
    /** 当前登录后台用户的新展示名称，不能仅包含空白字符。 */
    display_name: string;
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

  type UpdateSystemSettingRequest = {
    /** 系统名称，不能仅包含空白字符。 */
    system_name: string;
    /** 可选。系统 Logo URL；传空字符串表示清空，不传表示保留原值。文件需先通过 `/v1/admin/common/upload-credential` 获取后台凭证并直传 OSS。 */
    logo_url?: string;
    /** 可选。默认语言标签，不能仅包含空白字符；不传表示保留原值。 */
    default_language?: string;
    /** 可选。不传表示保留原值。 */
    time_format?: "12h" | "24h";
    /** 可选。开启后，后台登录、改密、二步验证、刷新 token 和已登录请求均校验系统用户各自的 IPv4 白名单；关闭后跳过 IP 条件；不传表示保留原值。 */
    ip_whitelist_enabled?: boolean;
  };

  type UpdateSysUserIPWhitelistRequest = {
    /** 需要调整后台访问白名单的系统用户 ID。 */
    id: number;
    /** 精确 IPv4 地址列表；传空数组表示取消 IP 限制，不支持 IPv6 或 CIDR。 */
    ip_whitelist: string[];
    /** 当前登录管理员的 Google Authenticator 6 位动态验证码；验证码只能成功使用一次。 */
    two_factor_code: string;
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

  type VerifySecurityEnvelope =
    // #/components/schemas/ResponseBase
    ResponseBase & {
      data?: { security_token: string; expires_in: number };
    };

  type VerifySecurityRequest = {
    /** 本次安全验证用途。安全 token 只能用于对应操作，不能跨用途使用。 */
    operation: "update_password" | "reset_two_factor";
    /** 当前已绑定认证器生成的 6 位动态验证码。 */
    two_factor_code: string;
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
