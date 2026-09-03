import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Input, Message, Modal, Select } from '@arco-design/web-react';

import { GaVerifyModal } from '@features/ga-verify';
import {
  postV1AdminAssetDepositAddressReplace,
  postV1AdminAssetDepositAddressStatusUpdate,
  postV1AdminAssetWithdrawalReview
} from '@shared/api/admin/assets';
import { postV1AdminAuthSecurityVerify } from '@shared/api/admin/auth';
import useLocale from '@shared/lib/useLocale';
import '@shared/ui/biz-form-modal.less';

const FormItem = Form.Item;

export type AssetSecureActionTarget =
  | {
      mode: 'replaceAddress';
      address: AdminAPI.AdminAssetDepositAddress;
    }
  | {
      mode: 'updateAddressStatus';
      address: AdminAPI.AdminAssetDepositAddress;
      nextStatus: 'active' | 'unavailable';
    }
  | {
      mode: 'reviewWithdrawal';
      withdrawal: AdminAPI.AdminAssetWithdrawalOrder;
    };

type ActionForm = {
  action?: 'approve' | 'reject';
  reason?: string;
};

export type AssetSecureActionModalProps = {
  target: AssetSecureActionTarget | null;
  onCancel: () => void;
  onSuccess: () => void;
};

export default function AssetSecureActionModal({
  target,
  onCancel,
  onSuccess
}: AssetSecureActionModalProps) {
  const t = useLocale();
  const [form] = Form.useForm<ActionForm>();
  const [step, setStep] = useState<'form' | 'ga'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [gaErrorTick, setGaErrorTick] = useState(0);

  useEffect(() => {
    if (!target) return;
    form.resetFields();
    if (target.mode === 'reviewWithdrawal') {
      form.setFieldsValue({ action: 'approve' });
    }
    setStep('form');
    setSubmitting(false);
    setGaErrorTick(0);
  }, [form, target]);

  const content = useMemo(() => {
    if (!target) return null;
    if (target.mode === 'replaceAddress') {
      return {
        title: t['asset.action.replaceTitle'],
        tip: t['asset.action.replaceTip'],
        identity: target.address.address,
        submit: t['asset.action.replace']
      };
    }
    if (target.mode === 'updateAddressStatus') {
      return {
        title: t['asset.action.statusTitle'],
        tip:
          target.nextStatus === 'active'
            ? t['asset.action.enableTip']
            : t['asset.action.disableTip'],
        identity: target.address.address,
        submit:
          target.nextStatus === 'active'
            ? t['asset.action.enable']
            : t['asset.action.disable']
      };
    }
    return {
      title: t['asset.action.reviewTitle'],
      tip: t['asset.action.reviewTip'],
      identity: target.withdrawal.withdrawal_id,
      submit: t['asset.action.review']
    };
  }, [t, target]);

  const requireReason = (values: ActionForm) =>
    target?.mode !== 'reviewWithdrawal' || values.action === 'reject';

  const openGa = async () => {
    const values = await form.validate();
    if (requireReason(values) && !String(values.reason || '').trim()) {
      form.setFieldValue('reason', values.reason || '');
      return;
    }
    setGaErrorTick(0);
    setStep('ga');
  };

  const submitGa = async (code: string) => {
    if (!target || submitting) return;
    const values = form.getFieldsValue();
    const operation: AdminAPI.VerifySecurityRequest['operation'] =
      target.mode === 'replaceAddress'
        ? 'asset_deposit_address_replace'
        : target.mode === 'updateAddressStatus'
          ? 'asset_deposit_address_status_update'
          : 'asset_withdrawal_review';

    try {
      setSubmitting(true);
      const verify = await postV1AdminAuthSecurityVerify({
        operation,
        two_factor_code: code
      });
      const securityToken = verify.data?.security_token;
      if (!securityToken) {
        setGaErrorTick((value) => value + 1);
        return;
      }

      if (target.mode === 'replaceAddress') {
        await postV1AdminAssetDepositAddressReplace({
          user_id: target.address.user_id,
          currency_code: 'USDT',
          network_code: 'TRC20',
          reason: String(values.reason || '').trim(),
          security_token: securityToken
        });
      } else if (target.mode === 'updateAddressStatus') {
        await postV1AdminAssetDepositAddressStatusUpdate({
          address_id: target.address.address_id,
          status: target.nextStatus,
          reason: String(values.reason || '').trim() || undefined,
          security_token: securityToken
        });
      } else {
        await postV1AdminAssetWithdrawalReview({
          withdrawal_id: target.withdrawal.withdrawal_id,
          action: values.action || 'approve',
          reason: String(values.reason || '').trim() || undefined,
          security_token: securityToken
        });
      }

      Message.success(t['asset.action.success']);
      onSuccess();
    } catch {
      setGaErrorTick((value) => value + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const action = Form.useWatch('action', form);
  const reasonRequired =
    target?.mode !== 'reviewWithdrawal' || action === 'reject';

  return (
    <>
      <Modal
        visible={Boolean(target) && step === 'form'}
        title={content?.title}
        className="use-biz-form-modal"
        style={{ width: 480 }}
        unmountOnExit
        maskClosable={false}
        onCancel={onCancel}
        footer={
          <div className="flex w-full flex-wrap justify-end gap-2">
            <Button type="outline" onClick={onCancel}>
              {t['common.cancel']}
            </Button>
            <Button type="primary" onClick={openGa}>
              {content?.submit}
            </Button>
          </div>
        }
      >
        <div className="mb-4 break-all text-sm text-arco-text-2">
          {content?.identity}
        </div>
        <Alert className="mb-4" type="warning" content={content?.tip} />
        <Form form={form} layout="vertical">
          {target?.mode === 'reviewWithdrawal' && (
            <FormItem
              field="action"
              label={t['asset.action.reviewDecision']}
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { label: t['asset.action.approve'], value: 'approve' },
                  { label: t['asset.action.reject'], value: 'reject' }
                ]}
              />
            </FormItem>
          )}
          <FormItem
            field="reason"
            label={t['asset.action.reason']}
            rules={reasonRequired ? [{ required: true }] : undefined}
          >
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 5 }}
              maxLength={500}
              showWordLimit
              placeholder={t['asset.action.reasonPlaceholder']}
            />
          </FormItem>
        </Form>
      </Modal>

      <GaVerifyModal
        visible={Boolean(target) && step === 'ga'}
        loading={submitting}
        errorTick={gaErrorTick}
        onCancel={() => setStep('form')}
        onOk={submitGa}
      />
    </>
  );
}
