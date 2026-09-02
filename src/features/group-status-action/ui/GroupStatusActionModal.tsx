import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Message,
  Modal,
  Radio,
  Select,
  Tooltip
} from '@arco-design/web-react';
import {
  postV1AdminGroupsBan,
  postV1AdminGroupsMute
} from '@shared/api/admin/groups';
import iconWarning from '@assets/icon/icon-exclamation-circle-fill.svg';
import iconSuccess from '@assets/icon/icon-check-circle-fill.svg';
import useLocale from '@shared/lib/useLocale';
import { StatusBadge } from '@shared/ui/status-badge';
import { UserAvatar } from '@shared/ui/user-avatar';
import '@shared/ui/biz-form-modal.less';
import './group-status-action-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

const REASON_KEYS = ['violation', 'spam', 'abuse', 'other'] as const;

type FormValues = {
  target?: 'all' | 'ordinary';
  reason?: string;
  ban_duration?: 'permanent';
  reason_description?: string;
};

export type GroupStatusActionMode = 'mute' | 'unmute' | 'ban' | 'unban';

export type GroupStatusActionModalProps = {
  visible: boolean;
  mode: GroupStatusActionMode;
  group?: AdminAPI.Group | null;
  onCancel: () => void;
  onSuccess?: () => void;
};

/**
 * 群聊禁言 / 解除禁言 / 封禁 / 解除封禁
 * Figma 1225:28204 / 1225:28358 / 1225:28046 / 1225:28771。
 * 当前 Admin API 仅接受状态开关；原因、时长和普通成员禁言待契约补齐。
 */
