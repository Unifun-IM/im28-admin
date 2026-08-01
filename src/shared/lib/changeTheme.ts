import applyThemeColor from './applyThemeColor';

function changeTheme(theme: string, themeColor?: string) {
  if (theme === 'dark') {
    document.body.setAttribute('arco-theme', 'dark');
  } else {
    document.body.removeAttribute('arco-theme');
  }

  const color =
    themeColor ||
    document.body.dataset.themeColor ||
    undefined;
  applyThemeColor(color, { dark: theme === 'dark' });
}

export default changeTheme;
