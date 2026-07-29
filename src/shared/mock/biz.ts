import Mock from 'mockjs';
import qs from 'query-string';
import setupMock from '@shared/lib/setupMock';

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
          'list|5': [
            {
              id: '@id',
              action: '@pick(["登录账号","修改昵称","绑定手机号","加入群聊"])',
              client: '@pick(["iOS","Android","Web"])',
              time: '@datetime("yyyy-MM-dd HH:mm:ss")',
              ip: '@ip'
            }
          ]
        }
      })
    );

    Mock.mock(new RegExp('/api/biz/user/logs'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(56, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          userId: /1[0-9]{7}/,
          nickname: '@cname',
          action: '@pick(["登录账号","登录失败","修改资料","好友关系","群聊","消息操作"])',
          client: '@pick(["iOS","Android","Web","PC"])',
          time: '@datetime("yyyy-MM-dd HH:mm:ss")',
          ip: '@ip',
          detail: '@csentence(8,20)'
        })
      );
    });

    Mock.mock(new RegExp('/api/biz/user/blacklist/action'), () => ({ ok: true }));
    Mock.mock(new RegExp('/api/biz/user/whitelist/action'), () => ({ ok: true }));

    Mock.mock(new RegExp('/api/biz/user/blacklist(\\?|$)'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(24, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          userId: /1[0-9]{7}/,
          nickname: '@cname',
          reason: '@csentence(6,16)',
          operator: '@cname',
          time: '@datetime("yyyy-MM-dd HH:mm:ss")'
        })
      );
    });

    Mock.mock(new RegExp('/api/biz/user/whitelist(\\?|$)'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(18, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          userId: /1[0-9]{7}/,
          nickname: '@cname',
          remark: '@csentence(4,12)',
          operator: '@cname',
          time: '@datetime("yyyy-MM-dd HH:mm:ss")'
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
          peerId: /1[0-9]{7}/,
          peerName: '@cname',
          lastMessage: '@csentence(4,16)',
          unread: '@integer(0,20)',
          updatedAt: '@datetime("yyyy-MM-dd HH:mm:ss")'
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
          status: '@pick(["正常","已解散","禁言"])',
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
        memberCount: 142,
        status: '正常',
        announcement: '@cparagraph(1,2)',
        createdAt: '@datetime("yyyy-MM-dd HH:mm:ss")',
        allowInvite: true,
        allowAddFriend: true,
        speakPermission: '全员',
        'members|10': [
          {
            id: '@id',
            userId: /1[0-9]{7}/,
            nickname: '@cname',
            role: '@pick(["群主","管理员","成员"])',
            joinTime: '@datetime("yyyy-MM-dd HH:mm:ss")'
          }
        ]
      })
    );

    Mock.mock(new RegExp('/api/biz/session/chat'), (options: { url: string }) => {
      const q = parseQuery(options.url);
      return pageList(120, Number(q.page), Number(q.pageSize), () =>
        Mock.mock({
          id: '@id',
          senderId: /1[0-9]{7}/,
          senderName: '@cname',
          type: '@pick(["文字","图片","文件","名片"])',
          content: '@csentence(5,30)',
          time: '@datetime("yyyy-MM-dd HH:mm:ss")'
        })
      );
    });
  }
});
