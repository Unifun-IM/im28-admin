import React from 'react';
import {
  Link,
  Card,
  Divider,
  Message,
  Typography,
} from '@arco-design/web-react';
import {
  IconFile,
  IconStorage,
  IconSettings,
  IconMobile,
  IconFire,
} from '@arco-design/web-react/icon';
import useLocale from '@shared/lib/useLocale';
import locale from './locale';

function Shortcuts() {
  const t = useLocale(locale);

  const shortcuts = [
    {
      title: t['workplace.contentMgmt'],
      key: 'Content Management',
      icon: <IconFile />,
    },
    {
      title: t['workplace.contentStatistic'],
      key: 'Content Statistic',
      icon: <IconStorage />,
    },
    {
      title: t['workplace.advancedMgmt'],
      key: 'Advanced Management',
      icon: <IconSettings />,
    },
    {
      title: t['workplace.onlinePromotion'],
      key: 'Online Promotion',
      icon: <IconMobile />,
    },
    {
      title: t['workplace.marketing'],
      key: 'Marketing',
      icon: <IconFire />,
    },
  ];

  const recentShortcuts = [
    {
      title: t['workplace.contentStatistic'],
      key: 'Content Statistic',
      icon: <IconStorage />,
    },
    {
      title: t['workplace.contentMgmt'],
      key: 'Content Management',
      icon: <IconFile />,
    },
    {
      title: t['workplace.advancedMgmt'],
      key: 'Advanced Management',
      icon: <IconSettings />,
    },
  ];

  function onClickShortcut(key) {
    Message.info({
      content: (
        <span>
          You clicked <b>{key}</b>
        </span>
      ),
    });
  }

  const shortcutItemClass =
    'group box-border flex cursor-pointer flex-col items-center justify-center p-3';

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Title heading={6}>
          {t['workplace.shortcuts']}
        </Typography.Title>
        <Link>{t['workplace.seeMore']}</Link>
      </div>
      <div className="grid grid-cols-3">
        {shortcuts.map((shortcut) => (
          <div
            className={shortcutItemClass}
            key={shortcut.key}
            onClick={() => onClickShortcut(shortcut.key)}
          >
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-[6px] bg-arco-fill-2 group-hover:bg-[var(--color-primary-light-1)] group-hover:[&_svg]:text-primary-6 [&_svg]:text-lg">
              {shortcut.icon}
            </div>
            <div className="text-xs leading-5 text-arco-text-1 group-hover:text-primary-6">
              {shortcut.title}
            </div>
          </div>
        ))}
      </div>
      <Divider />
      <div className="mb-4 text-base font-medium leading-6 text-arco-text-1">
        {t['workplace.recent']}
      </div>
      <div className="grid grid-cols-3">
        {recentShortcuts.map((shortcut) => (
          <div
            className={shortcutItemClass}
            key={shortcut.key}
            onClick={() => onClickShortcut(shortcut.key)}
          >
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-[6px] bg-arco-fill-2 group-hover:bg-[var(--color-primary-light-1)] group-hover:[&_svg]:text-primary-6 [&_svg]:text-lg">
              {shortcut.icon}
            </div>
            <div className="text-xs leading-5 text-arco-text-1 group-hover:text-primary-6">
              {shortcut.title}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default Shortcuts;
