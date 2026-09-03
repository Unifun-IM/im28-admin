import React, { useEffect, useState } from 'react';

import { BizDetailDrawer } from '@widgets/biz-detail-drawer';
import { postV1AdminAssetWithdrawalDetail } from '@shared/api/admin/assets';
import { CopyValue, RESPONSIVE_DETAIL_COLUMNS, StatusBadge } from '@shared/ui';
import { formatDateTime } from '@shared/lib/formatTime';
import useLocale from '@shared/lib/useLocale';

export type AssetWithdrawalDetailDrawerProps = {
  visible: boolean;
  withdrawalId: string | null;
  onClose: () => void;
};

const STATUS_TONE: Record<
  AdminAPI.AdminAssetWithdrawalOrder['status'],
  'success' | 'error' | 'warning' | 'default'
> = {
  pending_review: 'warning',
  processing: 'warning',
  succeeded: 'success',
  rejected: 'error',
  canceled: 'default',
  failed: 'error'
};

export default function AssetWithdrawalDetailDrawer({
  visible,
  withdrawalId,
  onClose
}: AssetWithdrawalDetailDrawerProps) {
  const t = useLocale();
  const [loading, setLoading] = useState(false);
  const [withdrawal, setWithdrawal] = useState<AdminAPI.AdminAssetWithdrawalOrder | null>(null);

  useEffect(() => {
    if (!visible || !withdrawalId) {
      setWithdrawal(null);
      return;
    }
    let active = true;
    setLoading(true);
    postV1AdminAssetWithdrawalDetail({ withdrawal_id: withdrawalId })
      .then((res) => {
        if (active) setWithdrawal(res.data?.withdrawal || null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [visible, withdrawalId]);

  return (
    <BizDetailDrawer
      visible={visible}
      title={t['asset.detail.withdrawalTitle']}
      loading={loading}
      onCancel={onClose}
      sections={
        withdrawal
          ? [
              {
                key: 'order',
                title: t['asset.detail.orderInfo'],
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  {
                    label: t['asset.col.withdrawalId'],
                    value: <CopyValue value={withdrawal.withdrawal_id} />
                  },
                  {
                    label: t['asset.col.status'],
                    value: (
                      <StatusBadge
                        status={STATUS_TONE[withdrawal.status]}
                        text={t[`asset.withdrawal.status.${withdrawal.status}`]}
                      />
                    )
                  },
                  { label: t['asset.col.userId'], value: <CopyValue value={withdrawal.user_id} /> },
                  { label: t['asset.col.walletId'], value: <CopyValue value={withdrawal.wallet_id} /> },
                  { label: t['asset.col.clientRequestId'], value: <CopyValue value={withdrawal.client_request_id} />, span: 2 },
                  { label: t['asset.col.createdAt'], value: formatDateTime(withdrawal.created_at) },
                  { label: t['asset.col.updatedAt'], value: formatDateTime(withdrawal.updated_at) }
                ]
              },
              {
                key: 'amount',
                title: t['asset.detail.amountInfo'],
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  { label: t['asset.col.currency'], value: withdrawal.currency_code },
                  { label: t['asset.col.amount'], value: withdrawal.amount },
                  { label: t['asset.col.feeAmount'], value: withdrawal.fee_amount },
                  { label: t['asset.col.actualAmount'], value: withdrawal.actual_amount }
                ]
              },
              {
                key: 'chain',
                title: t['asset.detail.chainInfo'],
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  { label: t['asset.col.network'], value: withdrawal.network_code },
                  { label: t['asset.col.memo'], value: withdrawal.memo },
                  { label: t['asset.col.address'], value: <CopyValue value={withdrawal.address} />, span: 2 },
                  { label: t['asset.col.txHash'], value: <CopyValue value={withdrawal.tx_hash} />, span: 2 }
                ]
              },
              {
                key: 'review',
                title: t['asset.detail.reviewInfo'],
                column: RESPONSIVE_DETAIL_COLUMNS,
                fields: [
                  { label: t['asset.col.operatorUserId'], value: <CopyValue value={withdrawal.operator_user_id} /> },
                  { label: t['asset.col.reviewedAt'], value: formatDateTime(withdrawal.reviewed_at) },
                  { label: t['asset.col.completedAt'], value: formatDateTime(withdrawal.completed_at) },
                  { label: t['asset.col.canceledAt'], value: formatDateTime(withdrawal.canceled_at) },
                  { label: t['asset.col.reviewReason'], value: withdrawal.review_reason, span: 2 },
                  { label: t['asset.col.failureReason'], value: withdrawal.failure_reason, span: 2 }
                ]
              }
            ]
          : []
      }
    />
  );
}
