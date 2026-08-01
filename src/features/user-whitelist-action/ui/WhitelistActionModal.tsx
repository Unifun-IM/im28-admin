import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Message, Modal } from '@arco-design/web-react';
import {
  postV1AdminUsersWhitelistAdd,
  postV1AdminUsersWhitelistBatchRemove,
  postV1AdminUsersWhitelistRemove
} from '@shared/api/admin/users';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import iconSuccess from '@shared/assets/icon-check-circle-fill.svg';
import useLocale from '@shared/lib/useLocale';
import './whitelist-action-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

export type WhitelistActionModalProps = {
  visible: boolean;
  /** add = 添加白名单；remove = 移除白名单 */
  mode: 'add' | 'remove';
  variant?: 'single' | 'batch';
  /** 已选用户；add 且为空时表单填写 user_id */
  userIds?: string[];
  onCancel: () => void;
  onSuccess?: () => void;
};

/**
 * 白名单操作 — AdminAddWhitelistUserRequest / AdminRemoveWhitelistUserRequest /
 * AdminBatchRemoveWhitelistUserRequest（无 batch-add）
 */
export default function WhitelistActionModal({
  visible,
  mode,
  variant = 'single',
  userIds = [],
  onCancel,
  onSuccess
}: WhitelistActionModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm<{
    user_id?: string;
    reason?: string;
    two_factor_code?: string;
  }>();
  const [submitting, setSubmitting] = useState(false);
  const isAdd = mode === 'add';
  const ids = userIds.filter(Boolean);
  const isBatch = !isAdd && (variant === 'batch' || ids.length > 1);
  const count = ids.length || 1;
  const needUserIdInput = isAdd && ids.length === 0;

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    if (userIds.filter(Boolean).length === 1) {
      form.setFieldsValue({ user_id: userIds.filter(Boolean)[0] });
    }
  }, [visible, mode, variant, form, userIds]);

  const handleOk = async () => {
    try {
      const values = await form.validate();
      const two_factor_code = String(values.two_factor_code || '').trim();

      if (isAdd) {
        const userId = (ids[0] || values.user_id || '').trim();
        if (!userId) return;
        setSubmitting(true);
        const body: AdminAPI.AdminAddWhitelistUserRequest = {
          user_id: userId,
          reason: values.reason?.trim() || undefined,
          two_factor_code
        };
        await postV1AdminUsersWhitelistAdd(body);
        Message.success(t['whitelistAction.msg.addSuccess']);
      } else {
        const removeIds = ids.slice(0, 100);
        if (!removeIds.length) return;
        setSubmitting(true);
        if (isBatch) {
          const body: AdminAPI.AdminBatchRemoveWhitelistUserRequest = {
            user_ids: removeIds,
            two_factor_code
          };
          await postV1AdminUsersWhitelistBatchRemove(body);
        } else {
          const body: AdminAPI.AdminRemoveWhitelistUserRequest = {
            user_id: removeIds[0],
            two_factor_code
          };
          await postV1AdminUsersWhitelistRemove(body);
        }
        Message.success(t['whitelistAction.msg.removeSuccess']);
      }

      onSuccess?.();
      onCancel();
    } catch {
      // validate / request
    } finally {
      setSubmitting(false);
    }
  };

  const twoFactorField = (
    <FormItem
      field="two_factor_code"
      label={t['accounts.field.twoFactorCode']}
      rules={[
        { required: true, message: t['accounts.msg.twoFactorRequired'] },
        {
          match: /^\d{6}$/,
          message: t['accounts.msg.twoFactorFormat']
        }
      ]}
    >
      <Input
        maxLength={6}
        placeholder={t['accounts.placeholder.twoFactorCode']}
        allowClear
      />
    </FormItem>
  );

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      unmountOnExit
      className="use-whitelist-action-modal"
      style={{ width: 480 }}
      title={
        <div className="flex items-center gap-2">
          <img
            alt=""
            src={isAdd ? iconSuccess : iconWarning}
            className="size-5"
          />
          <span>
            {isAdd
              ? t['whitelistAction.title.add']
              : isBatch
                ? t['whitelistAction.title.removeBatch'].replace(
                    '{count}',
                    String(count)
                  )
                : t['whitelistAction.title.removeSingle']}
          </span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>{common['common.cancel']}</Button>
          <Button
            type="primary"
            status={isAdd ? undefined : 'danger'}
            loading={submitting}
            onClick={handleOk}
          >
            {common['common.confirm']}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical" className="use-whitelist-action-form">
        {isAdd ? (
          <>
            {needUserIdInput ? (
              <FormItem
                field="user_id"
                label={t['whitelistAction.field.userId']}
                rules={[
                  {
                    required: true,
                    message: t['whitelistAction.placeholder.userId']
                  }
                ]}
              >
                <Input placeholder={t['whitelistAction.placeholder.userId']} />
              </FormItem>
            ) : (
              <div className="mb-4 text-sm leading-[22px] text-arco-text-2">
                {t['whitelistAction.hint.userId'].replace('{id}', ids[0] || '')}
              </div>
            )}
            <FormItem field="reason" label={t['whitelistAction.field.reason']}>
              <TextArea
                placeholder={t['whitelistAction.placeholder.reason']}
                maxLength={200}
                showWordLimit
              />
            </FormItem>
          </>
        ) : (
          <div className="mb-4 text-sm leading-[22px] text-arco-text-2">
            {isBatch
              ? t['whitelistAction.hint.removeBatch'].replace(
                  '{count}',
                  String(count)
                )
              : t['whitelistAction.hint.removeSingle'].replace(
                  '{id}',
                  ids[0] || ''
                )}
          </div>
        )}
        {twoFactorField}
      </Form>
    </Modal>
  );
}
