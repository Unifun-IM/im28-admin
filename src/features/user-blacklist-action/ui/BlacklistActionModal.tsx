import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Message,
  Modal,
  Radio,
  Select
} from '@arco-design/web-react';
import {
  postV1AdminUsersBan,
  postV1AdminUsersBatchBan,
  postV1AdminUsersBatchUnban,
  postV1AdminUsersUnban
} from '@shared/api/admin/users';
import iconWarning from '@assets/icon/icon-exclamation-circle-fill.svg';
import iconSuccess from '@assets/icon/icon-check-circle-fill.svg';
import { GaVerifyModal } from '@features/ga-verify';
import useLocale from '@shared/lib/useLocale';
import './blacklist-action-modal.less';

const FormItem = Form.Item;
const TextArea = Input.TextArea;

const BAN_REASON_KEYS = [
  'fraud',
  'spam',
  'abuse',
  'other'
] as const;

const UNBAN_REASON_KEYS = [
  'appeal',
  'mistaken',
  'resolved',
  'other'
] as const;

export type BlacklistActionModalProps = {
  visible: boolean;
  mode: 'add' | 'remove';
  variant?: 'single' | 'batch';
  userIds: string[];
  onCancel: () => void;
  onSuccess?: () => void;
};

type FormValues = {
  ban_period?: 'temporary' | 'permanent';
  banned_until?: unknown;
  reason?: string;
  reason_description?: string;
};

type PendingPayload = FormValues & { ids: string[] };

type Step = 'form' | 'ga';

