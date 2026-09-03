import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  postV1AdminTermsCreate,
  postV1AdminTermsUpdate
} from '@shared/api/admin/platform';
import { GlobalContext } from '@shared/lib/global-context';
import PlatformTermFormModal from './PlatformTermFormModal';

vi.mock('@shared/api/admin/platform', () => ({
  postV1AdminTermsCreate: vi.fn(() => Promise.resolve({})),
  postV1AdminTermsUpdate: vi.fn(() => Promise.resolve({}))
}));

function renderForm(term?: AdminAPI.PlatformTerm) {
  render(
    <GlobalContext.Provider value={{ lang: 'zh-CN' }}>
      <PlatformTermFormModal
        visible
        term={term}
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

describe('PlatformTermFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the generated create contract', async () => {
    renderForm();
    setField('业务键', 'privacy_policy');
    setField('版本号', '2026.09');
    setField('标题', '隐私政策');
    setField('条款正文', '条款内容');
    fireEvent.click(screen.getByRole('button', { name: '确定' }));

    await waitFor(() =>
      expect(postV1AdminTermsCreate).toHaveBeenCalledWith({
        key: 'privacy_policy',
        title: '隐私政策',
        content: '条款内容',
        version: '2026.09',
        is_enable: true
      })
    );
    expect(postV1AdminTermsUpdate).not.toHaveBeenCalled();
  });

  it('omits the immutable business key on update', async () => {
    renderForm({
      id: '9',
      key: 'privacy_policy',
      title: '隐私政策',
      content: '旧内容',
      version: '1.0',
      is_enable: true
    });
    setField('标题', '隐私政策更新');
    fireEvent.click(screen.getByRole('button', { name: '确定' }));

    await waitFor(() =>
      expect(postV1AdminTermsUpdate).toHaveBeenCalledWith({
        id: '9',
        title: '隐私政策更新',
        content: '旧内容',
        version: '1.0',
        is_enable: true
      })
    );
    expect(postV1AdminTermsUpdate).toHaveBeenCalledWith(
      expect.not.objectContaining({ key: expect.anything() })
    );
    expect(postV1AdminTermsCreate).not.toHaveBeenCalled();
  });
});
