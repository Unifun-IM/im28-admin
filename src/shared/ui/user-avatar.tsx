import React from 'react';
import { Avatar } from '@arco-design/web-react';
import { getAvatarGradient, getAvatarLetter } from '@shared/lib/userAvatar';

export type UserAvatarProps = {
  /** 用于颜色哈希；无则回退到 name */
  userId?: string | null;
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * 用户头像：
 * - 有真实头像 → 优先显示
 * - 无头像 → 昵称首字符 + 按 userId 哈希渐变底色
 */
export function UserAvatar({
  userId,
  name,
  src,
  size = 24,
  className,
  style
}: UserAvatarProps) {
  if (src) {
    return (
      <Avatar size={size} className={className} style={style}>
        <img alt="" src={src} className="size-full object-cover" />
      </Avatar>
    );
  }

  const seed = String(userId || name || '');
  const [from, to] = getAvatarGradient(seed);
  const letter = getAvatarLetter(name || userId);

  return (
    <Avatar
      size={size}
      className={className}
      style={{
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        color: 'var(--color-text-white)',
        fontWeight: 500,
        ...style
      }}
    >
      {letter}
    </Avatar>
  );
}
