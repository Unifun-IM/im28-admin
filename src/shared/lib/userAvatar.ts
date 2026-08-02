/**
 * 用户头像占位：用户 ID → 固定哈希 → 色板取余；无图时取昵称首字符。
 * 群主/管理员标签复用同序纯色板（头像渐变色的深色端）。
 */

export const avatarColors = [
  ['#D98AF2', '#C94EE4'], // 0
  ['#65CCF4', '#2698ED'], // 1
  ['#4BDFD1', '#20BEB6'], // 2
  ['#9BDF78', '#35C565'], // 3
  ['#FFC968', '#FF9850'], // 4
  ['#FF9A91', '#F46575'], // 5
  ['#8EA1FF', '#596EEB'], // 6
  ['#F7A0D4', '#E561B1'] // 7
] as const;

/** 群主/管理员标签纯色（与 avatarColors 深色端一一对应） */
export const roleTagColors = [
  '#C94EE4', // 0
  '#2698ED', // 1
  '#20BEB6', // 2
  '#35C565', // 3
  '#FF9850', // 4
  '#F46575', // 5
  '#596EEB', // 6
  '#E561B1' // 7
] as const;

/** 用户 ID → 稳定非负整数哈希 */
export function hashUserId(userId: string): number {
  const s = String(userId || '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 颜色索引 = hash(用户ID) % 色板数量 */
export function getAvatarColorIndex(userId: string): number {
  return hashUserId(userId) % avatarColors.length;
}

export function getAvatarGradient(
  userId: string
): readonly [string, string] {
  return avatarColors[getAvatarColorIndex(userId)];
}

/** 群角色标签色：hash(用户ID) % 色板 */
export function getRoleTagColor(userId: string): string {
  return roleTagColors[hashUserId(userId) % roleTagColors.length];
}

export function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) return hex;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * 从昵称提取头像字：
 * - 中文取第一个有效汉字（「小卡」→「小」）
 * - 英文取首字母并大写（「Nick」→「N」）
 * - 过滤空格、符号和 emoji
 */
export function getAvatarLetter(nickname?: string | null): string {
  const raw = String(nickname || '');
  for (const ch of raw) {
    if (/\s/u.test(ch)) continue;
    // 汉字
    if (/\p{Script=Han}/u.test(ch)) return ch;
    // 字母
    if (/[A-Za-z]/u.test(ch)) return ch.toUpperCase();
    // 数字可作兜底展示
    if (/\d/u.test(ch)) return ch;
    // 其余符号 / emoji 跳过
  }
  return '?';
}
