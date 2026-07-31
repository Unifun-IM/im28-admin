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
  postV1AdminUsersUnban
} from '@shared/api/admin/users';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import iconSuccess from '@shared/assets/icon-check-circle-fill.svg';
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
 * 拉黑 / 解禁 — 请求体直接使用 AdminBanUserRequest / AdminUnbanUserRequest
 * 批量时对每个 user_id 顺序调用接口（OpenAPI 单用户）
 */
export default function BlacklistActionModal({
  visible,
  mode,
  variant = 'single',
  userIds,
  onCancel,
  onSuccess
}: BlacklistActionModalProps) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isAdd = mode === 'add';
  const isBatch = variant === 'batch';
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
      setSubmitting(true);
      for (const user_id of userIds) {
        if (isAdd) {
          const body: AdminAPI.AdminBanUserRequest = {
            user_id,
            reason: values.reason,
            ban_period: values.ban_period,
            banned_until:
              values.ban_period === 'temporary'
                ? values.banned_until
                : undefined,
            reason_description: values.reason_description,
            remark: values.remark
          };
          await postV1AdminUsersBan(body);
        } else {
          const body: AdminAPI.AdminUnbanUserRequest = {
            user_id,
            reason: values.reason,
            reason_description: values.reason_description,
            remark: values.remark
          };
          await postV1AdminUsersUnban(body);
        }
      }
      Message.success(isAdd ? '拉黑成功' : '解禁成功');
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
                ? `拉黑 ${count} 位用户？`
                : '拉黑用户？'
              : isBatch
                ? `解禁 ${count} 位用户？`
                : '解禁用户？'}
          </span>
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>取消</Button>
          <Button
            type="primary"
            status={isAdd ? 'danger' : undefined}
            loading={submitting}
            onClick={handleOk}
          >
            确定
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        {isAdd ? (
          <FormItem
            field="ban_period"
            label="ban_period"
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Radio value="temporary">temporary</Radio>
              <Radio value="permanent">permanent</Radio>
            </Radio.Group>
          </FormItem>
        ) : null}
        {isAdd ? (
          <FormItem shouldUpdate noStyle>
            {(values) =>
              values.ban_period === 'temporary' ? (
                <FormItem
                  field="banned_until"
                  label="banned_until"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="RFC3339" />
                </FormItem>
              ) : null
            }
          </FormItem>
        ) : null}
        <FormItem field="reason" label="reason" rules={[{ required: true }]}>
          <Input placeholder="reason" />
        </FormItem>
        <FormItem
          field="reason_description"
          label="reason_description"
          rules={[{ required: true }]}
        >
          <TextArea placeholder="reason_description" />
        </FormItem>
        <FormItem field="remark" label="remark" rules={[{ required: true }]}>
          <TextArea placeholder="remark" />
        </FormItem>
      </Form>
    </Modal>
  );
}
