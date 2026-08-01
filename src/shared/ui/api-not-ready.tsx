import React from 'react';

import useLocale from '@shared/lib/useLocale';

import { EmptyState } from './empty-state';

export type ApiNotReadyProps = {
  className?: string;
};

/** 无对应 Admin OpenAPI 时的页面占位 */
export function ApiNotReady({ className }: ApiNotReadyProps) {
  const common = useLocale();

  return (
    <div
      className={
        className ||
        'flex min-h-[320px] flex-1 items-center justify-center bg-[var(--color-bg-2,#fff)]'
      }
    >
      <EmptyState description={common['common.apiNotReady']} />
    </div>
  );
}

export default ApiNotReady;