function toRfc3339(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  const raw =
    typeof (value as { toDate?: () => Date }).toDate === 'function'
      ? (value as { toDate: () => Date }).toDate()
      : value;
  const d = raw instanceof Date ? raw : new Date(raw as string | number);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/**
 * 拉黑 / 解禁
 * 单人加入黑名单 Figma 750:16425；批量保留期限选项
 * → GaVerifyModal
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
  const [form] = Form.useForm<FormValues>();
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [gaErrorTick, setGaErrorTick] = useState(0);
  const [pending, setPending] = useState<PendingPayload | null>(null);
  const banPeriod = Form.useWatch('ban_period', form) as
    | FormValues['ban_period']
    | undefined;

  const isAdd = mode === 'add';
  const isBatch = variant === 'batch' || userIds.length > 1;
  const count = userIds.length || 1;

  const banReasonOptions = useMemo(
    () =>
      BAN_REASON_KEYS.map((key) => ({
        label: t[`blacklistAction.reason.${key}`],
        value: t[`blacklistAction.reason.${key}`]
      })),
    [t]
  );

  const unbanReasonOptions = useMemo(
    () =>
      UNBAN_REASON_KEYS.map((key) => ({
        label: t[`blacklistAction.unbanReason.${key}`],
        value: t[`blacklistAction.unbanReason.${key}`]
      })),
    [t]
  );

  useEffect(() => {
    if (!visible) return;
    setStep('form');
    setPending(null);
    setGaErrorTick(0);
    form.resetFields();
    if (isAdd) {
      form.setFieldsValue({ ban_period: 'permanent' });
    }
  }, [visible, mode, variant, form, isAdd]);

  const goGa = async () => {
    try {
      const values = await form.validate();
      const ids = userIds.filter(Boolean).slice(0, 100);
      if (!ids.length) return;
      setPending({ ...values, ids });
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
      const { ids, ...values } = pending;
      const reason = String(values.reason || '').trim();
      const reasonDescription =
        String(values.reason_description || '').trim() || reason;

      if (isAdd) {
        // 单人稿无期限选项，默认永久；批量可选限时/永久
        const banPeriodValue = isBatch
          ? (values.ban_period as 'temporary' | 'permanent')
          : 'permanent';
        const bannedUntil =
          banPeriodValue === 'temporary'
            ? toRfc3339(values.banned_until)
            : undefined;
        const commonBody = {
          reason,
          ban_period: banPeriodValue,
          banned_until: bannedUntil,
          reason_description: reasonDescription,
          two_factor_code: code
        };
        if (isBatch) {
          await postV1AdminUsersBatchBan({
            user_ids: ids,
            ...commonBody
          });
        } else {
          await postV1AdminUsersBan({
            user_id: ids[0],
            ...commonBody
          });
        }
      } else {
        const commonBody = {
          reason,
          reason_description: reasonDescription,
          two_factor_code: code
        };
        if (isBatch) {
          await postV1AdminUsersBatchUnban({
            user_ids: ids,
            ...commonBody
          });
        } else {
          await postV1AdminUsersUnban({
            user_id: ids[0],
            ...commonBody
          });
        }
      }

      Message.success(
        isAdd
          ? t['blacklistAction.msg.banSuccess']
          : t['blacklistAction.msg.unbanSuccess']
      );
      onSuccess?.();
      onCancel();
    } catch {
      setGaErrorTick((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const titleText = isAdd
    ? t['blacklistAction.title.ban']
    : t['blacklistAction.title.unban'];

  const descText = isAdd
    ? isBatch
      ? t['blacklistAction.desc.ban'].replace('{count}', String(count))
      : t['blacklistAction.desc.banSingle']
    : isBatch
      ? t['blacklistAction.desc.unban'].replace('{count}', String(count))
      : t['blacklistAction.desc.unbanSingle'];

  return (
    <>
      <Modal
        visible={visible && step === 'form'}
        onCancel={onCancel}
        unmountOnExit
        closable={false}
        maskClosable={false}
        className="use-blacklist-action-modal"
        wrapClassName="use-blacklist-action-modal-wrap"
        style={{ width: 780 }}
        title={null}
        footer={null}
      >
        <div className="use-blacklist-action-header">
          <img alt="" src={isAdd ? iconWarning : iconSuccess} />
          <span className="text-[16px] font-medium leading-6 text-arco-text-1">
            {titleText}
          </span>
        </div>

        <div className="use-blacklist-action-body">
          <p className="use-blacklist-action-desc">{descText}</p>

          <Form
            form={form}
            layout="vertical"
            requiredSymbol={{ position: 'end' }}
            className="use-blacklist-action-form mt-3 flex flex-col gap-3"
          >
            {isAdd && isBatch ? (
              <FormItem
                field="ban_period"
                label={t['blacklistAction.field.banPeriod']}
                rules={[
                  {
                    required: true,
                    message: t['blacklistAction.msg.banPeriodRequired']
                  }
                ]}
              >
                <Radio.Group className="use-blacklist-duration-radio">
                  <Radio value="temporary">
                    {t['blacklistAction.field.temporary']}
                  </Radio>
                  <Radio value="permanent">
                    {t['blacklistAction.field.permanent']}
                  </Radio>
                </Radio.Group>
              </FormItem>
            ) : null}

            {isAdd && isBatch && banPeriod === 'temporary' ? (
              <FormItem
                field="banned_until"
                label={t['blacklistAction.field.bannedUntil']}
                rules={[
                  {
                    required: true,
                    message: t['blacklistAction.msg.bannedUntilRequired']
                  }
                ]}
              >
                <DatePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder={t['blacklistAction.placeholder.bannedUntil']}
                />
              </FormItem>
            ) : null}

            <FormItem
              field="reason"
              label={
                isAdd
                  ? isBatch
                    ? t['blacklistAction.field.reason']
                    : t['blacklistAction.field.actionReason']
                  : isBatch
                    ? t['blacklistAction.field.unbanReason']
                    : t['blacklistAction.field.actionReason']
              }
              rules={[
                {
                  required: true,
                  message:
                    isAdd || !isBatch
                      ? t['blacklistAction.msg.reasonRequired']
                      : t['blacklistAction.msg.unbanReasonRequired']
                }
              ]}
            >
              <Select
                allowClear
                placeholder={
                  isAdd
                    ? isBatch
                      ? t['blacklistAction.placeholder.reason']
                      : t['blacklistAction.placeholder.actionReason']
                    : isBatch
                      ? t['blacklistAction.placeholder.unbanReason']
                      : t['blacklistAction.placeholder.actionReason']
                }
                options={isAdd ? banReasonOptions : unbanReasonOptions}
              />
            </FormItem>

            <FormItem
              field="reason_description"
              label={t['blacklistAction.field.reasonDescription']}
            >
              <TextArea
                placeholder={
                  isAdd
                    ? t['blacklistAction.placeholder.reasonDescription']
                    : t['blacklistAction.placeholder.unbanReasonDescription']
                }
                autoSize={{ minRows: 2, maxRows: 4 }}
                maxLength={500}
              />
            </FormItem>
          </Form>
        </div>

        <div className="use-blacklist-action-footer">
          <Button type="outline" className="!min-w-[80px]" onClick={onCancel}>
            {common['common.cancel']}
          </Button>
          <Button
            type="primary"
            status={isAdd ? 'danger' : undefined}
            className="!min-w-[80px]"
            onClick={goGa}
          >
            {isAdd
              ? t['blacklistAction.action.ban']
              : t['blacklistAction.action.unban']}
          </Button>
        </div>
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
