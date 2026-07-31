import React from 'react';

import { EmptyState } from './empty-state';

export type ApiNotReadyProps = {
  className?: string;
};

/** 无对应 Admin OpenAPI 时的页面占位 */
export function ApiNotReady({ className }: ApiNotReadyProps) {
  return (
    <div
      className={
        className ||
        'flex min-h-[320px] flex-1 items-center justify-center bg-[var(--color-bg-2,#fff)]'
      }
    >
      <EmptyState description="接口未就绪" />
    </div>
  );
}

export default ApiNotReady;
