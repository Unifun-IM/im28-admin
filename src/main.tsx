import '@arco-themes/react-arco-pro/css/arco.css';
import '@app/styles/tailwind.css';
import '@app/styles/global.less';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './app';
import defaultSettings from '@shared/config/settings.json';
import applyThemeColor from '@shared/lib/applyThemeColor';

applyThemeColor(defaultSettings.themeColor);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
