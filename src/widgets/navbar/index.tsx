import React, { useContext, useEffect } from 'react';
import {
  Tooltip,
  Input,
  Avatar,
  Select,
  Dropdown,
  Menu,
  Divider,
  Message,
  Button,
  Breadcrumb,
  Badge,
  Trigger
} from '@arco-design/web-react';
import {
  IconLanguage,
  IconNotification,
  IconSunFill,
  IconMoonFill,
  IconPoweroff,
  IconLoading,
  IconSettings,
  IconPalette
} from '@arco-design/web-react/icon';
import { useGlobalSelector, useGlobalDispatch } from '@shared/lib/global-store-hooks';
import { GlobalState } from '@entities/global-state';
import { GlobalContext } from '@shared/lib/global-context';
import useLocale from '@shared/lib/useLocale';
import MessageBox from '@widgets/message-box';
import IconButton from './IconButton';
import Settings from '@widgets/settings';
import ColorPanel from '@widgets/settings/color';
import styles from './style/index.module.less';
import defaultLocale from '@shared/locale';
import useStorage from '@shared/lib/useStorage';
import { generatePermission } from '@shared/config/routes';
import { setAccessToken } from '@shared/api/request';

export type NavbarProps = {
  show: boolean;
  breadcrumb?: React.ReactNode[];
};

function Navbar({ show, breadcrumb = [] }: NavbarProps) {
  const t = useLocale();
  const locale = useLocale();
  const { userInfo, userLoading } = useGlobalSelector((state: GlobalState) => state);
  const dispatch = useGlobalDispatch();

  const [_, setUserStatus] = useStorage('userStatus');
  const [role] = useStorage('userRole', 'admin');

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
      <div className={styles['fixed-settings']}>
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
      className={styles['profile-menu']}
      onClickMenuItem={(key) => {
        if (key === 'logout') logout();
      }}
    >
      <Menu.Item key="profile" className={styles['profile-menu-item']} disabled>
        <div className={styles['profile-block']}>
          <Avatar size={32}>
            {userInfo?.avatar ? <img alt="avatar" src={userInfo.avatar} /> : null}
          </Avatar>
          <div className={styles['profile-meta']}>
            <div className={styles['profile-name']}>{userInfo?.name || 'admin'}</div>
            <div className={styles['profile-email']}>
              {userInfo?.email || 'admin@example.com'}
            </div>
          </div>
        </div>
      </Menu.Item>
      <Divider style={{ margin: '4px 0' }} />
      <Menu.Item key="logout">
        <IconPoweroff className={styles['dropdown-icon']} />
        {t['navbar.logout']}
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.navbar}>
      <div className={styles.left}>
        {breadcrumb.length > 0 && (
          <Breadcrumb className={styles.breadcrumb}>
            {breadcrumb.map((node, index) => (
              <Breadcrumb.Item key={index}>
                {typeof node === 'string' ? locale[node] || node : node}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        )}
      </div>
      <div className={styles.right}>
        <Input.Search
          className={styles.search}
          placeholder={t['navbar.search.placeholder']}
          allowClear
        />
        <div className={styles.iconGroup}>
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
          <Tooltip
            content={
              theme === 'light'
                ? t['settings.navbar.theme.toDark']
                : t['settings.navbar.theme.toLight']
            }
          >
            <IconButton
              icon={theme !== 'dark' ? <IconMoonFill /> : <IconSunFill />}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            />
          </Tooltip>
          <MessageBox>
            <Badge count={9} maxCount={99}>
              <IconButton icon={<IconNotification />} />
            </Badge>
          </MessageBox>
          <Trigger
            trigger="click"
            position="br"
            popupAlign={{ bottom: 4 }}
            popup={() => (
              <div className={styles['theme-panel']}>
                <div className={styles['theme-panel-title']}>
                  {t['settings.themeColor']}
                </div>
                <ColorPanel />
              </div>
            )}
          >
            <IconButton icon={<IconPalette />} />
          </Trigger>
        </div>
        {userInfo && (
          <Dropdown droplist={droplist} position="br" disabled={userLoading}>
            <div className={styles['user-trigger']}>
              <Avatar size={24}>
                {userLoading ? (
                  <IconLoading />
                ) : (
                  <img alt="avatar" src={userInfo.avatar} />
                )}
              </Avatar>
              <span className={styles['user-name']}>{userInfo.name || 'admin'}</span>
            </div>
          </Dropdown>
        )}
      </div>
    </div>
  );
}

export default Navbar;
