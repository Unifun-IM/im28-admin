import { IconRefresh } from '@arco-design/web-react/icon';

import type { CurrentUserStatus } from '@entities/current-user';
import { Button } from '@shared/ui';

interface RefreshCurrentUserButtonProps {
  status: CurrentUserStatus;
  onRefresh: () => void;
}

export function RefreshCurrentUserButton({
  status,
  onRefresh
}: RefreshCurrentUserButtonProps) {
  return (
    <Button
      icon={<IconRefresh />}
      loading={status === 'loading'}
      onClick={onRefresh}
      type="primary"
    >
      Refresh user
    </Button>
  );
}
