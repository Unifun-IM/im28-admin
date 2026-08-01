import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Input,
  Message,
  Modal
} from '@arco-design/web-react';
import { IconClose } from '@arco-design/web-react/icon';
import cs from 'classnames';
import { useGlobalDispatch, useGlobalSelector } from '@entities/global-state';
import type { GlobalState } from '@entities/global-state';
import useLocale from '@shared/lib/useLocale';
import defaultAvatar from '../assets/default-avatar.svg';
import './user-center-modal.less';

export type UserCenterModalProps = {
  visible: boolean;
  onCancel: () => void;
};

/**
 * 用户中心 — Figma 743:24050（未设置安全）/ 743:24341（已设置）
 * 展示 AdminAPI.SysUser；改名/头像/重置等尚无 OpenAPI，仅本地态。
 */
export default function UserCenterModal({
  visible,
  onCancel
}: UserCenterModalProps) {
  const t = useLocale();
  const { userInfo } = useGlobalSelector((s: GlobalState) => s);
  const dispatch = useGlobalDispatch();

  const displayFromStore =
    userInfo?.sys_user?.display_name ||
    userInfo?.sys_user?.username ||
    t['userCenter.fallbackName'];

  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [passwordSet, setPasswordSet] = useState(true);
  const [gaSet, setGaSet] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!visible) return;
    setName(displayFromStore);
    setDraftName(displayFromStore);
    setEditingName(false);
    setAvatarUrl(undefined);
    setPasswordSet(true);
    setGaSet(true);
  }, [visible, displayFromStore]);

  const persistName = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) {
      Message.warning(t['userCenter.msg.nameEmpty']);
      return;
    }
    setName(trimmed);
    setEditingName(false);
    dispatch({
      type: 'update-userInfo',
      payload: {
        userInfo: {
          ...userInfo,
          sys_user: {
            ...userInfo?.sys_user,
            display_name: trimmed
          },
          permissions: userInfo?.permissions ?? {}
        }
      }
    });
    Message.success(t['userCenter.msg.nameUpdatedLocal']);
  };

  const onPickAvatar = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Message.warning(t['userCenter.msg.pickImage']);
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    Message.success(t['userCenter.msg.avatarUpdatedLocal']);
  };

  const resetPassword = () => {
    Modal.confirm({
      title: t['userCenter.resetPassword'],
      content: t['common.apiNotReady'],
      okText: t['common.confirm'],
      cancelText: t['common.cancel'],
      onOk: () => {
        setPasswordSet(true);
        Message.warning(t['common.apiNotReady']);
      }
    });
  };

  const resetGa = () => {
    Modal.confirm({
      title: t['userCenter.resetGa'],
      content: t['common.apiNotReady'],
      okText: t['common.confirm'],
      cancelText: t['common.cancel'],
      okButtonProps: gaSet ? { status: 'danger' } : undefined,
      onOk: () => {
        setGaSet(true);
        Message.warning(t['common.apiNotReady']);
      }
    });
  };

  const actionClass = (danger: boolean) =>
    cs(
      'cursor-pointer border-0 bg-transparent p-0 text-[12px] leading-5',
      danger ? 'text-[rgb(var(--danger-6))]' : 'text-[rgb(var(--link-6))]'
    );

  return (
    <Modal
      title={null}
      footer={null}
      visible={visible}
      onCancel={onCancel}
      unmountOnExit
      maskClosable
      closable={false}
      className="use-user-center-modal"
      wrapClassName="use-user-center-modal-wrap"
      style={{ width: 780 }}
    >
      <button
        type="button"
        aria-label={t['common.close']}
        className="absolute right-6 top-6 z-10 inline-flex size-8 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-2 hover:text-arco-text-1"
        onClick={onCancel}
      >
        <IconClose className="text-base" />
      </button>

      <div className="flex items-start gap-6">
        <div className="flex w-[108px] shrink-0 flex-col items-center gap-[15px]">
          <Avatar
            size={108}
            className="use-user-center-avatar !bg-[rgb(var(--primary-6))]"
          >
            {avatarUrl ? (
              <img alt="avatar" src={avatarUrl} />
            ) : (
              <img
                alt=""
                src={defaultAvatar}
                className="size-full object-cover"
              />
            )}
          </Avatar>
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-0 text-center text-[14px] leading-[21px] text-arco-text-1"
            onClick={() => fileRef.current?.click()}
          >
            {t['userCenter.edit']}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onPickAvatar(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>

        <div className="min-w-0 flex-1 pr-8">
          <div className="mb-6">
            <div className="border-0 border-b border-solid border-[rgba(0,0,0,0.08)] py-3">
              <span className="text-[14px] font-medium leading-[21px] text-arco-text-1">
                {t['userCenter.name']}
              </span>
            </div>
            <div className="mt-3">
              {editingName ? (
                <div className="flex items-center gap-3">
                  <Input
                    autoFocus
                    value={draftName}
                    maxLength={32}
                    className="max-w-[280px]"
                    onChange={setDraftName}
                    onPressEnter={() => persistName(draftName)}
                  />
                  <button
                    type="button"
                    className={actionClass(false)}
                    onClick={() => persistName(draftName)}
                  >
                    {t['common.save']}
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer border-0 bg-transparent p-0 text-[12px] leading-5 text-arco-text-3"
                    onClick={() => {
                      setDraftName(name);
                      setEditingName(false);
                    }}
                  >
                    {t['common.cancel']}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[14px] leading-[21px] text-arco-text-1">
                    {name}
                  </span>
                  <button
                    type="button"
                    className={actionClass(false)}
                    onClick={() => {
                      setDraftName(name);
                      setEditingName(true);
                    }}
                  >
                    {t['userCenter.editName']}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-0 border-b border-solid border-[rgba(0,0,0,0.08)] py-3">
            <span className="text-[14px] font-medium leading-[21px] text-arco-text-1">
              {t['userCenter.security']}
            </span>
          </div>

          <div className="mt-6 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] leading-[21px] text-arco-text-1">
                {t['userCenter.password']}
              </div>
              <div className="text-[12px] leading-5 text-arco-text-3">
                {passwordSet ? '******' : t['userCenter.passwordHint']}
              </div>
            </div>
            <button
              type="button"
              className={actionClass(passwordSet)}
              onClick={resetPassword}
            >
              {t['userCenter.resetPassword']}
            </button>
          </div>

          <div className="mt-6 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] leading-[21px] text-arco-text-1">
                {t['userCenter.ga']}
              </div>
              <div className="text-[12px] leading-5 text-arco-text-3">
                {gaSet ? '******' : t['userCenter.gaHint']}
              </div>
            </div>
            <button
              type="button"
              className={actionClass(gaSet)}
              onClick={resetGa}
            >
              {t['userCenter.resetGa']}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
