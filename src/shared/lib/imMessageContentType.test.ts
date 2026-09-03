import {
  MessageContentType,
  isKnownUserContentMessageType,
  mapMessageContentTypeToUi,
  parseImMessageBody
} from './imMessageContentType';
import { resolveImLocale } from './imLabels';

describe('Admin message content protocol', () => {
  it('maps the generated transfer and red packet message types', () => {
    expect(MessageContentType.Transfer).toBe(116);
    expect(MessageContentType.RedPacket).toBe(117);
    expect(isKnownUserContentMessageType(116)).toBe(true);
    expect(isKnownUserContentMessageType(117)).toBe(true);
  });

  it('uses protocol body text when present and a localized safe fallback otherwise', () => {
    expect(
      parseImMessageBody(
        116,
        { transfer: { remark: 'Dinner' } },
        { locale: resolveImLocale('en-US') }
      )
    ).toMatchObject({ content: 'Dinner' });
  });

  it('maps Gateway red packets to the desktop-compatible card fields', () => {
    expect(mapMessageContentTypeToUi(117)).toBe('red-packet');
    expect(
      parseImMessageBody(
        117,
        {
          red_packet: {
            packet_id: 'packet-1',
            type: 'lucky',
            greeting: '好运连连',
            presentation_status: 'depleted',
            cover_url: 'https://example.com/cover.png'
          }
        },
        { locale: resolveImLocale('zh-CN') }
      )
    ).toMatchObject({
      content: '好运连连',
      redPacketGreeting: '好运连连',
      redPacketKind: 'lucky',
      redPacketStatus: 'completed',
      redPacketCoverUrl: 'https://example.com/cover.png'
    });
  });

  it('parses compatible custom exclusive red packet payloads', () => {
    expect(
      parseImMessageBody(
        117,
        {
          custom: {
            key: 'im28.asset.red-packet',
            data: JSON.stringify({
              type: 'im28.asset.red-packet',
              kind: 'exclusive',
              greeting: '专属祝福',
              recipientUserID: 'u2'
            })
          }
        },
        {
          locale: resolveImLocale('zh-CN'),
          resolveUserName: (id) => (id === 'u2' ? '小明' : undefined)
        }
      )
    ).toMatchObject({
      redPacketKind: 'exclusive',
      redPacketGreeting: '专属祝福',
      redPacketRecipientName: '小明'
    });
  });
});
