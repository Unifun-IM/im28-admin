// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 充值地址列表 按用户、钱包、币种、网络和状态分页查询已分配的充值地址，用于地址状态管理和历史追踪。 POST /v1/admin/asset/deposit-address/list */
export async function postV1AdminAssetDepositAddressList(
  body: {
    /** 可选 C 端用户 ID；不传表示不按用户筛选。 */
    user_id?: string;
    /** 可选钱包内部 ID；不传表示不按钱包筛选。 */
    wallet_id?: string;
    /** 可选币种筛选条件。当前仅支持 `USDT`。 */
    currency_code?: "USDT";
    /** 可选网络筛选条件。当前仅支持 `TRC20`。 */
    network_code?: "TRC20";
    /** 可选地址状态筛选条件：
- `active`：当前分配并可供用户充值。
- `unavailable`：仅保留用于历史追踪，不可继续使用。 */
    status?: "active" | "unavailable";
    /** 页码，从 1 开始；不传时使用服务端默认值。 */
    page?: number;
    /** 每页数量，范围 1 至 100；不传时使用服务端默认值。 */
    page_size?: number;
  },
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListAssetDepositAddressEnvelope>(
    "/v1/admin/asset/deposit-address/list",
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

/** 替换用户充值地址 为用户生成并启用新的唯一充值地址，同时将原 active 地址标记为 unavailable。该操作由管理员手动执行，原地址保留用于历史入账追踪。调用前须通过安全验证接口以 operation=`asset_deposit_address_replace` 换取一次性 security_token；token 在调用 Asset Server 前消费，后续操作失败时需重新验证。 POST /v1/admin/asset/deposit-address/replace */
export async function postV1AdminAssetDepositAddressReplace(
  body: {
    /** 需要替换充值地址的 C 端用户 ID。 */
    user_id: string;
    /** 要替换地址的币种代码。当前仅支持 `USDT`。 */
    currency_code: "USDT";
    /** 要替换地址的区块链网络。当前仅支持 `TRC20`。 */
    network_code: "TRC20";
    /** 替换原因，用于后台审计及原地址不可用原因记录，不得传空字符串。 */
    reason: string;
    /** 通过安全验证接口并指定 operation=`asset_deposit_address_replace` 获得的 5 分钟一次性 token。 */
    security_token: string;
  },
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminAssetDepositAddressEnvelope>(
    "/v1/admin/asset/deposit-address/replace",
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

/** 修改充值地址状态 手动调整一条充值地址的可用状态。标记为 unavailable 后前端不应再展示该地址；恢复 active 前应确认地址仍安全可用。调用前须通过安全验证接口以 operation=`asset_deposit_address_status_update` 换取一次性 security_token；token 在调用 Asset Server 前消费，后续操作失败时需重新验证。 POST /v1/admin/asset/deposit-address/status/update */
export async function postV1AdminAssetDepositAddressStatusUpdate(
  body: {
    /** 要修改状态的充值地址记录唯一 ID。 */
    address_id: string;
    /** 目标状态：
- `active`：恢复为当前可用充值地址。
- `unavailable`：停止展示和使用，但保留历史记录。 */
    status: "active" | "unavailable";
    /** 状态修改原因；设置为 unavailable 时应填写，恢复 active 时可不传。 */
    reason?: string;
    /** 通过安全验证接口并指定 operation=`asset_deposit_address_status_update` 获得的 5 分钟一次性 token。 */
    security_token: string;
  },
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminAssetDepositAddressEnvelope>(
    "/v1/admin/asset/deposit-address/status/update",
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

/** 提现订单详情 查询提现目标、金额、手续费、审核记录、链上交易及幂等请求信息。 POST /v1/admin/asset/withdrawal/detail */
export async function postV1AdminAssetWithdrawalDetail(
  body: {
    /** 要查询的 24 位纯数字提现订单 ID。 */
    withdrawal_id: string;
  },
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminAssetWithdrawalEnvelope>(
    "/v1/admin/asset/withdrawal/detail",
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

/** 提现订单列表 按用户、币种、状态和申请时间分页查询提现订单，供后台审核与异常订单排查；summaries 按币种返回相同筛选条件下的申请总量和成功提现总量，不受分页影响。 POST /v1/admin/asset/withdrawal/list */
export async function postV1AdminAssetWithdrawalList(
  body: {
    /** 可选 C 端用户 ID；不传表示查询所有用户。 */
    user_id?: string;
    /** 可选币种筛选条件。当前仅支持 `USDT`。 */
    currency_code?: "USDT";
    /** 可选提现状态筛选条件：
- `pending_review`：等待后台审核。
- `processing`：审核通过，链上处理中。
- `succeeded`：链上提现成功。
- `rejected`：审核驳回，资金已退回。
- `canceled`：用户取消，资金已退回。
- `failed`：链上执行失败，资金已退回。 */
    status?:
      | "pending_review"
      | "processing"
      | "succeeded"
      | "rejected"
      | "canceled"
      | "failed";
    /** 可选申请开始时间，RFC3339 格式，筛选 created_at 不早于该时间的订单。 */
    started_at?: string;
    /** 可选申请结束时间，RFC3339 格式，筛选 created_at 不晚于该时间的订单。 */
    ended_at?: string;
    /** 页码，从 1 开始；不传时使用服务端默认值。 */
    page?: number;
    /** 每页数量，范围 1 至 100；不传时使用服务端默认值。 */
    page_size?: number;
  },
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminListAssetWithdrawalEnvelope>(
    "/v1/admin/asset/withdrawal/list",
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

/** 审核提现订单 审核 `pending_review` 状态的提现订单。通过后进入链上处理，驳回后冻结资金退回用户可用余额；同一订单不可重复审核。调用前须通过安全验证接口以 operation=`asset_withdrawal_review` 换取一次性 security_token；token 在调用 Asset Server 前消费，后续操作失败时需重新验证。 POST /v1/admin/asset/withdrawal/review */
export async function postV1AdminAssetWithdrawalReview(
  body: {
    /** 要审核的 24 位纯数字提现订单 ID。 */
    withdrawal_id: string;
    /** 审核动作：
- `approve`：审核通过，订单进入 processing 状态。
- `reject`：审核驳回，订单进入 rejected 状态并退回冻结资金。 */
    action: "approve" | "reject";
    /** 审核备注；action=`reject` 时应填写明确的驳回原因，action=`approve` 时可不传。 */
    reason?: string;
    /** 通过安全验证接口并指定 operation=`asset_withdrawal_review` 获得的 5 分钟一次性 token。 */
    security_token: string;
  },
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminAssetWithdrawalEnvelope>(
    "/v1/admin/asset/withdrawal/review",
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
