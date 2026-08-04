import applyThemeColor from './applyThemeColor';

function changeTheme(theme: string, themeColor?: string) {
  const isDark = theme === 'dark';

  if (isDark) {
    document.body.setAttribute('arco-theme', 'dark');
    // 供 View Transition CSS（对齐 Art Design Pro html.dark）判断方向
    document.documentElement.classList.add('dark');
  } else {
    document.body.removeAttribute('arco-theme');
    document.documentElement.classList.remove('dark');
  }

  const color =
    themeColor ||
    document.body.dataset.themeColor ||
    undefined;
  applyThemeColor(color, { dark: isDark });
}

export default changeTheme;
