import { postV1AdminCommonUploadCredential } from '@shared/api/admin/admintongyong';

/**
 * 后台图片上传（OSS PostObject 直传）
 * @see README.upload-image.md
 * @see POST /v1/admin/common/upload-credential
 *
 * 流程：校验文件 → 取凭证 → FormData 直传 host → 使用凭证返回的 url
 */

/** 与 upload-credential 约定：JPG / JPEG / PNG / WEBP，单文件最大 1MB */
export const ADMIN_IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp';
export const ADMIN_IMAGE_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
] as const;
export const ADMIN_IMAGE_MAX_BYTES = 1 * 1024 * 1024;

export type AdminImageValidateError = 'type' | 'size';

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

/** 取文件扩展名（可传给凭证接口的 ext，如 jpg / .jpg） */
export function getAdminImageExt(file: File): string {
  const nameExt = file.name.split('.').pop()?.toLowerCase();
  if (nameExt && nameExt !== file.name.toLowerCase()) {
    if (nameExt === 'jpeg') return 'jpg';
    if (nameExt === 'jpg' || nameExt === 'png' || nameExt === 'webp') {
      return nameExt;
    }
  }
  return EXT_BY_MIME[file.type] || 'jpg';
}

export function validateAdminImage(
  file: File,
  maxBytes = ADMIN_IMAGE_MAX_BYTES
): AdminImageValidateError | null {
  const mimeOk =
    (ADMIN_IMAGE_MIME as readonly string[]).includes(file.type) ||
    /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!mimeOk) return 'type';
  if (file.size > maxBytes) return 'size';
  return null;
}

function assertCredential(
  cred?: AdminAPI.AdminUploadCredential | null
): asserts cred is AdminAPI.AdminUploadCredential {
  if (
    !cred?.host?.trim() ||
    !cred.access_key_id ||
    !cred.policy ||
    !cred.signature ||
    !cred.object_key ||
    !cred.url?.trim()
  ) {
    throw new Error('UPLOAD_CREDENTIAL_EMPTY');
  }
  if (cred.expire && cred.expire * 1000 < Date.now()) {
    throw new Error('UPLOAD_CREDENTIAL_EXPIRED');
  }
}

export type UploadAdminImageOptions = {
  onProgress?: (payload: { percent: number }) => void;
};

/**
 * 阿里云 OSS PostObject 表单直传（不经业务 request，避免带 Bearer）。
 * 表单字段：key / policy / OSSAccessKeyId / signature / success_action_status / file
 * @see https://help.aliyun.com/zh/oss/developer-reference/postobject
 */
export async function postObjectToOss(
  cred: AdminAPI.AdminUploadCredential,
  file: File,
  options?: UploadAdminImageOptions
): Promise<void> {
  assertCredential(cred);

  const formData = new FormData();
  formData.append('key', cred.object_key);
  formData.append('policy', cred.policy);
  formData.append('OSSAccessKeyId', cred.access_key_id);
  formData.append('signature', cred.signature);
  formData.append('success_action_status', '200');
  // file 必须最后
  formData.append('file', file);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', cred.host.trim());
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable || !options?.onProgress) return;
      options.onProgress({
        percent: Math.round((e.loaded / e.total) * 100)
      });
    };
    xhr.onload = () => {
      // 200 / 201 / 204 均视为成功
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(new Error(`OSS_UPLOAD_FAILED:${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('OSS_UPLOAD_FAILED:network'));
    xhr.send(formData);
  });
}

/**
 * 获取后台上传凭证 → 浏览器直传 OSS → 返回可访问 url（勿自行拼接）。
 */
export async function uploadAdminImage(
  file: File,
  options?: UploadAdminImageOptions
): Promise<string> {
  const invalid = validateAdminImage(file);
  if (invalid === 'type') {
    throw new Error('INVALID_IMAGE_TYPE');
  }
  if (invalid === 'size') {
    throw new Error('INVALID_IMAGE_SIZE');
  }

  const res = await postV1AdminCommonUploadCredential({
    ext: getAdminImageExt(file)
  });
  const cred = res.data;
  assertCredential(cred);

  await postObjectToOss(cred, file, options);
  return cred.url.trim();
}
