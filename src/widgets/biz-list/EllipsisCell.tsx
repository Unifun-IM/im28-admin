import React, { useRef, useState } from 'react';
import { Tooltip } from '@arco-design/web-react';

export type EllipsisCellProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * 单行省略；仅在实际溢出时 Hover 展示 Tooltip（Figma 602:34993 / 602:34994）
 */
export default function EllipsisCell({ children, className }: EllipsisCellProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  return (
    <Tooltip
      content={
        <span className="text-[12px] leading-[20px] text-white">{children}</span>
      }
      position="bottom"
      color="#1d2129"
      className="use-biz-table-tooltip"
      popupVisible={visible}
      onVisibleChange={(next) => {
        if (!next) {
          setVisible(false);
          return;
        }
        const el = ref.current;
        setVisible(!!el && el.scrollWidth - el.clientWidth > 1);
      }}
    >
      <span
        ref={ref}
        className={
          className ||
          'block min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-[12px] text-arco-text-1'
        }
      >
        {children}
      </span>
    </Tooltip>
  );
}
