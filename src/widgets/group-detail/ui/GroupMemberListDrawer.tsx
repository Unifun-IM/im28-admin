import React, { useEffect, useMemo, useState } from 'react';
import { Drawer, Input, Spin } from '@arco-design/web-react';
import { IconLeft, IconRight, IconSearch } from '@arco-design/web-react/icon';
import { postV1AdminGroupsMembersList } from '@shared/api/admin/groups';
import {
  GroupRoleTag,
  groupRoleNameStyle,
  UserAvatar
} from '@shared/ui';
import useLocale from '@shared/lib/useLocale';
import {
  mapGroupMemberSeed,
  type GroupMemberDetailSeed
} from '../model/group-member';
import GroupMemberDetailDrawer from './GroupMemberDetailDrawer';
import '@shared/ui/biz-entity-detail.less';

export type GroupMemberListDrawerProps = {
  visible: boolean;
  groupId?: string | null;
  /** 群成员总数（展示用，无则用列表 length） */
  memberTotal?: number;
  onClose: () => void;
};

/**
 * 群详情 · 群成员列表（独立 Drawer，样式与原先内嵌列表一致）
 * 点成员 → 独立 GroupMemberDetailDrawer
 */
export default function GroupMemberListDrawer({
  visible,
  groupId,
  memberTotal,
  onClose
}: GroupMemberListDrawerProps) {
  const t = useLocale();
  const [loading, setLoading] = useState(false);
  const [wraps, setWraps] = useState<AdminAPI.AdminGroupMemberWrap[]>([]);
  const [keyword, setKeyword] = useState('');
  const [detailSeed, setDetailSeed] = useState<GroupMemberDetailSeed | null>(
    null
  );

  useEffect(() => {
    if (!visible) return;
    setKeyword('');
    setDetailSeed(null);
  }, [visible, groupId]);

  useEffect(() => {
    if (!visible || !groupId) return;
    let cancelled = false;
    setLoading(true);
    postV1AdminGroupsMembersList({
      group_id: groupId,
      page: 1,
      page_size: 100
    })
      .then((res) => {
        if (cancelled) return;
        setWraps(res.data?.list || []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, groupId]);

  const members = useMemo(
    () => wraps.map((wrap) => mapGroupMemberSeed(wrap)),
    [wraps]
  );

  const filteredMembers = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        String(m.nickname || '')
          .toLowerCase()
          .includes(q) ||
        String(m.userId || '')
          .toLowerCase()
          .includes(q)
    );
  }, [members, keyword]);

  const total = memberTotal ?? members.length;

  return (
    <>
      <Drawer
        className="use-user-detail-drawer use-group-detail-drawer"
        width="50%"
        visible={visible}
        placement="right"
        title={
          <div className="flex w-full items-center gap-[16px]">
            <button
              type="button"
              className="inline-flex size-4 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-1"
              aria-label={t['groupDetail.back']}
              onClick={onClose}
            >
              <IconLeft className="text-[16px]" />
            </button>
            <span>{t['groupDetail.members.title']}</span>
          </div>
        }
        footer={null}
        unmountOnExit
        maskClosable
        onCancel={onClose}
      >
        <Spin loading={loading} className="use-user-detail-drawer-spin">
          <div className="use-user-detail-drawer-body">
            <div className="flex flex-col gap-[12px]">
              <Input
                allowClear
                placeholder={t['groupDetail.members.search']}
                prefix={<IconSearch className="text-arco-text-3" />}
                value={keyword}
                onChange={setKeyword}
              />
              <div className="text-[14px] leading-[21px] text-arco-text-2">
                {t['groupDetail.members.total'].replace(
                  '{n}',
                  String(keyword.trim() ? filteredMembers.length : total)
                )}
              </div>
              <div className="flex flex-col gap-[16px]">
                {filteredMembers.map((m) => (
                  <button
                    key={m.userId}
                    type="button"
                    className="flex min-h-[56px] w-full cursor-pointer items-center justify-between border-0 bg-transparent p-0 text-left"
                    onClick={() => setDetailSeed(m)}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-[16px]">
                      <UserAvatar
                        size={40}
                        className="use-user-detail-avatar shrink-0 !text-[14px]"
                        userId={m.userId}
                        name={m.nickname}
                        src={m.avatar}
                      />
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-1">
                          <span
                            className="truncate text-[14px] font-medium leading-[21px] text-arco-text-2"
                            style={groupRoleNameStyle(m.userId, m.roleLevel)}
                          >
                            {m.nickname || '-'}
                          </span>
                          <GroupRoleTag
                            userId={m.userId}
                            roleLevel={m.roleLevel}
                          />
                        </div>
                        <div className="text-[12px] leading-[20px] text-arco-text-3">
                          ID：{m.userId || '-'}
                        </div>
                      </div>
                    </div>
                    <IconRight className="text-[16px] text-arco-text-3" />
                  </button>
                ))}
                {!loading && !filteredMembers.length ? (
                  <div className="py-8 text-center text-[12px] text-arco-text-3">
                    {t['groupDetail.members.empty']}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </Spin>
      </Drawer>
      <GroupMemberDetailDrawer
        visible={!!detailSeed?.userId}
        userId={detailSeed?.userId}
        seed={detailSeed}
        onClose={() => setDetailSeed(null)}
      />
    </>
  );
}
