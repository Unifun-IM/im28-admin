import React, { useEffect, useRef, useState } from 'react';
import { Avatar, Input, Message, Modal } from '@arco-design/web-react';
import { IconClose } from '@arco-design/web-react/icon';
import { postV1AdminAuthProfileUpdate } from '@shared/api/admin/auth';
import { clearAuthSession } from '@shared/api/request';
import { useGlobalDispatch, useGlobalSelector } from '@entities/global-state';
import type { GlobalState } from '@entities/global-state';
import useLocale from '@shared/lib/useLocale';
import useStorage from '@shared/lib/useStorage';
import {
  ADMIN_IMAGE_ACCEPT,
  uploadAdminImage,
  validateAdminImage
} from '@shared/lib/uploadAdminImage';
import ChangeOwnPasswordFlow from './ChangeOwnPasswordFlow';
import ResetOwnGaFlow from './ResetOwnGaFlow';
import './user-center-modal.less';

export type UserCenterModalProps = {
  visible: boolean;
  onCancel: () => void;
};

type Step = 'main' | 'changePassword' | 'resetGa';

/**
 * 个人中心 — Figma 743:24050
 * 改密：979:40720 → GaVerify → 979:40879 → 979:40992
 * 重置谷歌：979:40737 → GaVerify → 979:40689
 */
