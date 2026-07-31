import React from 'react';
import { Trigger } from '@arco-design/web-react';
import { ApiNotReady } from '@shared/ui';
import './message-box.less';

function DropContent() {
  return (
    <div className="flex max-h-[520px] w-96 flex-col overflow-hidden rounded-xl bg-arco-bg-popup shadow-popover">
      <ApiNotReady className="min-h-[200px]" />
    </div>
  );
}

function MessageBox({
  children,
  onVisibleChange
}: {
  children: React.ReactNode;
  onVisibleChange?: (visible: boolean) => void;
}) {
  return (
    <Trigger
      trigger="click"
      popup={() => <DropContent />}
      position="br"
      unmountOnExit={false}
      popupAlign={{ bottom: 4 }}
      onVisibleChange={onVisibleChange}
    >
      {children}
    </Trigger>
  );
}

export default MessageBox;
