import React from 'react';
import cs from 'classnames';

import emptyStateSvg from '@shared/assets/empty-state.svg';

export type EmptyStateProps = {
  /** 主文案，默认「暂无数据」 */
  description?: React.ReactNode;
  /** 次要说明 */
  secondary?: React.ReactNode;
  className?: string;
  /** 插画尺寸，默认跟稿面 133×100 */
  imageWidth?: number;
  imageHeight?: number;
};

/** 列表 / 页面空状态 — 统一 empty-state.svg */
export function EmptyState({
  description = '暂无数据',
  secondary,
  className,
  imageWidth = 133,
  imageHeight = 100
}: EmptyStateProps) {
  return (
    <div
      className={cs(
        'use-empty-state flex flex-col items-center justify-center py-3',
        className
      )}
    >
      <img
        alt=""
        src={emptyStateSvg}
        width={imageWidth}
        height={imageHeight}
        className="mb-0 block max-w-none"
        style={{ width: imageWidth, height: imageHeight }}
      />
      {description ? (
        <div className="text-[14px] leading-[21px] text-arco-text-1">
          {description}
        </div>
      ) : null}
      {secondary ? (
        <div className="text-[14px] leading-[21px] text-arco-text-3">
          {secondary}
        </div>
      ) : null}
    </div>
  );
}

export default EmptyState;
