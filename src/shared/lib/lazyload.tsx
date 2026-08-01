import React from 'react';
import loadable from '@loadable/component';
import { Spin } from '@arco-design/web-react';

function LoadingComponent() {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        minHeight: 200,
        width: '100%'
      }}
    >
      <Spin />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function lazyload(loader: any) {
  const Component = loadable(loader, {
    fallback: <LoadingComponent />
  }) as any;
  Component.preload = loader;
  return Component;
}
