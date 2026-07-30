import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/** 测量元素内容区高度，供 Arco List virtualListProps.height 使用 */
export default function useElementHeight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [height, setHeight] = useState(0);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setHeight(Math.max(0, Math.floor(el.clientHeight)));
  }, []);

  useLayoutEffect(() => {
    measure();
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  return { ref, height };
}
