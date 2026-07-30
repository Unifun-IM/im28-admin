import Mock from 'mockjs';
import qs from 'query-string';
import setupMock from '@shared/lib/setupMock';
import { USER_ACTION_PAIRS } from '@shared/config/user-action-types';

function parseQuery(url: string) {
  const q = url.split('?')[1] || '';
  return qs.parse(q) as Record<string, string>;
}

function pageList(
  total: number,
  page = 1,
  pageSize = 10,
  item: () => Record<string, unknown>
) {
  const p = Number(page) || 1;
  const size = Number(pageSize) || 10;
  const list = Array.from({ length: Math.min(size, Math.max(0, total - (p - 1) * size)) }, () =>
    item()
  );
  return { list, total };
}

setupMock({
  setup: () => {
    Mock.mock(new RegExp('/api/biz/user/list'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      const data = pageList(128, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          userId: /1[0-9]{7}/,
          nickname: '@cname',
          account: '@word(6,10)',
          phone: /1[3-9]\d{9}/,
          email: '@email',
          status: '@pick(["正常","黑名单","注销"])',
          online: '@pick(["在线","离线"])',
          inviteCode: /[A-Z0-9]{5}/,
          inviterName: '@cname',
          registerTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
          lastActiveTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
        })
      );
      return {
        ...data,
        summary: { total: 128, online: 36, blacklist: 8, cancelled: 3 }
      };
    });

    Mock.mock(new RegExp('/api/biz/user/detail/'), () =>
      Mock.mock({
        id: '@id',
        userId: /1[0-9]{7}/,
        nickname: '@cname',
        account: '@word(6,10)',
        avatar: 'https://lf1-xgcdn-tos.pstatp.com/obj/vcloud/vadmin/start.8e0e4855ee346a46ccff8ff3e24db27b.png',
        phone: /1[3-9]\d{9}/,
        email: '@email',
        status: '正常',
        online: '在线',
        inviteCode: /[A-Z0-9]{5}/,
        inviterId: /1[0-9]{7}/,
        registerTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        lastLoginTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        lastActiveTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        friendCount: '@integer(0,200)',
        groupCount: '@integer(0,40)',
        devices: [
          {
            id: '1',
            name: 'iPhone 15',
            platform: 'iOS',
            lastLogin: '@datetime("yyyy-MM-dd HH:mm:ss")',
            ip: '@ip',
            region: '上海'
          },
          {
            id: '2',
            name: 'Chrome',
            platform: 'Web',
            lastLogin: '@datetime("yyyy-MM-dd HH:mm:ss")',
            ip: '@ip',
            region: '北京'
          }
        ],
        logs: {
          list: [
            {
              id: '1',
              time: '2026-05-25 10:15:32',
              action: '聊天',
              detail: '操作人 @alice · 钱包签名'
            },
            {
              id: '2',
              time: '2026-05-25 10:15:32',
              action: '修改昵称',
              detail: '平台 TG 账号 @tg***01'
            },
            {
              id: '3',
              time: '2026-05-25 10:15:32',
              action: '发红包',
              detail: '100 USDT · 收款 USDT · 代理 10%'
            },
            {
              id: '4',
              time: '2026-05-25 10:15:32',
              action: '聊天',
              detail: '审核人 @operator01'
            },
            {
              id: '5',
              time: '2026-05-25 10:15:32',
              action: '登录',
              detail: '商品 ID SP100028'
            }
          ]
        }
      })
    );

    Mock.mock(new RegExp('/api/biz/user/logs'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(56, Number(q.page), Number(q.pageSize), () => {
        const actionPair =
          USER_ACTION_PAIRS[
            Mock.Random.integer(0, USER_ACTION_PAIRS.length - 1)
          ];
        const client = Mock.mock(
          '@pick(["iOS","Android","Web","PC"])'
        ) as string;
        return Mock.mock({
          id: '@id',
          logId: /1[0-9]{12}/,
          userId: /1[0-9]{7}/,
          nickname: '@cname',
          avatar: '',
          action: actionPair[0],
          actionCategory: actionPair[1],
          actionStatus: '@pick(["成功","成功","成功","失败"])',
          version: `${client === 'Android' ? '安卓' : client === 'iOS' ? 'IOS' : client === 'Web' ? 'WEB' : 'PC'} v1.0`,
          clientOs: '@pick(["Android 15","iOS 18.1","Windows 11","macOS 15","Chrome 131"])',
          clientDevice:
            '@pick(["Xiaomi 14 Pro","iPhone 16","MacBook Pro","Pixel 9","--"])',
          ip: '@ip',
          region: '@pick(["日本·东京","中国·上海","中国·北京","美国·加州","新加坡"])',
          remark: '@pick(["--","用户主动操作","系统自动记录"])',
          operateTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
        });
      });
    });

    Mock.mock(new RegExp('/api/biz/user/blacklist/action'), () => ({ ok: true }));
    Mock.mock(new RegExp('/api/biz/user/whitelist/action'), () => ({ ok: true }));

    Mock.mock(new RegExp('/api/biz/user/blacklist(\\?|$)'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(300, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          userId: /1[0-9]{7}/,
          nickname: '@cname',
          avatar: '',
          phone: /1[3-9]\d{9}/,
          email: '@email',
          account: '@word(6,12)',
          operator: '@pick(["Admin-sp","admin","运营小王"])',
          operateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
          operateType:
            '@pick(["批量添加用户","骚扰用户","用户举报核实","xxx"])',
          reason:
            '@pick(["用户举报核实","频繁骚扰其他用户","传播恶意文件或链接","--"])',
          remark: '@pick(["--","已核实","待复核"])'
        })
      );
    });

    Mock.mock(new RegExp('/api/biz/user/whitelist(\\?|$)'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(300, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          userId: /1[0-9]{7}/,
          nickname: '@cname',
          avatar: '',
          phone: /1[3-9]\d{9}/,
          email: '@email',
          account: '@word(6,12)',
          operator: '@pick(["Admin-sp","admin","运营小王"])',
          operateTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
          reason: '@pick(["测试账号","内部员工","VIP用户","合作方","--"])',
          remark: '@pick(["--","已核实","长期豁免"])'
        })
      );
    });

    Mock.mock(new RegExp('/api/biz/user/invite-codes'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(40, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          inviteCode: /[A-Z0-9]{5}/,
          ownerId: /1[0-9]{7}/,
          ownerName: '@cname',
          usedCount: '@integer(0,20)',
          maxCount: '@integer(20,100)',
          expireAt: '@datetime("yyyy-MM-dd HH:mm:ss")',
          status: '@pick(["有效","过期","已用尽"])'
        })
      );
    });

    Mock.mock(new RegExp('/api/biz/user/hierarchy'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      const targetId = String(q.userId || '11223345');
      if (!targetId.trim()) {
        return { tree: null };
      }
      const mkChild = (
        nickname: string,
        userId: string,
        inviteCode: string,
        children?: Record<string, unknown>[]
      ) => ({
        key: userId,
        userId,
        nickname,
        avatar: '',
        inviteCode,
        childCount: children?.length || 0,
        role: 'child',
        children
      });
      return {
        tree: {
          key: 'parent-99001122',
          userId: '99001122',
          nickname: '躺平小王子',
          avatar: '',
          inviteCode: 'A1B2C',
          childCount: 12,
          role: 'parent',
          children: [
            {
              key: targetId,
              userId: targetId,
              nickname: 'SoulKeeper_',
              avatar: '',
              inviteCode: 'X9Y8Z',
              childCount: 5,
              role: 'target',
              children: [
                mkChild('小明', '10000001', 'M1001', [
                  mkChild('小花', '10000011', 'H1011'),
                  mkChild('小草', '10000012', 'C1012')
                ]),
                mkChild('小红', '10000002', 'R1002', [
                  mkChild('小叶', '10000021', 'Y1021')
                ]),
                mkChild('小刚', '10000003', 'G1003'),
                mkChild('小丽', '10000004', 'L1004'),
                mkChild('小强', '10000005', 'Q1005')
              ]
            }
          ]
        }
      };
    });

    Mock.mock(new RegExp('/api/biz/system/accounts'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(166, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          account: '@word(5,10)',
          name: '@cname',
          role: '@pick(["超级管理员","运营","客服","财务"])',
          status: '@pick(["启用","停用"])',
          lastLogin: '@datetime("yyyy-MM-dd HH:mm:ss")',
          createdAt: '@datetime("yyyy-MM-dd HH:mm:ss")'
        })
      );
    });

    Mock.mock(new RegExp('/api/biz/system/roles'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(12, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          name: '@pick(["超级管理员","运营","客服","财务","审计"])',
          desc: '@csentence(8,20)',
          memberCount: '@integer(1,40)',
          'status|1': ['启用', '启用', '启用', '停用'],
          updatedAt: '@datetime("yyyy-MM-dd HH:mm:ss")'
        })
      );
    });

    Mock.mock(new RegExp('/api/biz/system/op-logs'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(90, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          account: '@word(5,8)',
          action: '@pick(["用户查询","用户拉黑","角色管理","系统参数设置","操作日志查看"])',
          path: '@pick(["/user/query","/system/roles","/system-params/settings"])',
          ip: '@ip',
          content: '@csentence(10,24)',
          time: '@datetime("yyyy-MM-dd HH:mm:ss")'
        })
      );
    });

    Mock.mock(new RegExp('/api/biz/system-params'), 'get', () => ({
      loginPhone: true,
      loginEmail: true,
      loginPassword: true,
      registerAccount: true,
      inviteEnabled: true,
      inviteRequired: false,
      inviteExpireDays: 30,
      inviteMaxUse: 10,
      friendSearchById: true,
      allowCreateGroup: true,
      minGroupMembers: 3,
      maxGroupMembers: 500,
      groupVerify: true,
      defaultGroupVerify: true,
      joinExpireHours: 72,
      allowInviteFriend: true,
      allowAddFriendInGroup: true,
      allowEditGroupNick: true,
      msgText: true,
      msgImage: true,
      msgVideo: true,
      msgAudio: true,
      msgFile: true,
      msgVoice: true,
      msgCard: true,
      textMaxLen: 2000,
      multiSelect: true,
      multiSelectMax: 50,
      msgEdit: true,
      msgQuote: true,
      msgForward: true,
      msgDownload: true,
      pushPrivate: true,
      pushGroup: true,
      pushFriendGroupApply: true
    }));

    Mock.mock(new RegExp('/api/biz/system-params'), 'post', () => ({ ok: true }));

    Mock.mock(new RegExp('/api/biz/session/settings/group'), 'get', () => ({
      minGroupMembers: 3,
      maxGroupMembers: 30000,
      announcementMaxLen: 1000
    }));
    Mock.mock(new RegExp('/api/biz/session/settings/group'), 'post', () => ({
      ok: true
    }));

    Mock.mock(new RegExp('/api/biz/session/settings/user'), 'get', () => ({
      msgText: true,
      msgImage: true,
      msgVideo: true,
      msgAudio: true,
      msgFile: true,
      msgVoice: true,
      msgCard: true,
      textMaxLen: 1000,
      imageMaxMb: 10,
      videoMaxMb: 100,
      audioMaxMb: 100,
      fileMaxMb: 100,
      voiceMinSec: 2,
      voiceMaxSec: 60,
      albumMaxSelect: 12,
      multiSelect: true,
      multiSelectMax: 50
    }));
    Mock.mock(new RegExp('/api/biz/session/settings/user'), 'post', () => ({
      ok: true
    }));

    const financeItem = () =>
      Mock.mock({
        id: '@id',
        orderNo: /R[0-9]{14}/,
        userId: /1[0-9]{7}/,
        nickname: '@cname',
        amount: '@float(10,5000,2,2)',
        currency: '@pick(["CNY","USDT"])',
        channel: '@pick(["支付宝","微信","银行卡","链上"])',
        status: '@pick(["成功","处理中","失败","异常"])',
        createdAt: '@datetime("yyyy-MM-dd HH:mm:ss")'
      });

    Mock.mock(new RegExp('/api/biz/finance/recharge-orders'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(200, Number(q.page), Number(q.pageSize), financeItem);
    });
    Mock.mock(new RegExp('/api/biz/finance/recharge-abnormal'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(32, Number(q.page), Number(q.pageSize), financeItem);
    });
    Mock.mock(new RegExp('/api/biz/finance/recharge-channels'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(8, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          name: '@pick(["支付宝","微信","银行卡","USDT-TRC20"])',
          currency: '@pick(["CNY","USDT"])',
          feeRate: '@float(0,2,1,2)',
          status: '@pick(["启用","停用"])',
          updatedAt: '@datetime("yyyy-MM-dd HH:mm:ss")'
        })
      );
    });
    Mock.mock(new RegExp('/api/biz/finance/withdraw-audit'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(64, Number(q.page), Number(q.pageSize), financeItem);
    });
    Mock.mock(new RegExp('/api/biz/finance/withdraw-abnormal'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(20, Number(q.page), Number(q.pageSize), financeItem);
    });
    Mock.mock(new RegExp('/api/biz/finance/withdraw-channels'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(6, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          name: '@pick(["银行卡","支付宝","USDT"])',
          currency: '@pick(["CNY","USDT"])',
          minAmount: '@integer(10,100)',
          maxAmount: '@integer(5000,50000)',
          status: '@pick(["启用","停用"])',
          updatedAt: '@datetime("yyyy-MM-dd HH:mm:ss")'
        })
      );
    });

    Mock.mock(new RegExp('/api/biz/trade/redpacket-records'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(80, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          packetNo: /RP[0-9]{12}/,
          senderId: /1[0-9]{7}/,
          senderName: '@cname',
          type: '@pick(["拼手气","等额"])',
          currency: '@pick(["CNY","USDT"])',
          totalAmount: '@float(1,1000,2,2)',
          count: '@integer(1,50)',
          claimed: '@integer(0,50)',
          status: '@pick(["未开始","进行中","已结束","已过期","已退回"])',
          createdAt: '@datetime("yyyy-MM-dd HH:mm:ss")'
        })
      );
    });

    Mock.mock(new RegExp('/api/biz/trade/redpacket-detail/'), () =>
      Mock.mock({
        id: '@id',
        packetNo: /RP[0-9]{12}/,
        type: '拼手气',
        currency: 'CNY',
        totalAmount: 88.88,
        count: 10,
        claimed: 6,
        status: '进行中',
        senderId: /1[0-9]{7}/,
        senderName: '@cname',
        cover: '默认封面',
        createdAt: '@datetime("yyyy-MM-dd HH:mm:ss")',
        'claims|6': [
          {
            id: '@id',
            userId: /1[0-9]{7}/,
            nickname: '@cname',
            amount: '@float(1,20,2,2)',
            time: '@datetime("yyyy-MM-dd HH:mm:ss")'
          }
        ]
      })
    );

    Mock.mock(new RegExp('/api/biz/trade/redpacket-config'), 'get', () => ({
      defaultCover: 'default',
      luckyMin: 1,
      luckyMax: 100,
      equalMin: 1,
      equalMax: 50,
      expireHours: 24,
      hideClaimerWhileActive: true
    }));
    Mock.mock(new RegExp('/api/biz/trade/redpacket-config'), 'post', () => ({ ok: true }));

    Mock.mock(new RegExp('/api/biz/session/user'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(50, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          userId: /1[0-9]{7}/,
          nickname: '@cname',
          avatar: '',
          friendCount: '@integer(0,200)',
          groupCount: '@integer(0,50)',
          status: '@pick(["正常","黑名单","注销"])',
          lastActiveTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
        })
      );
    });

    Mock.mock(new RegExp('/api/biz/session/group'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(42, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          groupId: /11[0-9]{6}/,
          name: '@ctitle(4,10)',
          ownerId: /1[0-9]{7}/,
          ownerName: '@cname',
          memberCount: '@integer(3,500)',
          status: '@pick(["正常","已解散","封禁"])',
          avatar: '',
          ownerAvatar: '',
          createdAt: '@datetime("yyyy-MM-dd HH:mm:ss")'
        })
      );
    });

    Mock.mock(new RegExp('/api/biz/session/group-detail/'), () =>
      Mock.mock({
        id: '@id',
        groupId: /11[0-9]{6}/,
        name: '@ctitle(4,10)',
        ownerId: /1[0-9]{7}/,
        ownerName: '@cname',
        creatorName: '@cname',
        memberCount: 142,
        status: '@pick(["正常","已解散","封禁"])',
        announcement: '@cparagraph(1,2)',
        createdAt: '@datetime("yyyy-MM-dd HH:mm:ss")',
        lastActiveTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        joinMethod: '邀请加入',
        invitePermission: '开',
        speakPermission: '无限制',
        muteStatus: '不禁言',
        allowInvite: true,
        allowAddFriend: true,
        'admins|4': [
          {
            id: '@id',
            userId: /1[0-9]{7}/,
            nickname: '@cname',
            role: '管理员'
          }
        ],
        'logs|6': [
          {
            id: '@id',
            time: '@datetime("yyyy/MM/dd HH:mm:ss")',
            action:
              '@pick(["发布公告","修改昵称","修改群头像","设置管理员","创建群聊"])',
            detail: '@csentence(6,20)'
          }
        ],
        'members|20': [
          {
            id: '@id',
            userId: /1[0-9]{7}/,
            nickname: '@cname',
            avatar: '',
            role: '@pick(["群主","管理员","成员"])',
            joinTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
            account: /1[0-9]{10}/,
            phone: /1[3-9]\\d{9}/,
            sharedGroupCount: '@integer(0,8)',
            online: '@pick(["在线","离线"])',
            isF1: '@boolean'
          }
        ]
      })
    );

    Mock.mock(new RegExp('/api/biz/session/user-chat/'), () => {
      const groups = [
        {
          id: '1400817',
          name: 'DreamWeaver_',
          kind: 'group',
          sub: 'ID：1400817',
          memberCount: 86,
          onlineCount: 12,
          unread: 1,
          avatars: [] as string[]
        },
        {
          id: '1330856',
          name: '游戏达人max',
          kind: 'group',
          sub: 'ID：1330856',
          memberCount: 120,
          onlineCount: 22,
          avatars: [] as string[]
        },
        {
          id: '1523107',
          name: '美食家日记',
          kind: 'group',
          sub: 'ID：1523107',
          memberCount: 45,
          onlineCount: 8,
          avatars: [] as string[]
        },
        {
          id: '1600120',
          name: '登山俱乐部',
          kind: 'group',
          sub: 'ID：1600120',
          memberCount: 120,
          onlineCount: 22,
          avatars: [] as string[]
        }
      ];

      const contacts = [
        {
          id: '10086001',
          name: '美食家日记',
          kind: 'user' as const,
          online: true,
          starred: true,
          remark: '',
          source: '通过ID添加',
          addedAt: '2025年11月'
        },
        {
          id: '10086002',
          name: '彩虹糖果酱',
          kind: 'user' as const,
          online: true,
          starred: false,
          source: '通过二维码添加',
          addedAt: '2025年10月'
        },
        {
          id: '10086003',
          name: '一只小熊饼干',
          kind: 'user' as const,
          online: true,
          starred: false,
          source: '通过群聊添加',
          addedAt: '2025年9月'
        },
        {
          id: '10086004',
          name: 'TimeTraveler_',
          kind: 'user' as const,
          online: false,
          starred: false,
          source: '通过ID添加',
          addedAt: '2025年8月'
        },
        {
          id: '10086005',
          name: '快乐肥宅水',
          kind: 'user' as const,
          online: false,
          starred: false,
          source: '通过手机号添加',
          addedAt: '2025年7月'
        },
        {
          id: '10086006',
          name: '艺术家的梦',
          kind: 'user' as const,
          online: true,
          starred: false,
          source: '通过ID添加',
          addedAt: '2025年11月'
        },
        {
          id: '10086007',
          name: 'NekoChan_',
          kind: 'user' as const,
          online: false,
          starred: false,
          source: '通过ID添加',
          addedAt: '2025年6月'
        },
        {
          id: '10086008',
          name: '马戏团小丑',
          kind: 'user' as const,
          online: false,
          starred: false,
          source: '通过群聊添加',
          addedAt: '2025年5月'
        },
        {
          id: '10086009',
          name: '深海里的鱼_',
          kind: 'user' as const,
          online: true,
          starred: false,
          source: '通过ID添加',
          addedAt: '2025年11月'
        }
      ];

      const starred = contacts.filter((c) => c.starred);
      const rest = contacts.filter((c) => !c.starred);
      const contactSections = [
        { letter: 'A', items: rest.slice(0, 3) },
        { letter: 'B', items: rest.slice(3) }
      ];

      // 会话列表：单聊 + 群聊（Figma 791:32208 / 791:33221）
      const sessions = [
        {
          id: '10086101',
          name: 'Anan',
          kind: 'session' as const,
          online: true,
          lastMessage: '[动画表情]',
          time: '今日 12:00'
        },
        {
          id: '10086102',
          name: '南界',
          kind: 'session' as const,
          online: true,
          lastMessage: '你好，有没有想过……',
          time: '今日 12:00'
        },
        {
          id: '10086103',
          name: '王晨',
          kind: 'session' as const,
          online: false,
          muted: true,
          lastMessage: '好的',
          time: '今日 12:00'
        },
        {
          id: '10086104',
          name: '黎笑笑',
          kind: 'session' as const,
          online: true,
          lastMessage: '哈哈哈哈……',
          time: '今日 12:00'
        },
        {
          id: '10086105',
          name: '爱吃冰淇淋',
          kind: 'session' as const,
          online: true,
          lastMessage: '[语音]',
          time: '今日 12:00'
        },
        {
          id: '1600120',
          name: '登山俱乐部',
          kind: 'group' as const,
          memberCount: 120,
          onlineCount: 22,
          lastMessage: '张甜甜：明天去爬山吗？',
          time: '今日 12:00',
          avatars: [] as string[]
        }
      ];

      return {
        sessions,
        groups,
        starred,
        contactSections,
        groupCount: groups.length,
        contactCount: contacts.length
      };
    });

    Mock.mock(new RegExp('/api/biz/session/chat-history'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      const keyword = String(q.keyword || '').trim();
      const tab = String(q.tab || 'all');
      const uid = () => String(Mock.Random.guid());

      // 无结果：关键词为「无」或「zzz」
      if (keyword && /^(无|zzz|none)$/i.test(keyword)) {
        return { list: [], mediaGroups: [], fileGroups: [] };
      }

      const kw = keyword || '好';
      const templates = [
        { senderName: 'Anan', content: `${kw}的`, time: '12:00' },
        { senderName: 'Anan', content: `可以可以${kw}的吧`, time: '12:00' },
        { senderName: 'Anan', content: `我觉得这样挺${kw}`, time: '12:01' },
        { senderName: '王晨', content: `${kw}主意`, time: '11:20' },
        { senderName: '王晨', content: `这个方案${kw}不错`, time: '11:18' },
        { senderName: 'Anan', content: `嗯嗯，那就按这个${kw}`, time: '11:15' },
        { senderName: 'Philip', content: `我同意，挺${kw}的`, time: '10:50' },
        { senderName: 'Shawn', content: `还有别的${kw}选吗`, time: '10:42' }
      ];
      // 撑到 60+ 条，触发聊天记录虚拟列表 threshold
      const list = Array.from({ length: 64 }, (_, i) => {
        const t = templates[i % templates.length];
        return {
          id: uid(),
          senderName: t.senderName,
          content: i < templates.length ? t.content : `${t.content}（${i + 1}）`,
          time: t.time,
          dateLabel: '2025年10月20日'
        };
      });

      const mediaGroups = [
        {
          month: '这个月',
          items: [
            { id: uid(), kind: 'image' },
            { id: uid(), kind: 'video' },
            { id: uid(), kind: 'image' },
            { id: uid(), kind: 'image' }
          ]
        },
        {
          month: '2026年3月',
          items: [{ id: uid(), kind: 'image' }]
        },
        {
          month: '2026年2月',
          items: [
            { id: uid(), kind: 'video' },
            { id: uid(), kind: 'image' }
          ]
        }
      ];

      const fileGroups = [
        {
          month: '2026年3月',
          items: [
            {
              id: uid(),
              senderName: '王晨',
              content: '',
              time: '4月15日',
              fileName: 'word-file.docx',
              fileSize: '217 KB',
              fileExt: 'DOC'
            }
          ]
        },
        {
          month: '2025年7月',
          items: [
            {
              id: uid(),
              senderName: '王晨',
              content: '',
              time: '2025年7月3日',
              fileName: 'pdf-file.pdf',
              fileSize: '217 KB',
              fileExt: 'PDF'
            },
            {
              id: uid(),
              senderName: 'Anan',
              content: '',
              time: '2025年7月1日',
              fileName: 'file.zip',
              fileSize: '217 KB',
              fileExt: 'ZIP'
            }
          ]
        }
      ];

      if (tab === 'media') {
        return { list: [], mediaGroups, fileGroups: [] };
      }
      if (tab === 'file') {
        return { list: [], mediaGroups: [], fileGroups };
      }
      if (tab === 'date') {
        return { list, mediaGroups: [], fileGroups: [] };
      }
      return { list, mediaGroups, fileGroups };
    });

    Mock.mock(new RegExp('/api/biz/session/chat(\\?|$)'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      const isGroup = q.type === 'group';
      const peerId = String(q.id || '');
      const list = buildChatMockMessages(isGroup, peerId);
      const page = Number(q.page) || 1;
      const pageSize = Number(q.pageSize) || 50;
      const start = (page - 1) * pageSize;
      return {
        list: list.slice(start, start + pageSize),
        total: list.length
      };
    });
  }
});

