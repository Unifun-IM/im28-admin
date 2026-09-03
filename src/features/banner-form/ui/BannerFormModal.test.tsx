import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  postV1AdminBannersCreate,
  postV1AdminBannersUpdate
} from '@shared/api/admin/platform';
import { GlobalContext } from '@shared/lib/global-context';
import BannerFormModal from './BannerFormModal';

vi.mock('@shared/api/admin/platform', () => ({
  postV1AdminBannersCreate: vi.fn(() => Promise.resolve({})),
  postV1AdminBannersUpdate: vi.fn(() => Promise.resolve({}))
}));

vi.mock('@shared/lib/uploadAdminImage', () => ({
  ADMIN_IMAGE_ACCEPT: '.jpg,.jpeg,.png,.webp',
  uploadAdminImage: vi.fn(),
  validateAdminImage: vi.fn(() => null)
}));

function renderForm(banner?: AdminAPI.Banner) {
  render(
    <GlobalContext.Provider value={{ lang: 'zh-CN' }}>
      <BannerFormModal
        visible
        banner={banner}
        onCancel={() => undefined}
        onSuccess={() => undefined}
      />
    </GlobalContext.Provider>
  );
}

function setImageUrl(value: string) {
  const item = screen.getByText('图片地址').closest('.arco-form-item');
  const input = item?.querySelector<HTMLInputElement>('input');
  expect(input).toBeTruthy();
  fireEvent.change(input!, { target: { value } });
}

describe('BannerFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the generated create contract with form defaults', async () => {
    renderForm();
    setImageUrl('https://example.com/banner.png');
    fireEvent.click(screen.getByRole('button', { name: '确定' }));

    await waitFor(() =>
      expect(postV1AdminBannersCreate).toHaveBeenCalledWith({
        type: 'asset_profile',
        platforms: ['app', 'pc', 'h5'],
        language: 'all',
        image_url: 'https://example.com/banner.png',
        title: '',
        action_type: 'none',
        action_value: '',
        sort: 0,
        is_enable: true,
        starts_at: undefined,
        ends_at: undefined
      })
    );
    expect(postV1AdminBannersUpdate).not.toHaveBeenCalled();
  });

  it('rejects an image URL outside the generated HTTP(S) contract', async () => {
    renderForm();
    setImageUrl('ftp://example.com/banner.png');
    fireEvent.click(screen.getByRole('button', { name: '确定' }));

    expect(
      await screen.findByText('请输入 HTTP 或 HTTPS 图片地址')
    ).toBeInTheDocument();
    expect(postV1AdminBannersCreate).not.toHaveBeenCalled();
  });

  it('uses the internal id and clearable time fields for updates', async () => {
    const banner: AdminAPI.Banner = {
      id: '12',
      banner_id: 'banner-12',
      type: 'asset_ledger_detail',
      platforms: ['pc'],
      language: 'en-US',
      image_url: 'https://example.com/original.png',
      title: 'Original',
      action_type: 'none',
      action_value: '',
      sort: 3,
      is_enable: false,
      starts_at: '',
      ends_at: '',
      created_at: '2026-09-03T00:00:00Z',
      updated_at: '2026-09-03T00:00:00Z'
    };
    renderForm(banner);
    setImageUrl('https://example.com/updated.png');
    fireEvent.click(screen.getByRole('button', { name: '确定' }));

    await waitFor(() =>
      expect(postV1AdminBannersUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '12',
          image_url: 'https://example.com/updated.png',
          starts_at: '',
          ends_at: ''
        })
      )
    );
    expect(postV1AdminBannersCreate).not.toHaveBeenCalled();
  });
});
