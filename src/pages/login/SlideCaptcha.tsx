import React, { useCallback, useEffect, useRef, useState } from 'react';
import cs from 'classnames';
import useLocale from '@shared/lib/useLocale';
import arrowIcon from './assets/icon-arrow.svg';
import checkIcon from './assets/icon-check.svg';

export type SlideCaptchaProps = {
  value?: boolean;
  onChange?: (verified: boolean) => void;
  className?: string;
};

/**
 * 滑块验证 — Figma 602:35197 / 602:35261
 * 轨道高 32、圆角 8；手柄 primary / success；文案居中
 */
export default function SlideCaptcha({
  value,
  onChange,
  className
}: SlideCaptchaProps) {
  const t = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [verified, setVerified] = useState(!!value);

  useEffect(() => {
    if (value == null) return;
    setVerified(value);
    if (!value) {
      offsetRef.current = 0;
      setOffset(0);
    }
  }, [value]);

  const maxOffset = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const handle = track.querySelector('[data-handle]') as HTMLElement | null;
    const handleW = handle?.offsetWidth ?? 46;
    return Math.max(0, track.clientWidth - handleW);
  }, []);

  const finish = useCallback(
    (next: boolean) => {
      setVerified(next);
      onChange?.(next);
      if (next) {
        const end = maxOffset();
        offsetRef.current = end;
        setOffset(end);
      } else {
        offsetRef.current = 0;
        setOffset(0);
      }
    },
    [maxOffset, onChange]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (verified) return;
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || verified) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const handle = track.querySelector('[data-handle]') as HTMLElement | null;
    const handleW = handle?.offsetWidth ?? 46;
    const x = e.clientX - rect.left - handleW / 2;
    const next = Math.min(Math.max(0, x), maxOffset());
    offsetRef.current = next;
    setOffset(next);
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const limit = maxOffset();
    if (offsetRef.current >= limit * 0.92) {
      finish(true);
    } else {
      offsetRef.current = 0;
      setOffset(0);
    }
  };

  return (
    <div
      ref={trackRef}
      className={cs(
        'use-login-slide relative box-border flex h-[32px] w-full select-none items-center overflow-hidden rounded-[8px] border border-solid border-[var(--color-border-2)]',
        verified
          ? 'is-verified bg-[rgb(var(--success-1,#f7fff9))]'
          : 'bg-[var(--color-fill-2,#f2f3f5)]',
        className
      )}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[14px] leading-[21px] text-arco-text-2">
        {verified ? t['login.slider.success'] : t['login.slider.tip']}
      </span>
      <div
        data-handle
        role="slider"
        aria-label={t['login.slider.aria']}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={verified ? 100 : Math.round((offset / Math.max(maxOffset(), 1)) * 100)}
        tabIndex={0}
        className={cs(
          'relative z-[1] flex h-[32px] cursor-grab items-center justify-center rounded-[8px] px-[16px] active:cursor-grabbing',
          verified ? 'ml-auto bg-[rgb(var(--success-6,#4db582))]' : 'bg-[rgb(var(--primary-6))]'
        )}
        style={verified ? undefined : { transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onKeyDown={(e) => {
          if (verified) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            finish(true);
          }
        }}
      >
        <img
          src={verified ? checkIcon : arrowIcon}
          alt=""
          className={cs('block size-[14px]', !verified && '-rotate-90')}
          draggable={false}
        />
      </div>
    </div>
  );
}
