import { generate, getRgbStr } from '@arco-design/color';

import defaultSettings from '@shared/config/settings.json';

/** Figma / 业务默认主题色 → --primary-6（浅色/暗色均为 #635CFF） */
export const DEFAULT_THEME_COLOR =
  defaultSettings.themeColor || '#635CFF';

/**
 * 将主题色写入 Arco CSS 变量（--arcoblue-1..10）。
 * --primary-* / --link-* 已 alias 到 --arcoblue-*。
 *
 * Figma 约定：primary/6 在浅色、暗色下均为品牌色本身，
 * 故色板仍按 dark 生成阶梯，但强制 --arcoblue-6 钉在品牌色。
 */
export function applyThemeColor(
  color: string = DEFAULT_THEME_COLOR,
  options?: { dark?: boolean; target?: HTMLElement | null }
) {
  if (typeof document === 'undefined') return;

  const target = options?.target ?? document.body;
  if (!target) return;

  const dark =
    options?.dark ??
    document.body.getAttribute('arco-theme') === 'dark';

  const list = generate(color, { list: true, dark });
  list.forEach((hex, index) => {
    // index 5 → --arcoblue-6：与 Figma primary/6 对齐，始终用品牌色
    const value = index === 5 ? color : hex;
    target.style.setProperty(`--arcoblue-${index + 1}`, getRgbStr(value));
  });

  target.dataset.themeColor = color;
}

export default applyThemeColor;
