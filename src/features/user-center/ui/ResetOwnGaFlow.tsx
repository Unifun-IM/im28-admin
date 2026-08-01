import React, { useEffect, useState } from 'react';
import { Button, Modal, Result } from '@arco-design/web-react';
import { IconCheckCircleFill } from '@arco-design/web-react/icon';
import cs from 'classnames';
import {
  postV1AdminAuthSecurityVerify,
  postV1AdminAuthTwoFactorReset
} from '@shared/api/admin/auth';
import iconWarning from '@shared/assets/icon-exclamation-circle-fill.svg';
import { GaVerifyModal } from '@features/ga-verify';
import useLocale from '@shared/lib/useLocale';
import './user-center-modal.less';

export type ResetOwnGaFlowProps = {
  visible: boolean;
  onCancel: () => void;
  /** 成功后点「完成」：会话已失效，需重新登录 */
  onDone: () => void;
};

type Step = 'confirm' | 'ga' | 'success';

/**
 * 个人中心重置谷歌
 * 确认 979:40737 → GaVerifyModal → 成功 979:40689
 */
export default function ResetOwnGaFlow({
  visible,
  onCancel,
  onDone
}: ResetOwnGaFlowProps) {
  const t = useLocale();
  const common = t;
  const [step, setStep] = useState<Step>('confirm');
  const [submitting, setSubmitting] = useState(false);
  const [gaErrorTick, setGaErrorTick] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setStep('confirm');
    setSubmitting(false);
    setGaErrorTick(0);
  }, [visible]);

  const submitGa = async (code: string) => {
    if (submitting) return;
    try {
      setSubmitting(true);
      const verify = await postV1AdminAuthSecurityVerify({
        operation: 'reset_two_factor',
        two_factor_code: code
      });
      const securityToken = verify.data?.security_token;
      if (!securityToken) {
        setGaErrorTick((n) => n + 1);
        return;
      }
      await postV1AdminAuthTwoFactorReset({ security_token: securityToken });
      setStep('success');
    } catch {
      setGaErrorTick((n) => n + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible && step === 'confirm'}
        onCancel={onCancel}
        unmountOnExit
        closable={false}
        maskClosable={false}
        className="use-change-own-pwd-modal"
        wrapClassName="use-user-center-modal-wrap"
        style={{ width: 480 }}
        title={
          <div className="flex items-center gap-2">
            <img alt="" src={iconWarning} className="size-5" />
            <span>{t['userCenter.gaConfirm.title']}</span>
          </div>
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button type="outline" className="!min-w-[80px]" onClick={onCancel}>
              {common['common.cancel']}
            </Button>
            <Button
              type="primary"
              status="danger"
              className="!min-w-[80px]"
              onClick={() => {
                setGaErrorTick(0);
                setStep('ga');
              }}
            >
              {t['userCenter.resetGa']}
            </Button>
          </div>
        }
      >
        <p className="m-0 text-[14px] leading-[21px] text-arco-text-1">
          {t['userCenter.gaConfirm.desc']}
        </p>
        <ul className="m-0 mt-3 list-disc pl-[21px] text-[14px] leading-[21px] text-arco-text-1">
          <li>{t['userCenter.gaConfirm.bullet.1']}</li>
          <li>{t['userCenter.gaConfirm.bullet.2']}</li>
          <li>{t['userCenter.gaConfirm.bullet.3']}</li>
        </ul>
      </Modal>

      <GaVerifyModal
        visible={visible && step === 'ga'}
        loading={submitting}
        errorTick={gaErrorTick}
        onCancel={onCancel}
        onOk={submitGa}
      />

      <Modal
        visible={visible && step === 'success'}
        onCancel={onDone}
        unmountOnExit
        closable={false}
        maskClosable={false}
        footer={null}
        className={cs('use-change-own-pwd-modal', 'is-success')}
        wrapClassName="use-user-center-modal-wrap"
        style={{ width: 780 }}
      >
        <div className="px-20 py-6">
          <Result
            status="success"
            icon={
              <IconCheckCircleFill className="text-[48px] text-[rgb(var(--success-6))]" />
            }
            title={t['userCenter.gaSuccess.title']}
            subTitle={t['userCenter.gaSuccess.subTitle']}
            extra={
              <Button
                type="primary"
                className="!min-w-[100px] !rounded-lg"
                onClick={onDone}
              >
                {common['common.done']}
              </Button>
            }
          />
        </div>
      </Modal>
    </>
  );
}
