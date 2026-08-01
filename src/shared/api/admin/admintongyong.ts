// @ts-ignore
/* eslint-disable */
import request from "@shared/api/request";

/** 获取后台图片上传凭证 仅接受后台系统用户 Bearer token，不接受 C 端用户 token。支持 JPG、JPEG、PNG、WEBP，单文件最大 1MB；凭证绑定唯一对象 Key，5 分钟有效，文件直接上传 OSS。 POST /v1/admin/common/upload-credential */
export async function postV1AdminCommonUploadCredential(
  body: AdminAPI.AdminUploadCredentialRequest,
  options?: { [key: string]: any }
) {
  return request<AdminAPI.AdminUploadCredentialEnvelope>(
    "/v1/admin/common/upload-credential",
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
