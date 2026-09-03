import React from 'react';

import ChatIconRead from '@assets/icon/icon-chat-read.svg?react';
import redPacketEnvelope from '@assets/icon/icon-chat-red-packet.svg';
import useLocale from '@shared/lib/useLocale';

export type RedPacketMessageCardProps = {
  greeting?: string;
  kind?: 'lucky' | 'equal' | 'exclusive' | 'unknown';
  status?: 'claimed' | 'completed' | 'expired';
  recipientName?: string;
  coverUrl?: string;
  time?: string;
  isSelf: boolean;
  isGroup: boolean;
};

export default function RedPacketMessageCard({
  greeting,
  kind = 'unknown',
  status,
  recipientName,
  coverUrl,
  time,
  isSelf,
  isGroup
}: RedPacketMessageCardProps) {
  const t = useLocale();
  const fallbackGreeting = t['im.msg.redPacketGreeting'];
  const title =
    isGroup && kind === 'exclusive'
      ? recipientName
        ? t['im.msg.redPacketExclusiveFor'].replace('{name}', recipientName)
        : t['im.msg.redPacketExclusiveForYou']
      : greeting || fallbackGreeting;
  const subtitle = status
    ? t[`im.msg.redPacketStatus.${status}`]
    : isGroup && kind === 'exclusive'
      ? greeting || fallbackGreeting
      : '';
  const footerKind = isGroup
    ? kind === 'lucky'
      ? 'lucky'
      : kind === 'equal' || kind === 'exclusive'
        ? 'equal'
        : 'single'
    : 'single';
  const footer = t[`im.msg.redPacketType.${footerKind}`];
  const accessibleLabel = [title, subtitle, footer].filter(Boolean).join('，');

  return (
    <div
      className={`use-chat-red-packet-card${status ? ' is-inactive' : ''}`}
      aria-label={accessibleLabel}
    >
      {coverUrl ? (
        <>
          <img
            className="use-chat-red-packet-cover"
            src={coverUrl}
            alt=""
            aria-hidden
          />
          <span className="use-chat-red-packet-cover-overlay" aria-hidden />
        </>
      ) : null}
      <div className="use-chat-red-packet-main">
        <span className="use-chat-red-packet-icon">
          <img src={redPacketEnvelope} alt="" aria-hidden />
        </span>
        <span className="use-chat-red-packet-copy">
          <span className="use-chat-red-packet-title">{title}</span>
          {subtitle ? (
            <span className="use-chat-red-packet-subtitle">{subtitle}</span>
          ) : null}
        </span>
      </div>
      <div className="use-chat-red-packet-divider" />
      <div className="use-chat-red-packet-footer">
        <span>{footer}</span>
        {time ? (
          <span className="use-chat-red-packet-meta">
            {time}
            {isSelf ? (
              <ChatIconRead className="h-[6px] w-[11px] max-w-none" aria-hidden />
            ) : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}
