import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Input,
  Message,
  Modal
} from '@arco-design/web-react';
import { IconClose } from '@arco-design/web-react/icon';
import cs from 'classnames';
import { useGlobalDispatch, useGlobalSelector } from '@shared/lib/global-store-hooks';
import type { GlobalState } from '@entities/global-state';
import defaultAvatar from '../assets/default-avatar.svg';
import './user-center-modal.less';

export type UserCenterModalProps = {
  visible: boolean;
  onCancel: () => void;
};

/**
 * 用户中心 — Figma 743:24050（未设置安全）/ 743:24341（已设置）
 */
export default function UserCenterModal({
  visible,
  onCancel
}: UserCenterModalProps) {
  const { userInfo } = useGlobalSelector((s: GlobalState) => s);
  const dispatch = useGlobalDispatch();

  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  /** 是否已设置密码 / 谷歌验证 — 对齐两稿态 */
  const [passwordSet, setPasswordSet] = useState(true);
  const [gaSet, setGaSet] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!visible) return;
    const n = userInfo?.name || 'Super admin';
    setName(n);
    setDraftName(n);
    setEditingName(false);
    setAvatarUrl(userInfo?.avatar);
    setPasswordSet(true);
    setGaSet(true);
  }, [visible, userInfo?.name, userInfo?.avatar]);

  const persistName = (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) {
      Message.warning('名称不能为空');
      return;
    }
    setName(trimmed);
    setEditingName(false);
    dispatch({
      type: 'update-userInfo',
      payload: {
        userInfo: {
          ...userInfo,
          name: trimmed
        }
      }
    });
    Message.success('名称已更新');
  };

  const onPickAvatar = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      Message.warning('请选择图片文件');
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    dispatch({
      type: 'update-userInfo',
      payload: {
        userInfo: {
          ...userInfo,
          avatar: url
        }
      }
    });
    Message.success('头像已更新');
  };

  const resetPassword = () => {
    Modal.confirm({
      title: '重置密码',
      content: passwordSet
        ? '确认重置当前账号密码？重置后需使用新密码登录。'
        : '确认为当前账号设置密码？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setPasswordSet(true);
        Message.success(passwordSet ? '密码已重置（mock）' : '密码已设置（mock）');
      }
    });
  };

  const resetGa = () => {
    Modal.confirm({
      title: '重置谷歌验证',
      content: gaSet
        ? '确认重置谷歌验证？重置后需重新绑定。'
        : '确认为当前账号绑定谷歌验证？',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: gaSet ? { status: 'danger' } : undefined,
      onOk: () => {
        setGaSet(true);
        Message.success(gaSet ? '谷歌验证已重置（mock）' : '谷歌验证已绑定（mock）');
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
        aria-label="关闭"
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
            编辑
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
          {/* 名称 — 743:24050 / 743:24341 */}
          <div className="mb-6">
            <div className="border-0 border-b border-solid border-[rgba(0,0,0,0.08)] py-3">
              <span className="text-[14px] font-medium leading-[21px] text-arco-text-1">
                名称
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
                    保存
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer border-0 bg-transparent p-0 text-[12px] leading-5 text-arco-text-3"
                    onClick={() => {
                      setDraftName(name);
                      setEditingName(false);
                    }}
                  >
                    取消
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
                    修改名称
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 帐号安全 */}
          <div className="border-0 border-b border-solid border-[rgba(0,0,0,0.08)] py-3">
            <span className="text-[14px] font-medium leading-[21px] text-arco-text-1">
              帐号安全
            </span>
          </div>

          <div className="mt-6 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] leading-[21px] text-arco-text-1">
                密码
              </div>
              <div className="text-[12px] leading-5 text-arco-text-3">
                {passwordSet ? '******' : '为你的帐号设置密码'}
              </div>
            </div>
            <button
              type="button"
              className={actionClass(passwordSet)}
              onClick={resetPassword}
            >
              重置密码
            </button>
          </div>

          <div className="mt-6 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[14px] leading-[21px] text-arco-text-1">
                谷歌验证
              </div>
              <div className="text-[12px] leading-5 text-arco-text-3">
                {gaSet ? '******' : '为你的帐号多加一层安全保障'}
              </div>
            </div>
            <button
              type="button"
              className={actionClass(gaSet)}
              onClick={resetGa}
            >
              重置密码
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
