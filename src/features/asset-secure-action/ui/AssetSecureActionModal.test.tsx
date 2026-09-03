import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  postV1AdminAssetDepositAddressReplace,
  postV1AdminAssetDepositAddressStatusUpdate,
  postV1AdminAssetWithdrawalReview
} from '@shared/api/admin/assets';
import { postV1AdminAuthSecurityVerify } from '@shared/api/admin/auth';
import { GlobalContext } from '@shared/lib/global-context';
import AssetSecureActionModal from './AssetSecureActionModal';

vi.mock('@features/ga-verify', () => ({
  GaVerifyModal: ({
    visible,
    onOk
  }: {
    visible: boolean;
    onOk: (code: string) => void;
  }) =>
    visible ? (
      <button type="button" onClick={() => onOk('123456')}>
        submit ga
      </button>
    ) : null
}));

vi.mock('@shared/api/admin/auth', () => ({
  postV1AdminAuthSecurityVerify: vi.fn(() =>
    Promise.resolve({ data: { security_token: 'security-token' } })
  )
}));

vi.mock('@shared/api/admin/assets', () => ({
  postV1AdminAssetDepositAddressReplace: vi.fn(() => Promise.resolve({})),
  postV1AdminAssetDepositAddressStatusUpdate: vi.fn(() => Promise.resolve({})),
  postV1AdminAssetWithdrawalReview: vi.fn(() => Promise.resolve({}))
}));

const withdrawal: AdminAPI.AdminAssetWithdrawalOrder = {
  withdrawal_id: '000000000200000000000001',
  wallet_id: 'wallet-1',
  user_id: 'user-1',
  currency_code: 'USDT',
  network_code: 'TRC20',
  address: 'TAddress',
  memo: '',
  amount: '10.00',
  fee_amount: '1.00',
  actual_amount: '9.00',
  status: 'pending_review',
  tx_hash: '',
  review_reason: '',
  failure_reason: '',
  reviewed_at: '',
  completed_at: '',
  canceled_at: '',
  created_at: '2026-09-03T00:00:00Z',
  updated_at: '2026-09-03T00:00:00Z',
  operator_user_id: '',
  client_request_id: 'request-1'
};

describe('AssetSecureActionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifies the operation and immediately passes its one-time token to review', async () => {
    const onSuccess = vi.fn();
    render(
      <GlobalContext.Provider value={{ lang: 'zh-CN' }}>
        <AssetSecureActionModal
          target={{ mode: 'reviewWithdrawal', withdrawal }}
          onCancel={() => undefined}
          onSuccess={onSuccess}
        />
      </GlobalContext.Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: '审核' }));
    fireEvent.click(await screen.findByRole('button', { name: 'submit ga' }));

    await waitFor(() =>
      expect(postV1AdminAuthSecurityVerify).toHaveBeenCalledWith({
        operation: 'asset_withdrawal_review',
        two_factor_code: '123456'
      })
    );
    expect(postV1AdminAssetWithdrawalReview).toHaveBeenCalledWith({
      withdrawal_id: withdrawal.withdrawal_id,
      action: 'approve',
      reason: undefined,
      security_token: 'security-token'
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(postV1AdminAssetDepositAddressReplace).not.toHaveBeenCalled();
    expect(postV1AdminAssetDepositAddressStatusUpdate).not.toHaveBeenCalled();
  });
});
