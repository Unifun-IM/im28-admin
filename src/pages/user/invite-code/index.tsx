import React, { useCallback, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Input,
  Message,
  Tooltip,
  Tree
} from '@arco-design/web-react';
import type { TreeDataType } from '@arco-design/web-react/es/Tree/interface';
import {
  IconCopy,
  IconRefresh,
  IconSearch,
  IconExpand,
  IconUserGroup
} from '@arco-design/web-react/icon';
import copy from 'copy-to-clipboard';
import {
  getUserHierarchy,
  type UserHierarchyNode
} from '@shared/api/biz';
import emptyState from '@shared/assets/empty-state.svg';

/**
 * 用户层级查询 — Figma 741:35915（空态）/ 770:19037（结果）
 * 菜单由「邀请码查询」更名为「用户层级查询」
 */
export default function Page() {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [queried, setQueried] = useState(false);
  const [treeData, setTreeData] = useState<UserHierarchyNode[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const collectKeys = useCallback((nodes: UserHierarchyNode[]): string[] => {
    const keys: string[] = [];
    const walk = (list: UserHierarchyNode[]) => {
      list.forEach((n) => {
        keys.push(n.key);
        if (n.children?.length) walk(n.children);
      });
    };
    walk(nodes);
    return keys;
  }, []);

  const fetchTree = useCallback(
    async (id: string) => {
      const trimmed = id.trim();
      if (!trimmed) {
        Message.warning('请输入用户ID');
        return;
      }
      setLoading(true);
      try {
        const res = await getUserHierarchy(trimmed);
        const root = res.tree;
        const list = root ? [root] : [];
        setTreeData(list);
        setQueried(true);
        setExpandedKeys(collectKeys(list));
      } finally {
        setLoading(false);
      }
    },
    [collectKeys]
  );

  const onClear = () => {
    setUserId('');
    setTreeData([]);
    setQueried(false);
    setExpandedKeys([]);
  };

  const onExpandAll = () => {
    setExpandedKeys(collectKeys(treeData));
  };

  const treeNodes = useMemo(
    () => treeData as unknown as TreeDataType[],
    [treeData]
  );

  const renderTitle = (node: TreeDataType) => {
    const item = node as unknown as UserHierarchyNode;
    return (
      <div className="flex min-w-0 flex-1 items-center gap-[8px] py-[8px] pr-[12px]">
        <Avatar size={24} className="shrink-0">
          {item.avatar ? (
            <img alt="" src={item.avatar} />
          ) : (
            String(item.nickname || '?').slice(0, 1)
          )}
        </Avatar>
        <div className="min-w-0 shrink">
          <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] leading-[12px] text-arco-text-1">
            {item.nickname}
          </div>
          <div className="mt-[4px] flex items-center gap-[4px] text-[10px] leading-[10px] text-arco-text-3">
            <span>ID：{item.userId}</span>
            <button
              type="button"
              className="inline-flex size-[10px] shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-arco-text-4 hover:text-arco-text-2"
              aria-label="复制"
              onClick={(e) => {
                e.stopPropagation();
                copy(String(item.userId || ''));
                Message.success('已复制');
              }}
            >
              <IconCopy className="text-[10px]" />
            </button>
          </div>
        </div>
        {item.role === 'parent' && (
          <span className="inline-flex h-[24px] shrink-0 items-center rounded-[4px] bg-[rgb(var(--primary-1))] px-[8px] text-[12px] leading-[20px] text-[rgb(var(--primary-6))]">
            上级
          </span>
        )}
        {item.role === 'target' && (
          <span className="inline-flex h-[24px] shrink-0 items-center rounded-[4px] bg-[rgb(var(--primary-6))] px-[8px] text-[12px] leading-[20px] text-white">
            目标
          </span>
        )}
        <span className="inline-flex h-[24px] shrink-0 items-center gap-[4px] rounded-[4px] bg-[var(--color-fill-2,#f2f3f5)] px-[8px] text-[12px] leading-[18px] text-arco-text-1">
          <IconUserGroup className="text-[12px] text-arco-text-2" />
          <span className="font-medium">{item.childCount ?? 0}</span>
        </span>
        <div className="ml-auto shrink-0 text-[12px] leading-[20px] text-arco-text-1">
          {item.inviteCode || '--'}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-[12px]">
      <Card
        bordered
        className="!rounded-[8px] !border-[rgba(0,0,0,0.08)]"
        bodyStyle={{ padding: 12 }}
      >
        <div className="flex flex-wrap items-end gap-[8px]">
          <div className="flex w-[224px] flex-col gap-[8px]">
            <div className="text-[12px] leading-[12px] text-arco-text-2">
              用户查询
            </div>
            <Input
              allowClear
              value={userId}
              placeholder="请输入用户ID"
              suffix={<IconSearch className="text-arco-text-3" />}
              onChange={setUserId}
              onPressEnter={() => fetchTree(userId)}
            />
          </div>
          <div className="flex flex-1 flex-wrap items-end justify-end gap-[8px]">
            <Button
              type="text"
              className="!h-8 !px-0 !text-[12px] !leading-[20px] !text-[rgb(var(--primary-6))]"
              onClick={onClear}
            >
              清除全部
            </Button>
            <Button
              type="primary"
              className="!min-w-[80px]"
              loading={loading}
              onClick={() => fetchTree(userId)}
            >
              查询
            </Button>
          </div>
        </div>
      </Card>

      <Card
        bordered
        className="!rounded-[8px] !border-[rgba(0,0,0,0.08)] !overflow-hidden"
        bodyStyle={{ padding: 0 }}
      >
        <div className="box-border flex h-[48px] items-center justify-between border-0 border-b border-solid border-[rgba(0,0,0,0.08)] px-[12px]">
          <div className="text-[14px] font-medium leading-[21px] text-arco-text-1">
            用户层级关系列表
          </div>
          <div className="flex items-center gap-[8px]">
            <Tooltip content="刷新">
              <Button
                className="!h-8 !w-8 !rounded-[8px] !p-0"
                icon={<IconRefresh />}
                disabled={!queried}
                onClick={() => fetchTree(userId)}
              />
            </Tooltip>
            <Tooltip content="展开全部">
              <Button
                className="!h-8 !w-8 !rounded-[8px] !p-0"
                icon={<IconExpand />}
                disabled={!treeData.length}
                onClick={onExpandAll}
              />
            </Tooltip>
          </div>
        </div>

        {!queried || !treeData.length ? (
          <div className="flex flex-col items-center py-[12px]">
            <img
              alt=""
              src={emptyState}
              className="block h-[100px] w-[133px] max-w-none"
            />
            <div className="text-[14px] leading-[21px] text-arco-text-1">
              请输入用户ID进行查询
            </div>
            <div className="text-[14px] leading-[21px] text-arco-text-3">
              输入完整用户ID后点击查询，即可查看用户邀请关系
            </div>
          </div>
        ) : (
          <div className="use-user-hierarchy-tree box-border px-[12px] pb-[12px] pt-[4px]">
            <div className="mb-[4px] flex h-[40px] items-center border-0 border-b border-solid border-[rgba(0,0,0,0.08)] px-[12px] text-[12px] leading-[20px] text-arco-text-3">
              <span className="flex-1">用户信息</span>
              <span className="w-[80px] shrink-0 text-right">邀请码</span>
            </div>
            <Tree
              blockNode
              autoExpandParent
              treeData={treeNodes}
              expandedKeys={expandedKeys}
              onExpand={(keys) => setExpandedKeys(keys as string[])}
              fieldNames={{
                key: 'key',
                title: 'nickname',
                children: 'children'
              }}
              renderTitle={renderTitle}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
