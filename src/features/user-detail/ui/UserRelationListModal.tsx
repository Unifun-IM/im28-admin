import React, { useCallback, useEffect, useState } from 'react';
import { Drawer, Table } from '@arco-design/web-react';
import {
  postV1AdminUsersContactsList
} from '@shared/api/admin/users';
import { postV1AdminGroupsListByUser } from '@shared/api/admin/groups';
import { AvatarNameCell } from '@widgets/biz-list';
import useLocale from '@shared/lib/useLocale';
import { formatDateTime } from '@shared/lib/formatTime';
import { imLabel } from '@shared/lib/imLabels';
import '@shared/ui/biz-detail-table.less';

export type UserRelationListModalProps = {
  visible: boolean;
  mode: 'friends' | 'groups';
  userId?: string | null;
  onClose: () => void;
};

const noWrapCell = { whiteSpace: 'nowrap' as const };

/**
 * 用户详情 · 好友 / 群聊列表
 * @see postV1AdminUsersContactsList / postV1AdminGroupsListByUser
 */
export default function UserRelationListModal({
  visible,
  mode,
  userId,
  onClose
}: UserRelationListModalProps) {
  const t = useLocale();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [total, setTotal] = useState(0);
  const [friends, setFriends] = useState<AdminAPI.AdminUserContactWrap[]>([]);
  const [groups, setGroups] = useState<AdminAPI.AdminUserGroupWrap[]>([]);

  const isFriends = mode === 'friends';

  const fetchData = useCallback(
    async (p = page, size = pageSize) => {
      if (!userId) {
        setFriends([]);
        setGroups([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      try {
        if (isFriends) {
          const res = await postV1AdminUsersContactsList({
            user_id: userId,
            page: p,
            page_size: size
          });
          setFriends(res.data?.list || []);
          setTotal(res.data?.total || 0);
        } else {
          const res = await postV1AdminGroupsListByUser({
            user_id: userId,
            page: p,
            page_size: size
          });
          setGroups(res.data?.list || []);
          setTotal(res.data?.total || 0);
        }
      } finally {
        setLoading(false);
      }
    },
    [userId, isFriends, page, pageSize]
  );

  useEffect(() => {
    if (!visible) return;
    setPage(1);
    fetchData(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, mode, userId]);

  const friendColumns = [
    {
      title: t['userDetail.relation.col.friend'],
      render: (_: unknown, row: AdminAPI.AdminUserContactWrap) => {
        const user = row.user;
        const friend = row.friend;
        const name =
          friend?.alias || user?.nickname || user?.account || user?.user_id;
        return (
          <AvatarNameCell
            name={name}
            sub={`${t['userDetail.relation.cell.userId']}：${user?.user_id || friend?.friend_user_id || ''}`}
            copyText={user?.user_id || friend?.friend_user_id || ''}
            avatar={user?.avatar_url}
            userId={user?.user_id || friend?.friend_user_id}
          />
        );
      }
    },
    {
      title: t['userDetail.relation.col.remark'],
      width: 140,
      ellipsis: true,
      bodyCellStyle: noWrapCell,
      render: (_: unknown, row: AdminAPI.AdminUserContactWrap) =>
        row.friend?.remark || row.friend?.alias || '--'
    },
    {
      title: t['userDetail.relation.col.source'],
      width: 120,
      ellipsis: true,
      bodyCellStyle: noWrapCell,
      render: (_: unknown, row: AdminAPI.AdminUserContactWrap) =>
        imLabel(t, 'sourceType', row.friend?.source_type)
    },
    {
      title: t['userDetail.relation.col.starred'],
      width: 72,
      ellipsis: true,
      bodyCellStyle: noWrapCell,
      render: (_: unknown, row: AdminAPI.AdminUserContactWrap) =>
        row.friend?.is_starred
          ? t['userDetail.relation.starred.yes']
          : t['userDetail.relation.starred.no']
    },
    {
      title: t['userDetail.relation.col.addedAt'],
      width: 200,
      ellipsis: true,
      bodyCellStyle: noWrapCell,
      render: (_: unknown, row: AdminAPI.AdminUserContactWrap) => (
        <span className="whitespace-nowrap">
          {formatDateTime(row.friend?.created_at)}
        </span>
      )
    }
  ];

  const groupColumns = [
    {
      title: t['userDetail.relation.col.group'],
      render: (_: unknown, row: AdminAPI.AdminUserGroupWrap) => {
        const group = row.group;
        return (
          <AvatarNameCell
            name={group?.title || group?.group_id}
            sub={`${t['userDetail.relation.cell.groupId']}：${group?.group_id || ''}`}
            copyText={group?.group_id || ''}
            avatar={group?.avatar_url}
            userId={group?.group_id}
          />
        );
      }
    },
    {
      title: t['userDetail.relation.col.groupNickname'],
      width: 140,
      ellipsis: true,
      bodyCellStyle: noWrapCell,
      render: (_: unknown, row: AdminAPI.AdminUserGroupWrap) =>
        row.member?.nickname || '--'
    },
    {
      title: t['userDetail.relation.col.role'],
      width: 120,
      ellipsis: true,
      bodyCellStyle: noWrapCell,
      render: (_: unknown, row: AdminAPI.AdminUserGroupWrap) => (
        <span className="whitespace-nowrap">
          {imLabel(t, 'roleLevel', row.member?.role) || '--'}
        </span>
      )
    },
    {
      title: t['userDetail.relation.col.joinedAt'],
      width: 200,
      ellipsis: true,
      bodyCellStyle: noWrapCell,
      render: (_: unknown, row: AdminAPI.AdminUserGroupWrap) => (
        <span className="whitespace-nowrap">
          {formatDateTime(row.member?.joined_at)}
        </span>
      )
    },
    {
      title: t['userDetail.relation.col.muted'],
      width: 72,
      ellipsis: true,
      bodyCellStyle: noWrapCell,
      render: (_: unknown, row: AdminAPI.AdminUserGroupWrap) =>
        row.member?.is_muted
          ? t['userDetail.relation.muted.yes']
          : t['userDetail.relation.muted.no']
    }
  ];

  return (
    <Drawer
      width={880}
      title={
        isFriends
          ? t['userDetail.relation.friendsTitle']
          : t['userDetail.relation.groupsTitle']
      }
      visible={visible}
      onCancel={onClose}
      footer={null}
      unmountOnExit
    >
      {isFriends ? (
        <Table
          className="use-biz-detail-table"
          loading={loading}
          rowKey={(row) =>
            row.user?.user_id ||
            row.friend?.friend_user_id ||
            String(Math.random())
          }
          data={friends}
          columns={friendColumns}
          scroll={{ x: 780 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showTotal: true,
            onChange: (p, s) => {
              setPage(p);
              setPageSize(s);
              fetchData(p, s);
            }
          }}
        />
      ) : (
        <Table
          className="use-biz-detail-table"
          loading={loading}
          rowKey={(row) => row.group?.group_id || String(Math.random())}
          data={groups}
          columns={groupColumns}
          scroll={{ x: 780 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showTotal: true,
            onChange: (p, s) => {
              setPage(p);
              setPageSize(s);
              fetchData(p, s);
            }
          }}
        />
      )}
    </Drawer>
  );
}
