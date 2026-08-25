import React from 'react';
import { IconRight } from '@arco-design/web-react/icon';

export type DetailLinkRowProps = {
  children: React.ReactNode;
  onClick?: () => void;
  /** 右侧箭头，默认 true（整行可点样式） */
  showArrow?: boolean;
  className?: string;
};

/**
 * 详情 Descriptions 内可点击链接行（如好友数 / 群数跳转）
 */
export function DetailLinkRow({
  children,
  onClick,
  showArrow = true,
  className
}: DetailLinkRowProps) {
  if (!showArrow) {
    return (
      <button
        type="button"
        className={`cursor-pointer border-0 bg-transparent p-0 text-[14px] leading-[21px] text-[rgb(var(--link-6))] ${
          className || ''
        }`.trim()}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`inline-flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left ${
        className || ''
      }`.trim()}
      onClick={onClick}
    >
      <span className="text-[14px] leading-[21px] text-[rgb(var(--link-6))]">
        {children}
      </span>
      <IconRight className="text-[14px] text-arco-text-3" />
    </button>
  );
}

export default DetailLinkRow;