export default function GroupStatusActionModal({
  visible,
  mode,
  group,
  onCancel,
  onSuccess
}: GroupStatusActionModalProps) {
  const t = useLocale();
  const [form] = Form.useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);
  const isMute = mode === 'mute';
  const isUnmute = mode === 'unmute';
  const isBan = mode === 'ban';
  const isUnban = mode === 'unban';
  const isEnable = isMute || isBan;
  const isBanOperation = isBan || isUnban;
  const groupId = group?.group_id || '';
  const groupName = group?.title || groupId || '--';
  const localePrefix = isBanOperation ? 'groupBanAction' : 'groupMuteAction';

  const reasonOptions = useMemo(
    () =>
      REASON_KEYS.map((key) => ({
        label: t[`${localePrefix}.reason.${key}`],
        value: key
      })),
    [localePrefix, t]
  );

  useEffect(() => {
    if (!visible) return;
    form.resetFields();
    if (isMute) form.setFieldsValue({ target: 'all' });
  }, [visible, mode, groupId, form, isMute]);

  const submit = async () => {
    if (submitting || !groupId) return;
    try {
      if (isEnable) await form.validate();
      setSubmitting(true);
      if (isBanOperation) {
        await postV1AdminGroupsBan({ group_id: groupId, enabled: isBan });
      } else {
        await postV1AdminGroupsMute({ group_id: groupId, enabled: isMute });
      }
      Message.success(t[`${localePrefix}.message.${mode}Success`]);
      onSuccess?.();
      onCancel();
    } catch {
      // Form and request errors are presented by Arco and the request layer.
    } finally {
      setSubmitting(false);
    }
  };

  const title = t[`${localePrefix}.title.${mode}`];
  const statusText = isEnable
    ? t[`${localePrefix}.status.normal`]
    : t[`${localePrefix}.status.${isUnmute ? 'muted' : 'banned'}`];

  return (
    <Modal
      className="use-biz-form-modal use-group-status-action-modal"
      wrapClassName="use-group-status-action-modal-wrap"
      visible={visible}
      onCancel={onCancel}
      unmountOnExit
      closable={false}
      maskClosable={false}
      style={{ width: 780 }}
      title={
        <span className="inline-flex min-w-0 items-center gap-2">
          <img
            alt=""
            src={isEnable ? iconWarning : iconSuccess}
            className="size-5 shrink-0"
          />
          <span className="truncate">{title}</span>
        </span>
      }
      footer={
        <div className="flex w-full flex-wrap justify-end gap-2">
          <Button
            type="outline"
            className="min-w-[80px]"
            disabled={submitting}
            onClick={onCancel}
          >
            {t['common.cancel']}
          </Button>
          <Button
            type="primary"
            status={isEnable ? 'danger' : undefined}
            className="min-w-[80px]"
            loading={submitting}
            onClick={submit}
          >
            {t[`${localePrefix}.action.${mode}`]}
          </Button>
        </div>
      }
    >
      <div className="use-group-status-summary">
        <UserAvatar
          size={56}
          userId={groupId}
          name={groupName}
          src={group?.avatar_url}
          className="use-group-status-avatar"
        />
        <div className="min-w-0">
          <div className="truncate text-title font-medium text-arco-text-1">
            {groupName}
          </div>
          <div className="use-group-status-meta">
            <span className="truncate">
              {t[`${localePrefix}.groupId`]}：{groupId || '--'}
            </span>
            <StatusBadge
              status={isEnable ? 'success' : 'error'}
              text={statusText}
            />
          </div>
        </div>
      </div>

      {isEnable ? (
        <>
          <p className="use-group-status-description">
            {t[`${localePrefix}.description.${mode}`]}
          </p>
          <Form
            form={form}
            layout="vertical"
            requiredSymbol={{ position: 'end' }}
            className="use-group-status-form"
          >
            {isMute ? (
              <FormItem
                field="target"
                label={t['groupMuteAction.field.target']}
                rules={[
                  {
                    required: true,
                    message: t['groupMuteAction.validation.target']
                  }
                ]}
              >
                <Radio.Group className="use-group-status-targets">
                  <Radio value="all">
                    {t['groupMuteAction.target.all']}
                  </Radio>
                  <Tooltip
                    content={t['groupMuteAction.target.ordinaryUnavailable']}
                  >
                    <span>
                      <Radio value="ordinary" disabled>
                        {t['groupMuteAction.target.ordinary']}
                      </Radio>
                    </span>
                  </Tooltip>
                </Radio.Group>
              </FormItem>
            ) : null}
            <FormItem
              field="reason"
              label={t[`${localePrefix}.field.reason`]}
              rules={[
                {
                  required: true,
                  message: t[`${localePrefix}.validation.reason`]
                }
              ]}
            >
              <Select
                allowClear
                options={reasonOptions}
                placeholder={t[`${localePrefix}.placeholder.reason`]}
              />
            </FormItem>
            {isBan ? (
              <FormItem
                field="ban_duration"
                label={t['groupBanAction.field.duration']}
                rules={[
                  {
                    required: true,
                    message: t['groupBanAction.validation.duration']
                  }
                ]}
              >
                <Select
                  allowClear
                  options={[
                    {
                      label: t['groupBanAction.duration.permanent'],
                      value: 'permanent'
                    }
                  ]}
                  placeholder={t['groupBanAction.placeholder.duration']}
                />
              </FormItem>
            ) : null}
            <FormItem
              field="reason_description"
              label={t[`${localePrefix}.field.description`]}
            >
              <TextArea
                maxLength={500}
                autoSize={{ minRows: 2, maxRows: 4 }}
                placeholder={t[`${localePrefix}.placeholder.description`]}
              />
            </FormItem>
          </Form>
        </>
      ) : (
        <>
          <div className="use-group-status-reason">
            <span>{t[`${localePrefix}.currentReason`]}：</span>
            <span>--</span>
          </div>
          <div className="use-group-status-confirmation">
            {t[`${localePrefix}.description.${mode}`]}
          </div>
          <Form form={form} layout="vertical" className="use-group-status-form">
            <FormItem
              field="reason_description"
              label={t[`${localePrefix}.field.description`]}
            >
              <TextArea
                maxLength={500}
                autoSize={{ minRows: 2, maxRows: 4 }}
                placeholder={t[`${localePrefix}.placeholder.description`]}
              />
            </FormItem>
          </Form>
        </>
      )}
    </Modal>
  );
}
