import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Message, Modal } from '@arco-design/web-react';
import {
  postV1AdminUsersWhitelistAdd,
  postV1AdminUsersWhitelistBatchRemove,
  postV1AdminUsersWhitelistRemove
} from '@shared/api/admin/users';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import iconSuccess from '@shared/assets/icon-check-circle-fill.svg';
import { GaVerifyModal } from '@features/ga-verify';
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

type FormValues = {
  user_id?: string;
  reason?: string;
};

type PendingPayload = FormValues & { ids: string[] };

type Step = 'form' | 'ga';

/**
 * 白名单操作 — 确认表单 → GaVerifyModal
 * AdminAddWhitelistUserRequest / AdminRemoveWhitelistUserRequest /
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
  const [form] = Form.useForm<FormValues>();
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [gaErrorTick, setGaErrorTick] = useState(0);
  const [pending, setPending] = useState<PendingPayload | null>(null);

  const isAdd = mode === 'add';
  const ids = userIds.filter(Boolean);
  const isBatch = !isAdd && (variant === 'batch' || ids.length > 1);
  const count = ids.length || 1;
  const needUserIdInput = isAdd && ids.length === 0;

  useEffect(() => {
    if (!visible) return;
    setStep('form');
    setPending(null);
    setGaErrorTick(0);
    form.resetFields();
    if (userIds.filter(Boolean).length === 1) {
      form.setFieldsValue({ user_id: userIds.filter(Boolean)[0] });
    }
  }, [visible, mode, variant, form, userIds]);

  const goGa = async () => {
    try {
      const values = await form.validate();
      if (isAdd) {
        const userId = (ids[0] || values.user_id || '').trim();
        if (!userId) return;
        setPending({ ...values, user_id: userId, ids: [userId] });
      } else {
        const removeIds = ids.slice(0, 100);
        if (!removeIds.length) return;
        setPending({ ...values, ids: removeIds });
      }
      setGaErrorTick(0);
      setStep('ga');
    } catch {
      // validate
    }
  };

  const submitGa = async (code: string) => {
    if (submitting || !pending) return;
    try {
      setSubmitting(true);
      if (isAdd) {
        const userId = (pending.user_id || pending.ids[0] || '').trim();
        const body: AdminAPI.AdminAddWhitelistUserRequest = {
          user_id: userId,
          reason: pending.reason?.trim() || undefined,
          two_factor_code: code
        };
        await postV1AdminUsersWhitelistAdd(body);
        Message.success(t['whitelistAction.msg.addSuccess']);
      } else if (isBatch) {
        await postV1AdminUsersWhitelistBatchRemove({
          user_ids: pending.ids,
          two_factor_code: code
        });
        Message.success(t['whitelistAction.msg.removeSuccess']);
      } else {
        await postV1AdminUsersWhitelistRemove({
          user_id: pending.ids[0],
          two_factor_code: code
        });
        Message.success(t['whitelistAction.msg.removeSuccess']);
      }
      onSuccess?.();
      onCancel();
    } catch {
      setGaErrorTick((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible && step === 'form'}
        onCancel={onCancel}
        unmountOnExit
        closable={false}
        maskClosable={false}
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
              onClick={goGa}
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
                  {t['whitelistAction.hint.userId'].replace(
                    '{id}',
                    ids[0] || ''
                  )}
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
        </Form>
      </Modal>

      <GaVerifyModal
        visible={visible && step === 'ga'}
        loading={submitting}
        errorTick={gaErrorTick}
        onCancel={onCancel}
        onOk={submitGa}
      />
    </>
  );
}
