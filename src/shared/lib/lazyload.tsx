import loadable from '@loadable/component';
import { Spin } from '@arco-design/web-react';
import type React from 'react';

type PageModule = {
  default: React.ComponentType<Record<string, never>>;
};

export default function lazyload(loader: () => Promise<unknown>) {
  return loadable(loader as () => Promise<PageModule>, {
    fallback: (
      <div className="flex min-h-[200px] size-full items-center justify-center">
        <Spin />
      </div>
    )
  });
}
