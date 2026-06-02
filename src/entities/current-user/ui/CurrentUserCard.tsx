import { Alert, Avatar, Card, Space, Spin, Typography } from '@shared/ui';

import type {
  CurrentUser,
  CurrentUserStatus
} from '../model/current-user.types';

interface CurrentUserCardProps {
  errorMessage: string | null;
  status: CurrentUserStatus;
  user: CurrentUser | null;
}

export function CurrentUserCard({
  errorMessage,
  status,
  user
}: CurrentUserCardProps) {
  if (status === 'loading') {
    return (
      <Card className="current-user-card">
        <Spin />
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="current-user-card">
        <Alert content={errorMessage ?? 'Unable to load current user'} type="error" />
      </Card>
    );
  }

  return (
    <Card className="current-user-card" title="Current user">
      <div className="current-user-summary">
        <Avatar>{user?.name.slice(0, 1) ?? 'A'}</Avatar>
        <Space direction="vertical" size={2}>
          <Typography.Text>{user?.name ?? 'No active user session'}</Typography.Text>
          <Typography.Text type="secondary">
            <span className={`status-dot is-${status}`} /> {user?.role ?? 'not loaded'}
          </Typography.Text>
        </Space>
      </div>
    </Card>
  );
}
