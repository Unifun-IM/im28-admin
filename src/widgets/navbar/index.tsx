import React, { useContext, useEffect, useState } from 'react';
import {
  Input,
  Avatar,
  Select,
  Dropdown,
  Menu,
  Divider,
  Message,
  Button,
  Breadcrumb,
  Badge
} from '@arco-design/web-react';
import {
  IconLanguage,
  IconNotification,
  IconSunFill,
  IconMoonFill,
  IconPoweroff,
  IconLoading,
  IconSettings,
  IconClockCircle,
  IconObliqueLine,
  IconSearch
} from '@arco-design/web-react/icon';
import {
  useGlobalSelector,
  useGlobalDispatch,
  type GlobalState
} from '@entities/global-state';
import { GlobalContext } from '@shared/lib/global-context';
import useLocale from '@shared/lib/useLocale';
import { IconButton } from '@shared/ui';
import MessageBox from '@widgets/message-box';
import Settings from '@widgets/settings';
import defaultLocale from '@shared/locale';
import useStorage from '@shared/lib/useStorage';
import { generatePermission } from '@shared/config/routes';
import { setAccessToken } from '@shared/api/request';
import cs from 'classnames';
import './navbar.less';

export type NavbarBreadcrumbItem =
  | string
  | {
      name: string;
      icon?: React.ReactNode;
    };

export type NavbarProps = {
  show: boolean;
  breadcrumb?: NavbarBreadcrumbItem[];
  /** 打开用户中心（由 app 挂载 Modal） */
  onOpenUserCenter?: () => void;
};

function Navbar({ show, breadcrumb = [], onOpenUserCenter }: NavbarProps) {
  const t = useLocale();
  const locale = useLocale();
  const { userInfo, userLoading } = useGlobalSelector((state: GlobalState) => state);
  const dispatch = useGlobalDispatch();

  const [_, setUserStatus] = useStorage('userStatus');
  const [role] = useStorage('userRole', 'admin');
  const [messageVisible, setMessageVisible] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);

  const { setLang, lang, theme, setTheme } = useContext(GlobalContext);

  function logout() {
    setUserStatus('logout');
    setAccessToken(null);
    window.location.href = '/login';
  }

  useEffect(() => {
    dispatch({
      type: 'update-userInfo',
      payload: {
        userInfo: {
          ...userInfo,
          permissions: generatePermission(role)
        }
      }
    });
  }, [role]);

  if (!show) {
    return (
      <div className="fixed right-0 top-[280px] [&_svg]:align-[-4px] [&_svg]:text-lg">
        <Settings
          trigger={
            <Button icon={<IconSettings />} type="primary" size="large" />
          }
        />
      </div>
    );
  }

  const droplist = (
    <Menu
      className="use-profile-menu"
      onClickMenuItem={(key) => {
        if (key === 'logout') logout();
        if (key === 'profile') {
          setUserMenuVisible(false);
          onOpenUserCenter?.();
        }
      }}
    >
      <Menu.Item key="profile" className="use-profile-menu-item">
        <div className="flex items-center gap-2 p-0">
          <Avatar size={40} className="shrink-0">
            {userInfo?.avatar ? <img alt="avatar" src={userInfo.avatar} /> : null}
          </Avatar>
          <div className="min-w-0">
            <div className="text-sm font-medium leading-[14px] text-arco-text-1">
              {userInfo?.name || 'Admin-sp'}
            </div>
            <div className="mt-1 text-xs leading-3 text-arco-text-3">
              {userInfo?.email || 'Admin-sp@gmail.com'}
            </div>
          </div>
        </div>
      </Menu.Item>
      <Divider className="!my-2" />
      <Menu.Item key="logout" className="use-profile-logout">
        <IconPoweroff className="mr-0 text-base text-arco-text-1" />
        {t['navbar.logout']}
      </Menu.Item>
    </Menu>
  );

  const themeToggleLabel =
    theme === 'light'
      ? t['settings.navbar.theme.toDark']
      : t['settings.navbar.theme.toLight'];

  return (
    <div className="box-border flex h-[44px] shrink-0 items-center justify-between gap-[12px] bg-transparent">
      <div className="flex min-w-0 flex-1 items-center">
        {breadcrumb.length > 0 && (
          <Breadcrumb
            className="use-navbar-breadcrumb"
            separator={
              <IconObliqueLine className="text-xs text-arco-text-3" />
            }
          >
            {breadcrumb.map((node, index) => {
              const isLast = index === breadcrumb.length - 1;
              const name = typeof node === 'string' ? node : node.name;
              const icon = typeof node === 'string' ? null : node.icon;
              const label = locale[name] || name;
              return (
                <Breadcrumb.Item key={`${name}-${index}`}>
                  <span
                    className={cs(
                      'inline-flex items-center gap-1 p-1 text-sm font-normal leading-[22px] text-arco-text-2',
                      isLast && 'px-1 font-medium text-arco-text-1'
                    )}
                  >
                    {icon ? (
                      <span className="inline-flex h-4 w-4 items-center justify-center text-arco-text-2 [&_svg]:h-4 [&_svg]:w-4">
                        {icon}
                      </span>
                    ) : null}
                    {label}
                  </span>
                </Breadcrumb.Item>
              );
            })}
          </Breadcrumb>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-[12px]">
        <Input
          className="use-navbar-search"
          prefix={<IconSearch />}
          placeholder={t['navbar.search.placeholder']}
          allowClear
        />
        <div className="flex items-center gap-[8px]">
          <Settings
            trigger={
              <IconButton icon={<IconClockCircle />} tip={t['settings.title']} />
            }
          />
          <Select
            triggerElement={
              <IconButton icon={<IconLanguage />} tip={t['message.lang.tips']} />
            }
            options={[
              { label: '中文', value: 'zh-CN' },
              { label: 'English', value: 'en-US' }
            ]}
            value={lang}
            triggerProps={{
              autoAlignPopupWidth: false,
              autoAlignPopupMinWidth: true,
              position: 'br'
            }}
            trigger="hover"
            onChange={(value) => {
              setLang(value);
              const nextLang = defaultLocale[value];
              Message.info(`${nextLang['message.lang.tips']}${value}`);
            }}
          />
          <MessageBox onVisibleChange={setMessageVisible}>
            <Badge count={11} maxCount={99} className="use-navbar-badge">
              <IconButton
                active={messageVisible}
                icon={<IconNotification />}
              />
            </Badge>
          </MessageBox>
          <IconButton
            icon={theme !== 'dark' ? <IconSunFill /> : <IconMoonFill />}
            tip={themeToggleLabel}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />
        </div>
        {userInfo && (
          <Dropdown
            droplist={droplist}
            position="br"
            disabled={userLoading}
            trigger="click"
            popupVisible={userMenuVisible}
            onVisibleChange={setUserMenuVisible}
          >
            <div
              className={cs(
                'inline-flex h-[32px] cursor-pointer items-center gap-2 rounded-full p-1 transition-[background] hover:bg-arco-fill-2',
                userMenuVisible && 'bg-[var(--color-fill-3,#e5e6eb)]'
              )}
            >
              <Avatar size={24}>
                {userLoading ? (
                  <IconLoading />
                ) : (
                  <img alt="avatar" src={userInfo.avatar} />
                )}
              </Avatar>
              <span className="max-w-24 overflow-hidden text-ellipsis whitespace-nowrap pr-1 text-sm font-medium leading-[22px] text-arco-text-1 max-[900px]:hidden">
                {userInfo.name || 'Admin-sp'}
              </span>
            </div>
          </Dropdown>
        )}
      </div>
    </div>
  );
}

export default Navbar;
