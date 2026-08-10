/**
 * 用户头像占位：用户 ID → 固定哈希 → 色板取余；无图时取昵称首字符。
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