export default function UserCenterModal({
  visible,
  onCancel
}: UserCenterModalProps) {
  const t = useLocale();
  const common = t;
  const { userInfo } = useGlobalSelector((s: GlobalState) => s);
  const dispatch = useGlobalDispatch();
  const [, setUserStatus] = useStorage('userStatus');

  const displayFromStore =
    userInfo?.sys_user?.display_name ||
    userInfo?.sys_user?.username ||
    t['userCenter.fallbackName'];
  const username = userInfo?.sys_user?.username || '';

  const [step, setStep] = useState<Step>('main');
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!visible) return;
    setStep('main');
    setName(displayFromStore);
    setDraftName(displayFromStore);
    setEditingName(false);
    setAvatarUrl(undefined);
  }, [visible, displayFromStore]);

  const forceRelogin = () => {
    setUserStatus('logout');
    clearAuthSession();
    window.location.href = '/login';
  };

  const persistName = async (next: string) => {
    const trimmed = next.trim();
    if (!trimmed) {
      Message.warning(t['userCenter.msg.nameEmpty']);
      return;
    }
    if (trimmed === name) {
      setEditingName(false);
      return;
    }
    try {
      setNameSaving(true);
      await postV1AdminAuthProfileUpdate({ display_name: trimmed });
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
      Message.success(common['common.success']);
    } catch {
      // request
    } finally {
      setNameSaving(false);
    }
  };

  const onPickAvatar = async (file?: File | null) => {
    if (!file || avatarUploading) return;
    const invalid = validateAdminImage(file);
    if (invalid === 'type') {
      Message.warning(common['common.upload.imageType']);
      return;
    }
    if (invalid === 'size') {
      Message.warning(common['common.upload.imageMax1m']);
      return;
    }
    try {
      setAvatarUploading(true);
      const url = await uploadAdminImage(file);
      setAvatarUrl(url);
      // UpdateOwnProfileRequest 暂无 avatar 字段，仅预览已上传 URL
      Message.warning(t['userCenter.msg.avatarUploadedNoSave']);
    } catch {
      Message.error(common['common.upload.failed']);
    } finally {
      setAvatarUploading(false);
    }
  };

  const linkBtn =
    'cursor-pointer border-0 bg-transparent p-0 text-[12px] leading-5 text-[rgb(var(--link-6))] hover:opacity-80';

  return (
    <>
      <Modal
        title={null}
        footer={null}
        visible={visible && step === 'main'}
        onCancel={onCancel}
        unmountOnExit
        maskClosable
        closable={false}
        className="use-user-center-modal"
        wrapClassName="use-user-center-modal-wrap"
        style={{ width: 780, height: 780, maxHeight: '90vh' }}
      >
        <button
          type="button"
          aria-label={common['common.close']}
          className="absolute right-6 top-6 z-10 inline-flex size-8 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-2 hover:text-arco-text-1"
          onClick={onCancel}
        >
          <IconClose className="text-base" />
        </button>

        <div className="flex w-[108px] shrink-0 flex-col items-center gap-[15px]">
          <Avatar
            size={108}
            className="use-user-center-avatar !bg-[rgb(var(--primary-6))]"
          >
            {avatarUrl ? (
              <img alt="avatar" src={avatarUrl} />
            ) : (
              (name || '?').slice(0, 1)
            )}
          </Avatar>
          <button
            type="button"
            disabled={avatarUploading}
            className="cursor-pointer border-0 bg-transparent p-0 text-center text-[14px] leading-[21px] text-arco-text-1 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => fileRef.current?.click()}
          >
            {avatarUploading
              ? common['common.upload.uploading']
              : t['userCenter.edit']}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={ADMIN_IMAGE_ACCEPT}
            className="hidden"
            disabled={avatarUploading}
            onChange={(e) => {
              void onPickAvatar(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6 pr-8">
          <div className="flex flex-col gap-3">
            <div className="border-0 border-b border-solid border-[rgba(0,0,0,0.08)] py-3">
              <span className="text-[14px] font-medium leading-[21px] text-arco-text-1">
                {t['userCenter.name']}
              </span>
            </div>
            {editingName ? (
              <div className="flex items-center gap-3">
                <Input
                  autoFocus
                  value={draftName}
                  maxLength={32}
                  className="max-w-[280px]"
                  disabled={nameSaving}
                  onChange={setDraftName}
                  onPressEnter={() => persistName(draftName)}
                />
                <button
                  type="button"
                  className={linkBtn}
                  disabled={nameSaving}
                  onClick={() => persistName(draftName)}
                >
                  {common['common.save']}
                </button>
                <button
                  type="button"
                  className="cursor-pointer border-0 bg-transparent p-0 text-[12px] leading-5 text-arco-text-3"
                  disabled={nameSaving}
                  onClick={() => {
                    setDraftName(name);
                    setEditingName(false);
                  }}
                >
                  {common['common.cancel']}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 whitespace-nowrap">
                <span className="text-[14px] leading-[21px] text-arco-text-1">
                  {name}
                </span>
                <button
                  type="button"
                  className={linkBtn}
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

          <div className="border-0 border-b border-solid border-[rgba(0,0,0,0.08)] py-3">
            <span className="text-[14px] font-medium leading-[21px] text-arco-text-1">
              {t['userCenter.security']}
            </span>
          </div>

          <div className="flex w-full flex-col">
            <div className="text-[14px] leading-[21px] text-arco-text-1">
              {t['userCenter.password']}
            </div>
            <div className="flex items-start justify-between gap-3 whitespace-nowrap text-[12px] leading-5">
              <span className="text-arco-text-3">**********</span>
              <button
                type="button"
                className={linkBtn}
                onClick={() => setStep('changePassword')}
              >
                {t['userCenter.changePassword']}
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col">
            <div className="text-[14px] leading-[21px] text-arco-text-1">
              {t['userCenter.ga']}
            </div>
            <div className="flex items-start justify-between gap-3 whitespace-nowrap text-[12px] leading-5">
              <span className="text-arco-text-3">******</span>
              <button
                type="button"
                className={linkBtn}
                onClick={() => setStep('resetGa')}
              >
                {t['userCenter.resetGa']}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <ChangeOwnPasswordFlow
        visible={visible && step === 'changePassword'}
        username={username}
        onCancel={() => setStep('main')}
        onRelogin={forceRelogin}
      />

      <ResetOwnGaFlow
        visible={visible && step === 'resetGa'}
        onCancel={() => setStep('main')}
        onDone={forceRelogin}
      />
    </>
  );
}
