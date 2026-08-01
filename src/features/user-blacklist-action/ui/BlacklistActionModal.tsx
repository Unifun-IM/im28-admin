import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Radio
} from '@arco-design/web-react';
import {
  postV1AdminUsersBan,
  postV1AdminUsersBatchBan,
  postV1AdminUsersBatchUnban,
  postV1AdminUsersUnban
} from '@shared/api/admin/users';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import iconSuccess from '@shared/assets/icon-check-circle-fill.svg';
import useLocale from '@shared/lib/useLocale';
import './blacklist-action-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

export type BlacklistActionModalProps = {
  visible: boolean;
  mode: 'add' | 'remove';
  variant?: 'single' | 'batch';
  userIds: string[];
  onCancel: () => void;
  onSuccess?: () => void;
};

/**
 * 拉黑 / 解禁 — AdminBanUserRequest / AdminUnbanUserRequest
 * 批量走 batch-ban / batch-unban（单次最多 100）
 */
export default function BlacklistActionModal({
  visible,
  mode,
  variant = 'single',
  userIds,
  onCancel,
  onSuccess
}: BlacklistActionModalProps) {
  const t = useLocale();
  const common = t;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isAdd = mode === 'add';
  const isBatch = variant === 'batch' || userIds.length > 1;
  const count = userIds.length || 1;

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    if (isAdd) {
      form.setFieldsValue({ ban_period: 'permanent' });
    }
  }, [visible, mode, variant, form, isAdd]);

  const handleOk = async () => {
    try {
      const values = await form.validate();
      const ids = userIds.filter(Boolean).slice(0, 100);
      if (!ids.length) return;

      setSubmitting(true);

      const twoFactor = {
        two_factor_code: String(values.two_factor_code || '').trim()
      };

      if (isAdd) {
        const common = {
          reason: values.reason,
          ban_period: values.ban_period as 'temporary' | 'permanent',
          banned_until:
            values.ban_period === 'temporary'
              ? values.banned_until
              : undefined,
          reason_description: values.reason_description,
          ...twoFactor
        };
        if (isBatch) {
          const body: AdminAPI.AdminBatchBanUserRequest = {
            user_ids: ids,
            ...common
          };
          await postV1AdminUsersBatchBan(body);
        } else {
          const body: AdminAPI.AdminBanUserRequest = {
            user_id: ids[0],
            ...common
          };
          await postV1AdminUsersBan(body);
        }
      } else {
        const common = {
          reason: values.reason,
          reason_description: values.reason_description,
          ...twoFactor
        };
        if (isBatch) {
          const body: AdminAPI.AdminBatchUnbanUserRequest = {
            user_ids: ids,
            ...common
          };
          await postV1AdminUsersBatchUnban(body);
        } else {
          const body: AdminAPI.AdminUnbanUserRequest = {
            user_id: ids[0],
            ...common
          };
          await postV1AdminUsersUnban(body);
        }
      }

      Message.success(
        isAdd ? t['blacklistAction.msg.banSuccess'] : t['blacklistAction.msg.unbanSuccess']
      );
      onSuccess?.();
      onCancel();
    } catch {
      // validate / request
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      unmountOnExit
      className="use-blacklist-action-modal"
      style={{ width: 480 }}
      title={
        <div className="flex items-center gap-2">
          <img
            alt=""
            src={isAdd ? iconWarning : iconSuccess}
            className="size-5"
          />
          <span>
            {isAdd
              ? isBatch
                ? t['blacklistAction.title.banBatch'].replace(
                    '{count}',
                    String(count)
                  )
                : t['blacklistAction.title.banSingle']
              : isBatch
                ? t['blacklistAction.title.unbanBatch'].replace(
                    '{count}',
                    String(count)
                  )
                : t['blacklistAction.title.unbanSingle']}
          </span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>{common['common.cancel']}</Button>
          <Button
            type="primary"
            status={isAdd ? 'danger' : undefined}
            loading={submitting}
            onClick={handleOk}
          >
            {common['common.confirm']}
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        {isAdd ? (
          <FormItem
            field="ban_period"
            label={t['blacklistAction.field.banPeriod']}
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value="temporary">
                {t['blacklistAction.field.temporary']}
              </Radio>
              <Radio value="permanent">
                {t['blacklistAction.field.permanent']}
              </Radio>
            </Radio.Group>
          </FormItem>
        ) : null}
        {isAdd ? (
          <FormItem shouldUpdate noStyle>
            {(values) =>
              values.ban_period === 'temporary' ? (
                <FormItem
                  field="banned_until"
                  label={t['blacklistAction.field.bannedUntil']}
                  rules={[{ required: true }]}
                >
                  <Input placeholder={t['blacklistAction.placeholder.bannedUntil']} />
                </FormItem>
              ) : null
            }
          </FormItem>
        ) : null}
        <FormItem
          field="reason"
          label={t['blacklistAction.field.reason']}
          rules={[{ required: true }]}
        >
          <Input placeholder={t['blacklistAction.placeholder.reason']} />
        </FormItem>
        <FormItem
          field="reason_description"
          label={t['blacklistAction.field.reasonDescription']}
          rules={[{ required: true }]}
        >
          <TextArea placeholder={t['blacklistAction.placeholder.reasonDescription']} />
        </FormItem>
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
      </Form>
    </Modal>
  );
}
