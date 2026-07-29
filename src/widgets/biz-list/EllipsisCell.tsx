import React, { useEffect, useRef, useState } from 'react';
import { Tooltip } from '@arco-design/web-react';

export type EllipsisCellProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * 单行省略；仅在实际溢出时 Hover 展示 Tooltip（Figma 602:34993）
 */
export default function EllipsisCell({ children, className }: EllipsisCellProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      setOverflow(el.scrollWidth > el.clientWidth + 1);
    };

    check();
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(check) : null;
    ro?.observe(el);
    window.addEventListener('resize', check);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', check);
    };
  }, [children]);

  const text = (
    <span
      ref={ref}
      className={
        className ||
        'block min-w-0 overflow-hidden text-ellipsis whitespace-nowrap'
      }
    >
      {children}
    </span>
  );

  if (!overflow) return text;

  return (
    <Tooltip content={children} position="top">
      {text}
    </Tooltip>
  );
}
