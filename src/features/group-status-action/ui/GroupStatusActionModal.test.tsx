import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  postV1AdminGroupsBan,
  postV1AdminGroupsMute
} from '@shared/api/admin/groups';
import { GlobalContext } from '@shared/lib/global-context';
import GroupStatusActionModal, {
  GroupStatusActionMode
} from './GroupStatusActionModal';

vi.mock('@shared/api/admin/groups', () => ({
  postV1AdminGroupsBan: vi.fn(() => Promise.resolve({})),
  postV1AdminGroupsMute: vi.fn(() => Promise.resolve({}))
}));

const group: AdminAPI.Group = {
  group_id: 'group-1',
  title: '测试群聊',
  mute_all: false,
  status: 0
};

function renderModal(mode: GroupStatusActionMode) {
  const onCancel = vi.fn();
  const onSuccess = vi.fn();
  render(
    <GlobalContext.Provider
      value={{
        lang: 'zh-CN',
        setLang: () => undefined,
        theme: 'light',
        setTheme: () => undefined
      }}
    >
      <GroupStatusActionModal
        visible
        mode={mode}
        group={group}
        onCancel={onCancel}
        onSuccess={onSuccess}
      />
    </GlobalContext.Provider>
  );
  return { onCancel, onSuccess };
}

function openSelect(placeholder: string) {
  const select = screen
    .getAllByText(placeholder)[0]
    .closest('.arco-select-view');
  expect(select).toBeTruthy();
  fireEvent.click(select!);
}

describe('GroupStatusActionModal', () => {
  beforeEach(() => {
    vi.mocked(postV1AdminGroupsBan).mockClear();
    vi.mocked(postV1AdminGroupsMute).mockClear();
  });

  it('validates the Figma mute form and uses the generated mute contract', async () => {
    const { onCancel, onSuccess } = renderModal('mute');

    expect(screen.getByText('群聊禁言')).toBeInTheDocument();
    expect(screen.getByText('全体成员')).toBeInTheDocument();
    expect(screen.getByText('普通成员').closest('label')).toHaveClass(
      'arco-radio-disabled'
    );

    fireEvent.click(screen.getByRole('button', { name: '确认禁言' }));
    expect(await screen.findByText('请选择操作原因')).toBeInTheDocument();
    expect(postV1AdminGroupsMute).not.toHaveBeenCalled();

    openSelect('选择操作原因');
    fireEvent.click(await screen.findByText('违规内容'));
    fireEvent.click(screen.getByRole('button', { name: '确认禁言' }));

    await waitFor(() =>
      expect(postV1AdminGroupsMute).toHaveBeenCalledWith({
        group_id: 'group-1',
        enabled: true
      })
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders and submits the unmute confirmation', async () => {
    const { onCancel, onSuccess } = renderModal('unmute');

    expect(screen.getByText('解除群聊禁言')).toBeInTheDocument();
    expect(document.querySelector('.use-group-status-reason')).toHaveTextContent(
      '禁言原因：--'
    );
    expect(
      screen.getByText(/群成员将立即恢复发送消息的权限/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '解除禁言' }));

    await waitFor(() =>
      expect(postV1AdminGroupsMute).toHaveBeenCalledWith({
        group_id: 'group-1',
        enabled: false
      })
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('validates reason and duration before banning a group', async () => {
    const { onCancel, onSuccess } = renderModal('ban');

    expect(screen.getByText('封禁群聊')).toBeInTheDocument();
    expect(screen.getByText('封禁时长')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '确认封禁' }));
    expect(await screen.findByText('请选择操作原因')).toBeInTheDocument();
    expect(screen.getByText('请选择封禁时长')).toBeInTheDocument();
    expect(postV1AdminGroupsBan).not.toHaveBeenCalled();

    openSelect('选择操作原因');
    fireEvent.click(await screen.findByText('违规内容'));
    openSelect('选择封禁时长');
    fireEvent.click(await screen.findByText('永久封禁'));
    fireEvent.click(screen.getByRole('button', { name: '确认封禁' }));

    await waitFor(() =>
      expect(postV1AdminGroupsBan).toHaveBeenCalledWith({
        group_id: 'group-1',
        enabled: true
      })
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders and submits the unban confirmation', async () => {
    const { onCancel, onSuccess } = renderModal('unban');

    expect(screen.getByText('解除群聊封禁')).toBeInTheDocument();
    expect(document.querySelector('.use-group-status-reason')).toHaveTextContent(
      '封禁原因：--'
    );
    expect(screen.getByText(/该群将立即恢复正常使用/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '解除封禁' }));

    await waitFor(() =>
      expect(postV1AdminGroupsBan).toHaveBeenCalledWith({
        group_id: 'group-1',
        enabled: false
      })
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
