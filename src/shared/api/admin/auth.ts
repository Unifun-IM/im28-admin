// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 校验 token POST /v1/admin/auth/check-token */
export async function postV1AdminAuthCheckToken(
  body: AdminAPI.CheckTokenRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.CheckTokenEnvelope>("/v1/admin/auth/check-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 登录 只校验用户名和密码。成功后返回 5 分钟预认证 token，下一步可能是 change_password、bind_two_factor 或 verify_two_factor，不直接签发正式登录 token。 POST /v1/admin/auth/login */
export async function postV1AdminAuthLogin(
  body: AdminAPI.SysUserLoginRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.SysUserLoginEnvelope>("/v1/admin/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 退出登录 access token 可放在可选请求体的 `access_token`，也可通过 `Authorization: Bearer <access_token>` 传入；两者至少提供一个。 POST /v1/admin/auth/logout */
export async function postV1AdminAuthLogout(
  body: AdminAPI.LogoutRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ResponseBase>("/v1/admin/auth/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取当前系统用户 根据 Bearer token 返回当前系统用户资料、角色和权限，请求体为空。 POST /v1/admin/auth/me */
export async function postV1AdminAuthMe(options?: { [key: string]: any }) {
  return request<AdminAPI.SysUserEnvelope>("/v1/admin/auth/me", {
    method: "POST",
    ...(options || {}),
  });
}

/** 首次登录修改密码 使用 `next_step=change_password` 对应的预认证 token 修改初始密码。成功后旧 token 立即失效，并返回用于绑定或验证二步认证的新预认证 token；本接口不签发正式登录 token。 POST /v1/admin/auth/password/change */
export async function postV1AdminAuthPasswordChange(
  body: AdminAPI.ChangeSysUserPasswordRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.ChangeSysUserPasswordEnvelope>(
    "/v1/admin/auth/password/change",
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

/** 刷新 token POST /v1/admin/auth/refresh-token */
export async function postV1AdminAuthRefreshToken(
  body: AdminAPI.RefreshTokenRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.SysUserTokenEnvelope>(
    "/v1/admin/auth/refresh-token",
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

/** 确认二步验证绑定并完成登录 使用绑定用途的预认证 token 和动态码完成强制绑定，成功后返回正式登录 token，预认证 token 立即失效。 POST /v1/admin/auth/two-factor/confirm */
export async function postV1AdminAuthTwoFactorConfirm(
  body: AdminAPI.ConfirmTwoFactorRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.SysUserTokenEnvelope>(
    "/v1/admin/auth/two-factor/confirm",
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

/** 生成二步验证绑定信息 使用 `next_step=bind_two_factor` 对应的 5 分钟预认证 token 生成新密钥。调用此接口不会签发正式 token，前端应使用 `otpauth_uri` 生成二维码并调用确认接口。 POST /v1/admin/auth/two-factor/setup */
export async function postV1AdminAuthTwoFactorSetup(
  body: AdminAPI.SetupTwoFactorRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.SetupTwoFactorEnvelope>(
    "/v1/admin/auth/two-factor/setup",
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

/** 验证二步验证码并完成登录 已绑定账号使用 `next_step=verify_two_factor` 对应的预认证 token 和动态码完成登录，成功后返回正式登录 token，预认证 token 立即失效。 POST /v1/admin/auth/two-factor/verify */
export async function postV1AdminAuthTwoFactorVerify(
  body: AdminAPI.VerifyTwoFactorRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.SysUserTokenEnvelope>(
    "/v1/admin/auth/two-factor/verify",
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
