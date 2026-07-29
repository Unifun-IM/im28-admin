import { generate, getRgbStr } from '@arco-design/color';

import defaultSettings from '@shared/config/settings.json';

/** Figma / 业务默认主题色 → --primary-6 */
export const DEFAULT_THEME_COLOR =
  defaultSettings.themeColor || '#635CFF';

/**
 * 将主题色写入 Arco CSS 变量（--arcoblue-1..10）。
 * --primary-* / --link-* 已 alias 到 --arcoblue-*，故框架按钮、链接等会跟随。
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
    target.style.setProperty(`--arcoblue-${index + 1}`, getRgbStr(hex));
  });

  target.dataset.themeColor = color;
}

export default applyThemeColor;
