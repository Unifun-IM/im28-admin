import { postV1AdminCommonUploadCredential } from '@shared/api/admin/admintongyong';

/** 后台图片：JPG / JPEG / PNG / WEBP，单文件最大 1MB（与 upload-credential 约定一致） */
export const ADMIN_IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp';
export const ADMIN_IMAGE_MIME = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
] as const;
export const ADMIN_IMAGE_MAX_BYTES = 1 * 1024 * 1024;

export type AdminImageValidateError = 'type' | 'size';

export function getAdminImageExt(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName === 'jpeg' || fromName === 'jpg') return 'jpg';
  if (fromName === 'png' || fromName === 'webp') return fromName;
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
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

/**
 * 获取后台上传凭证并直传 OSS，返回可访问 URL。
 * @see POST /v1/admin/common/upload-credential
 */
export async function uploadAdminImage(file: File): Promise<string> {
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
  if (
    !cred?.host ||
    !cred.object_key ||
    !cred.access_key_id ||
    !cred.policy ||
    !cred.signature ||
    !cred.url
  ) {
    throw new Error('UPLOAD_CREDENTIAL_EMPTY');
  }

  const form = new FormData();
  form.append('key', cred.object_key);
  form.append('OSSAccessKeyId', cred.access_key_id);
  form.append('policy', cred.policy);
  form.append('signature', cred.signature);
  form.append('success_action_status', '200');
  form.append('file', file);

  const ossRes = await fetch(cred.host, {
    method: 'POST',
    body: form
  });
  if (!ossRes.ok) {
    throw new Error(`OSS_UPLOAD_FAILED:${ossRes.status}`);
  }

  return cred.url;
}