/** 固定会话脚本，贴合查聊天 Modal 消息类型（文字/语音/文件/通话/日期） */
function buildChatMockMessages(isGroup: boolean, peerId: string) {
  const uid = () => String(Mock.Random.guid());
  /** 在脚本前插入填充消息，保留脚本在底部（最新），便于验证虚拟列表 */
  const padMessages = (
    base: Array<Record<string, unknown>>,
    peerName: string,
    target = 100
  ) => {
    if (base.length >= target) return base;
    const samples = [
      '收到，我这边再确认一下。',
      '好的，那就按这个来。',
      '稍等，我翻一下之前的记录。',
      '这个点可以，我到时候提醒你。',
      '明白了，辛苦。'
    ];
    const filler: Array<Record<string, unknown>> = [
      { id: uid(), side: 'peer', msgType: 'date', dateLabel: '更早' }
    ];
    for (let i = filler.length; i < target - base.length; i += 1) {
      const self = i % 3 !== 0;
      filler.push({
        id: uid(),
        side: self ? 'self' : 'peer',
        msgType: 'text',
        ...(self ? {} : { senderName: peerName }),
        content: `${samples[i % samples.length]} #${i}`,
        time: `${String(8 + (i % 10)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`
      });
    }
    return [...filler, ...base];
  };

  if (isGroup) {
    return padMessages([
      { id: uid(), side: 'peer', msgType: 'date', dateLabel: '5月11日' },
      {
        id: uid(),
        side: 'self',
        msgType: 'text',
        content: '快来一起爬山😎',
        time: '12:00'
      },
      {
        id: uid(),
        side: 'self',
        msgType: 'text',
        content:
          '为什么天空是蓝色的？简单说是瑞利散射：阳光里的短波蓝光更容易被大气分子散射，所以白天天空看起来偏蓝。',
        time: '12:00'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'text',
        senderName: 'Philip',
        content: '好哇，+1😎',
        time: '12:01'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'text',
        senderName: 'Shawn',
        content: '需要带什么装备吗？',
        time: '12:02'
      },
      { id: uid(), side: 'peer', msgType: 'date', dateLabel: '5月12日' },
      {
        id: uid(),
        side: 'self',
        msgType: 'call',
        content: '通话时长 00:10',
        time: '09:20'
      },
      {
        id: uid(),
        side: 'self',
        msgType: 'call',
        content: '视频通话',
        callStatus: '已拒绝',
        time: '09:21'
      },
      {
        id: uid(),
        side: 'self',
        msgType: 'call',
        content: '通话时长 00:08',
        time: '09:30'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'call',
        senderName: 'Philip',
        content: '视频通话',
        callStatus: '已拒绝',
        time: '09:31'
      },
      { id: uid(), side: 'peer', msgType: 'date', dateLabel: '昨天' },
      {
        id: uid(),
        side: 'self',
        msgType: 'voice',
        duration: '4"',
        time: '18:00'
      },
      {
        id: uid(),
        side: 'self',
        msgType: 'file',
        fileName: 'word-file.docx',
        fileSize: '217 KB',
        time: '18:02'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'file',
        senderName: 'Shawn',
        fileName: 'word-file.docx',
        fileSize: '217 KB',
        time: '18:05'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'text',
        senderName: '张甜甜',
        content: '明天去爬山吗？',
        time: '19:10'
      }
    ], '张甜甜');
  }

  // 单聊：按联系人给几套不同文案，避免每次都一样
  const scripts: Record<string, Array<Record<string, unknown>>> = {
    '10086002': [
      { id: uid(), side: 'peer', msgType: 'date', dateLabel: '昨天' },
      {
        id: uid(),
        side: 'peer',
        msgType: 'text',
        senderName: '彩虹糖果酱',
        content: '明天有空吗？想请你帮忙看一下方案。',
        time: '21:10'
      },
      {
        id: uid(),
        side: 'self',
        msgType: 'text',
        content: '可以，下午三点之后都行。',
        time: '21:12'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'voice',
        senderName: '彩虹糖果酱',
        duration: '6"',
        time: '21:13'
      },
      { id: uid(), side: 'peer', msgType: 'date', dateLabel: '今天' },
      {
        id: uid(),
        side: 'self',
        msgType: 'file',
        fileName: '方案备注.pdf',
        fileSize: '1.2 MB',
        time: '09:08'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'text',
        senderName: '彩虹糖果酱',
        content: '好的，那明天见',
        time: '09:12'
      }
    ],
    '10086003': [
      { id: uid(), side: 'peer', msgType: 'date', dateLabel: '昨天' },
      {
        id: uid(),
        side: 'self',
        msgType: 'text',
        content: '在吗？快递到了你帮我收一下。',
        time: '18:20'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'text',
        senderName: '一只小熊饼干',
        content: '好，我在家。',
        time: '18:21'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'voice',
        senderName: '一只小熊饼干',
        duration: '8"',
        time: '18:22'
      },
      {
        id: uid(),
        side: 'self',
        msgType: 'call',
        content: '通话时长 00:42',
        time: '18:25'
      }
    ],
    '10086001': [
      { id: uid(), side: 'peer', msgType: 'date', dateLabel: '昨天' },
      {
        id: uid(),
        side: 'peer',
        msgType: 'text',
        senderName: '美食家日记',
        content: '那家店真的绝了，周末再去一次？',
        time: '20:01'
      },
      {
        id: uid(),
        side: 'self',
        msgType: 'text',
        content: '行，我订位子。你还是老样子？',
        time: '20:03'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'text',
        senderName: '美食家日记',
        content: '嗯，少辣。对了菜单我发你。',
        time: '20:04'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'file',
        senderName: '美食家日记',
        fileName: '菜单.jpg',
        fileSize: '860 KB',
        time: '20:05'
      }
    ],
    '10086005': [
      { id: uid(), side: 'peer', msgType: 'date', dateLabel: '周一' },
      {
        id: uid(),
        side: 'self',
        msgType: 'call',
        content: '通话时长 00:10',
        time: '14:02'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'text',
        senderName: '快乐肥宅水',
        content: '刚才信号不好，你再说一遍？',
        time: '14:03'
      },
      {
        id: uid(),
        side: 'self',
        msgType: 'voice',
        duration: '12"',
        time: '14:04'
      },
      {
        id: uid(),
        side: 'peer',
        msgType: 'text',
        senderName: '快乐肥宅水',
        content: '明白了，我这边处理。',
        time: '14:06'
      }
    ]
  };

  if (scripts[peerId]) {
    const name =
      (scripts[peerId].find((m) => m.senderName)?.senderName as string) ||
      '对方';
    return padMessages(scripts[peerId], name);
  }

  // 默认单聊脚本（对齐 Figma 791:32208 Anan）
  const peerName = peerId === '10086101' ? 'Anan' : '对方';
  return padMessages([
    { id: uid(), side: 'peer', msgType: 'date', dateLabel: '5月11日' },
    {
      id: uid(),
      side: 'self',
      msgType: 'text',
      content: '快来一起爬山😎',
      time: '12:00'
    },
    {
      id: uid(),
      side: 'self',
      msgType: 'text',
      content:
        '为什么天空是蓝色的？简单说是瑞利散射：阳光里的短波蓝光更容易被大气分子散射，所以白天天空看起来偏蓝。',
      time: '12:00'
    },
    {
      id: uid(),
      side: 'peer',
      msgType: 'system',
      content:
        '你已添加了爱吃冰淇淋，通过了你的朋友验证请求，以上是打招呼的消息。'
    },
    { id: uid(), side: 'peer', msgType: 'date', dateLabel: '5月12日' },
    {
      id: uid(),
      side: 'peer',
      msgType: 'text',
      senderName: peerId === '10086101' ? 'Anan' : '对方',
      content: '好啊，几点出发？',
      time: '09:10'
    },
    {
      id: uid(),
      side: 'self',
      msgType: 'call',
      content: '通话时长 00:10',
      time: '09:20'
    },
    {
      id: uid(),
      side: 'peer',
      msgType: 'call',
      senderName: peerId === '10086101' ? 'Anan' : '对方',
      content: '视频通话',
      callStatus: '已拒绝',
      time: '09:21'
    },
    {
      id: uid(),
      side: 'self',
      msgType: 'call',
      content: '通话时长 00:08',
      time: '09:30'
    },
    { id: uid(), side: 'peer', msgType: 'date', dateLabel: '昨天' },
    {
      id: uid(),
      side: 'self',
      msgType: 'file',
      fileName: 'word-file.docx',
      fileSize: '217 KB',
      time: '18:02'
    },
    {
      id: uid(),
      side: 'peer',
      msgType: 'file',
      senderName: peerId === '10086101' ? 'Anan' : '对方',
      fileName: '行程安排.docx',
      fileSize: '128 KB',
      time: '18:05'
    },
    {
      id: uid(),
      side: 'self',
      msgType: 'image',
      time: '18:10'
    },
    {
      id: uid(),
      side: 'self',
      msgType: 'video',
      time: '18:11'
    },
    {
      id: uid(),
      side: 'peer',
      msgType: 'image',
      senderName: peerId === '10086101' ? 'Anan' : '对方',
      time: '18:12'
    },
    {
      id: uid(),
      side: 'peer',
      msgType: 'video',
      senderName: peerId === '10086101' ? 'Anan' : '对方',
      time: '18:13'
    },
    { id: uid(), side: 'peer', msgType: 'date', dateLabel: '今天' },
    {
      id: uid(),
      side: 'peer',
      msgType: 'text',
      senderName: peerId === '10086101' ? 'Anan' : '对方',
      content: '嗯',
      time: '12:00'
    },
    {
      id: uid(),
      side: 'self',
      msgType: 'text',
      content: '快来一起爬山🤓',
      time: '12:00'
    }
  ], peerName);
}