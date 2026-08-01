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
 * 获取后台上传凭证，直接使用返回的访问 url。
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
  const url = res.data?.url?.trim();
  if (!url) {
    throw new Error('UPLOAD_CREDENTIAL_EMPTY');
  }

  return url;
}
