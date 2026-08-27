import { getRoleTagColor, hexToRgba } from '@shared/lib/userAvatar';
import useLocale from '@shared/lib/useLocale';

export type GroupRoleTagProps = {
  /** 用户 ID，决定标签颜色 */
  userId?: string | null;
  /** IM RoleLevel：100 群主 / 60 管理员 */
  roleLevel?: number | null;
  className?: string;
};

/**
 * 群主 / 管理员标签：颜色 = hash(userId) % 色板（与头像深色端一致）
 */
export function GroupRoleTag({
  userId,
  roleLevel,
  className
}: GroupRoleTagProps) {
  const t = useLocale();
  if (roleLevel !== 100 && roleLevel !== 60) return null;

  const color = getRoleTagColor(String(userId || ''));
  const label =
    roleLevel === 100
      ? t['im.roleLevel.100']
      : t['groupDetail.field.admin'];

  return (
    <span
      className={`inline-flex h-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-medium leading-[1.5] ${
        className || ''
      }`}
      style={{
        color,
        backgroundColor: hexToRgba(color, 0.05)
      }}
    >
      {label}
    </span>
  );
}
