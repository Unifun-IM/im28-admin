import changeTheme from './changeTheme';

type ThemeName = 'light' | 'dark';

type ThemeTransitionOrigin = {
  clientX: number;
  clientY: number;
};

type StartThemeTransitionOptions = {
  /** 点击事件坐标（圆心）；缺省用视口右上角 */
  origin?: ThemeTransitionOrigin;
  themeColor?: string;
  onThemeChange: (next: ThemeName) => void;
};

/**
 * 主题切换圆形扩散 — 对齐 Art Design Pro（View Transition + CSS clip keyframes）
 * @see https://github.com/Daymychen/art-design-pro/blob/main/src/utils/ui/animation.ts
 * @see https://github.com/Daymychen/art-design-pro/blob/main/src/assets/styles/core/theme-animation.scss
 */
export function startThemeTransition(
  next: ThemeName,
  options: StartThemeTransitionOptions
) {
  const apply = () => {
    changeTheme(next, options.themeColor);
    options.onThemeChange(next);
  };

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  const startVT = document.startViewTransition?.bind(document);

  if (reduceMotion || !startVT) {
    apply();
    return;
  }

  const x = options.origin?.clientX ?? window.innerWidth;
  const y = options.origin?.clientY ?? 0;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const root = document.documentElement;
  root.style.setProperty('--theme-vt-x', `${x}px`);
  root.style.setProperty('--theme-vt-y', `${y}px`);
  root.style.setProperty('--theme-vt-r', `${endRadius}px`);

  startVT(apply);
}

export default startThemeTransition;
