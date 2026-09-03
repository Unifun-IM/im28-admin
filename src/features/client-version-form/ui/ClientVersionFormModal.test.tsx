import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  postV1AdminClientVersionsCreate,
  postV1AdminClientVersionsUpdate
} from '@shared/api/admin/platform';
import { GlobalContext } from '@shared/lib/global-context';
import ClientVersionFormModal from './ClientVersionFormModal';

vi.mock('@shared/api/admin/platform', () => ({
  postV1AdminClientVersionsCreate: vi.fn(() => Promise.resolve({})),
  postV1AdminClientVersionsUpdate: vi.fn(() => Promise.resolve({}))
}));

function renderForm(clientVersion?: AdminAPI.ClientVersion) {
  render(
    <GlobalContext.Provider value={{ lang: 'zh-CN' }}>
      <ClientVersionFormModal
        visible
        clientVersion={clientVersion}
        onCancel={() => undefined}
        onSuccess={() => undefined}
      />
    </GlobalContext.Provider>
  );
}

function setField(label: string, value: string) {
  const item = screen.getByText(label).closest('.arco-form-item');
  const input = item?.querySelector<HTMLInputElement>('input, textarea');
  expect(input).toBeTruthy();
  fireEvent.change(input!, { target: { value } });
}

describe('ClientVersionFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the generated create contract with defaults', async () => {
    renderForm();
    setField('客户端平台', 'ios');
    setField('版本号', '1.2.0');
    setField('构建号', '120');
    fireEvent.click(screen.getByRole('button', { name: '确定' }));

    await waitFor(() =>
      expect(postV1AdminClientVersionsCreate).toHaveBeenCalledWith({
        platform: 'ios',
        version: '1.2.0',
        build_number: '120',
        force_update: false,
        download_url: undefined,
        title: undefined,
        description: undefined,
        is_enable: true
      })
    );
    expect(postV1AdminClientVersionsUpdate).not.toHaveBeenCalled();
  });

  it('uses the internal id and sends clearable fields on update', async () => {
    renderForm({
      id: '7',
      platform: 'android',
      version: '2.0.0',
      build_number: '200',
      download_url: 'https://example.com/app.apk',
      title: 'Upgrade',
      description: 'Notes',
      force_update: true,
      is_enable: true
    });
    setField('下载地址', '');
    setField('提示标题', '');
    setField('版本说明', '');
    fireEvent.click(screen.getByRole('button', { name: '确定' }));

    await waitFor(() =>
      expect(postV1AdminClientVersionsUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '7',
          download_url: '',
          title: '',
          description: ''
        })
      )
    );
    expect(postV1AdminClientVersionsCreate).not.toHaveBeenCalled();
  });
});
