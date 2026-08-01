import { generate, getRgbStr } from '@arco-design/color';

import defaultSettings from '@shared/config/settings.json';

/** Figma / 业务默认主题色 → --primary-6（浅色/暗色均为 #635CFF） */
export const DEFAULT_THEME_COLOR =
  defaultSettings.themeColor || '#635CFF';

/**
 * Figma docs/Light.tokens.json · primary/2…7 + 更深阶
 * index 0 → --arcoblue-1
 */
const FIGMA_PRIMARY_LIGHT = [
  '#ECEBFF', // primary/1 叠白近似
  '#D5CCFF',
  '#BCB0FF',
  '#A194FF',
  '#8378FF',
  '#635CFF',
  '#3B39D2',
  '#1E20A6',
  '#0B1079',
  '#00064D'
];

/**
 * Figma docs/Dark.tokens.json · primary（暗色 1 深 → 10 浅）
 * primary/1 为透明层，色板从 primary/2 起；6 钉品牌色
 */
const FIGMA_PRIMARY_DARK = [
  '#00064D', // primary/2
  '#0B1079', // primary/3
  '#1E20A6', // primary/4
  '#3B39D2', // primary/5
  '#3B39D2',
  '#635CFF', // primary/6
  '#8378FF', // primary/7
  '#A194FF',
  '#BCB0FF',
  '#D5CCFF'
];

function isBrandColor(color: string) {
  return color.replace(/\s/g, '').toUpperCase() === '#635CFF';
}

/**
 * 将主题色写入 Arco CSS 变量（--arcoblue-1..10）。
 * --primary-* / --link-* 已 alias 到 --arcoblue-*。
 *
 * 默认品牌色走 Figma token 色板；自定义色仍用 @arco-design/color generate，
 * 且始终强制 --arcoblue-6 = 所选色（对齐 Figma primary/6）。
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

  const list = isBrandColor(color)
    ? dark
      ? FIGMA_PRIMARY_DARK
      : FIGMA_PRIMARY_LIGHT
    : generate(color, { list: true, dark });

  list.forEach((hex, index) => {
    const value = index === 5 ? color : hex;
    target.style.setProperty(`--arcoblue-${index + 1}`, getRgbStr(value));
  });

  target.dataset.themeColor = color;
}

export default applyThemeColor;
