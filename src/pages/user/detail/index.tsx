import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserDetailDrawer from './UserDetailDrawer';

/**
 * 用户详情路由页：打开 Drawer，关闭后回到用户查询
 * Figma 666:21862 / 750:23153
 */
export default function UserDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  return (
    <UserDetailDrawer
      visible
      userId={id}
      onClose={() => navigate('/user/query')}
    />
  );
}
