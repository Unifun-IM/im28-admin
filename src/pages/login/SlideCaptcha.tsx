import React, { useCallback, useEffect, useRef, useState } from 'react';
import cs from 'classnames';
import useLocale from '@shared/lib/useLocale';
import arrowIcon from './assets/icon-arrow.svg';
import checkIcon from './assets/icon-check.svg';
import './login.less';

export type SlideCaptchaProps = {
  value?: boolean;
  onChange?: (verified: boolean) => void;
  className?: string;
};

/**
 * 滑块验证 — Figma 602:35197 / 成功态 602:35319
 */
export default function SlideCaptcha({
  value,
  onChange,
  className
}: SlideCaptchaProps) {
  const t = useLocale();
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);
  const [verified, setVerified] = useState(!!value);
  const [dragging, setDragging] = useState(false);
  const [justVerified, setJustVerified] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const sync = () => setTrackWidth(el.clientWidth);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (value == null) return;
    setVerified(value);
    if (!value) {
      offsetRef.current = 0;
      setOffset(0);
      setJustVerified(false);
    }
  }, [value]);

  const maxOffset = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const handle = track.querySelector('[data-handle]') as HTMLElement | null;
    const handleW = handle?.offsetWidth ?? 46;
    return Math.max(0, track.clientWidth - handleW);
  }, []);

  const handleWidth = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 46;
    const handle = track.querySelector('[data-handle]') as HTMLElement | null;
    return handle?.offsetWidth ?? 46;
  }, []);

  const finish = useCallback(
    (next: boolean) => {
      setVerified(next);
      onChange?.(next);
      if (next) {
        const end = maxOffset();
        offsetRef.current = end;
        setOffset(end);
        setJustVerified(true);
      } else {
        offsetRef.current = 0;
        setOffset(0);
        setJustVerified(false);
      }
    },
    [maxOffset, onChange]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (verified) return;
    draggingRef.current = true;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || verified) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const handleW = handleWidth();
    const x = e.clientX - rect.left - handleW / 2;
    const next = Math.min(Math.max(0, x), maxOffset());
    offsetRef.current = next;
    setOffset(next);
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    const limit = maxOffset();
    if (offsetRef.current >= limit * 0.92) {
      finish(true);
    } else {
      offsetRef.current = 0;
      setOffset(0);
    }
  };

  const limit = Math.max(maxOffset(), 1);
  const progress = verified ? 1 : Math.min(1, offset / limit);
  const fillWidth = verified
    ? '100%'
    : `${Math.max(0, offset + handleWidth() * 0.5)}px`;
  /** 拖动中底色随进度变实：约 0.35 → 0.85 */
  const fillOpacity = verified ? 1 : 0.35 + progress * 0.5;
  /** Art：扫光位移用半宽 */
  const shimmerHalf = Math.floor((trackWidth || 260) / 2);

  return (
    <div
      ref={trackRef}
      className={cs(
        'use-login-slide',
        verified && 'is-verified',
        dragging && 'is-dragging',
        justVerified && 'is-just-verified',
        className
      )}
      style={
        {
          ['--slide-shimmer-w' as string]: `${shimmerHalf}px`,
          ['--slide-shimmer-pw' as string]: `${-shimmerHalf}px`
        } as React.CSSProperties
      }
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="use-login-slide__fill"
        style={{ width: fillWidth, opacity: fillOpacity }}
        aria-hidden
      />
      <span
        className={cs(
          'use-login-slide__tip',
          verified ? 'is-success' : 'is-shimmer'
        )}
      >
        {verified ? t['login.slider.success'] : t['login.slider.tip']}
      </span>
      <div
        data-handle
        role="slider"
        aria-label={t['login.slider.aria']}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={verified ? 100 : Math.round(progress * 100)}
        tabIndex={0}
        className={cs(
          'use-login-slide__handle',
          verified && 'is-verified',
          dragging && 'is-dragging'
        )}
        style={
          verified
            ? undefined
            : {
                transform: dragging
                  ? `translateX(${offset}px) scale(1.04)`
                  : `translateX(${offset}px)`
              }
        }
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
          className={cs(
            'use-login-slide__icon',
            verified ? 'is-check' : 'is-arrow'
          )}
          draggable={false}
        />
      </div>
    </div>
  );
}
